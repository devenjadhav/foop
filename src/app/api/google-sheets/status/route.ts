import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { GoogleOAuthTokens } from '@/types/google-sheets';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokensStr = cookieStore.get('google_sheets_tokens')?.value;
    const email = cookieStore.get('google_sheets_email')?.value;

    if (!tokensStr) {
      return NextResponse.json({
        connected: false,
        email: null,
      });
    }

    const tokens: GoogleOAuthTokens = JSON.parse(tokensStr);
    const isExpired = tokens.expiry_date < Date.now();

    return NextResponse.json({
      connected: !isExpired,
      email: email || null,
      expiresAt: tokens.expiry_date,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({
      connected: false,
      email: null,
    });
  }
}
