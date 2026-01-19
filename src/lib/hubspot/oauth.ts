/**
 * HubSpot OAuth flow utilities
 */

import type { HubSpotTokens, HubSpotCredentials } from './types';

const HUBSPOT_AUTH_URL = 'https://app.hubspot.com/oauth/authorize';
const HUBSPOT_TOKEN_URL = 'https://api.hubapi.com/oauth/v1/token';

/**
 * Default scopes for HubSpot OAuth
 */
export const DEFAULT_HUBSPOT_SCOPES = [
  'crm.objects.contacts.read',
  'crm.objects.contacts.write',
  'crm.objects.companies.read',
  'crm.objects.companies.write',
  'crm.objects.deals.read',
  'crm.objects.deals.write',
  'crm.schemas.contacts.read',
  'crm.schemas.companies.read',
  'crm.schemas.deals.read',
];

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: string[];
}

/**
 * Get OAuth configuration from environment variables
 */
export function getOAuthConfig(): OAuthConfig {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Missing required HubSpot OAuth configuration. ' +
        'Please set HUBSPOT_CLIENT_ID, HUBSPOT_CLIENT_SECRET, and HUBSPOT_REDIRECT_URI.'
    );
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    scopes: DEFAULT_HUBSPOT_SCOPES,
  };
}

/**
 * Check if HubSpot OAuth is configured
 */
export function isHubSpotConfigured(): boolean {
  return !!(
    process.env.HUBSPOT_CLIENT_ID &&
    process.env.HUBSPOT_CLIENT_SECRET &&
    process.env.HUBSPOT_REDIRECT_URI
  );
}

/**
 * Generate the OAuth authorization URL
 */
export function generateAuthUrl(options?: {
  scopes?: string[];
  state?: string;
}): string {
  const config = getOAuthConfig();
  const scopes = options?.scopes || config.scopes || DEFAULT_HUBSPOT_SCOPES;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: scopes.join(' '),
  });

  if (options?.state) {
    params.set('state', options.state);
  }

  return `${HUBSPOT_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string
): Promise<HubSpotTokens> {
  const config = getOAuthConfig();

  const response = await fetch(HUBSPOT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to exchange code for tokens: ${error.message || response.statusText}`
    );
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshTokens(
  refreshToken: string
): Promise<HubSpotTokens> {
  const config = getOAuthConfig();

  const response = await fetch(HUBSPOT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to refresh tokens: ${error.message || response.statusText}`
    );
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Get token information (for validation)
 */
export async function getTokenInfo(
  accessToken: string
): Promise<{ portalId: number; appId: number; userId: number }> {
  const response = await fetch(
    `https://api.hubapi.com/oauth/v1/access-tokens/${accessToken}`
  );

  if (!response.ok) {
    throw new Error('Invalid or expired access token');
  }

  const data = await response.json();

  return {
    portalId: data.hub_id,
    appId: data.app_id,
    userId: data.user_id,
  };
}

/**
 * Build full credentials object from tokens
 */
export async function buildCredentials(
  tokens: HubSpotTokens
): Promise<HubSpotCredentials> {
  const tokenInfo = await getTokenInfo(tokens.accessToken);

  return {
    tokens,
    portalId: String(tokenInfo.portalId),
  };
}

/**
 * Generate a random state parameter for CSRF protection
 */
export function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encode state with additional data
 */
export function encodeState(data: {
  organizationId?: string;
  returnUrl?: string;
  nonce: string;
}): string {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

/**
 * Decode state parameter
 */
export function decodeState(state: string): {
  organizationId?: string;
  returnUrl?: string;
  nonce: string;
} {
  try {
    return JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
  } catch {
    throw new Error('Invalid state parameter');
  }
}
