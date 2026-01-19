import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCodeForTokens, getUserEmail } from '@/lib/google-oauth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        new URL('/dashboard/integrations/google-sheets?error=access_denied', request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations/google-sheets?error=no_code', request.url)
      );
    }

    const tokens = await exchangeCodeForTokens(code);
    const email = await getUserEmail(tokens);

    const cookieStore = await cookies();
    cookieStore.set('google_sheets_tokens', JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    cookieStore.set('google_sheets_email', email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    let returnUrl = '/dashboard/integrations/google-sheets';
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        if (stateData.returnUrl) {
          returnUrl = stateData.returnUrl;
        }
      } catch {
        // Invalid state, use default
      }
    }

    return NextResponse.redirect(new URL(`${returnUrl}?connected=true`, request.url));
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/integrations/google-sheets?error=token_exchange_failed', request.url)
    );
  }
}
