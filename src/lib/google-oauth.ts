import { google } from 'googleapis';
import type { GoogleOAuthTokens } from '@/types/google-sheets';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
];

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/google-sheets/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthorizationUrl(state?: string): string {
  const oauth2Client = getOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state: state || '',
  });
}

export async function exchangeCodeForTokens(code: string): Promise<GoogleOAuthTokens> {
  const oauth2Client = getOAuth2Client();

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token) {
    throw new Error('Failed to obtain access token');
  }

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || undefined,
    scope: tokens.scope || SCOPES.join(' '),
    token_type: tokens.token_type || 'Bearer',
    expiry_date: tokens.expiry_date || Date.now() + 3600 * 1000,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleOAuthTokens> {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error('Failed to refresh access token');
  }

  return {
    access_token: credentials.access_token,
    refresh_token: credentials.refresh_token || refreshToken,
    scope: credentials.scope || SCOPES.join(' '),
    token_type: credentials.token_type || 'Bearer',
    expiry_date: credentials.expiry_date || Date.now() + 3600 * 1000,
  };
}

export function getAuthenticatedClient(tokens: GoogleOAuthTokens) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  });
  return oauth2Client;
}

export async function getUserEmail(tokens: GoogleOAuthTokens): Promise<string> {
  const oauth2Client = getAuthenticatedClient(tokens);
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });

  const { data } = await oauth2.userinfo.get();

  if (!data.email) {
    throw new Error('Failed to get user email');
  }

  return data.email;
}

export async function revokeToken(token: string): Promise<void> {
  const oauth2Client = getOAuth2Client();
  await oauth2Client.revokeToken(token);
}
