/**
 * HubSpot OAuth connect endpoint
 * Redirects user to HubSpot authorization page
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateAuthUrl,
  isHubSpotConfigured,
  encodeState,
  generateState,
} from '@/lib/hubspot/oauth';

export async function GET(request: NextRequest) {
  // Check if HubSpot is configured
  if (!isHubSpotConfigured()) {
    return NextResponse.json(
      { error: 'HubSpot integration is not configured' },
      { status: 503 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId');
  const returnUrl = searchParams.get('returnUrl') || '/dashboard/integrations';

  // Generate state for CSRF protection
  const state = encodeState({
    organizationId: organizationId || undefined,
    returnUrl,
    nonce: generateState(),
  });

  // Generate authorization URL with state
  const authUrl = generateAuthUrl({ state });

  // Redirect to HubSpot
  return NextResponse.redirect(authUrl);
}
