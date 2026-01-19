import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/google-oauth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const returnUrl = searchParams.get('returnUrl') || '/dashboard/integrations/google-sheets';

    const state = Buffer.from(JSON.stringify({ returnUrl })).toString('base64');
    const authUrl = getAuthorizationUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
}
