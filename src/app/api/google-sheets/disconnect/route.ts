import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revokeToken } from '@/lib/google-oauth';
import type { GoogleOAuthTokens } from '@/types/google-sheets';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const tokensStr = cookieStore.get('google_sheets_tokens')?.value;

    if (tokensStr) {
      try {
        const tokens: GoogleOAuthTokens = JSON.parse(tokensStr);
        await revokeToken(tokens.access_token);
      } catch {
        // Token revocation failed, but we'll still clear cookies
      }
    }

    cookieStore.delete('google_sheets_tokens');
    cookieStore.delete('google_sheets_email');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
