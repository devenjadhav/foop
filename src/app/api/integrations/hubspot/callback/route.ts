/**
 * HubSpot OAuth callback endpoint
 * Handles the redirect from HubSpot after authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForTokens,
  buildCredentials,
  decodeState,
  isHubSpotConfigured,
} from '@/lib/hubspot/oauth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle errors from HubSpot
  if (error) {
    console.error('HubSpot OAuth error:', error, errorDescription);
    const errorUrl = new URL('/dashboard/integrations', request.url);
    errorUrl.searchParams.set('error', 'hubspot_auth_failed');
    errorUrl.searchParams.set(
      'error_description',
      errorDescription || 'Authorization was denied'
    );
    return NextResponse.redirect(errorUrl);
  }

  // Validate required parameters
  if (!code) {
    return NextResponse.json(
      { error: 'Missing authorization code' },
      { status: 400 }
    );
  }

  if (!state) {
    return NextResponse.json(
      { error: 'Missing state parameter' },
      { status: 400 }
    );
  }

  // Check if HubSpot is configured
  if (!isHubSpotConfigured()) {
    return NextResponse.json(
      { error: 'HubSpot integration is not configured' },
      { status: 503 }
    );
  }

  try {
    // Decode and validate state
    const stateData = decodeState(state);

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Build full credentials with portal info
    const credentials = await buildCredentials(tokens);

    // TODO: Store credentials in database
    // In a real implementation, you would:
    // 1. Get the authenticated user/organization
    // 2. Create or update an Integration record
    // 3. Store encrypted credentials
    //
    // Example with Prisma:
    // await prisma.integration.upsert({
    //   where: {
    //     organizationId_type_name: {
    //       organizationId: stateData.organizationId,
    //       type: 'hubspot',
    //       name: 'default',
    //     },
    //   },
    //   create: {
    //     organizationId: stateData.organizationId,
    //     type: 'hubspot',
    //     name: 'default',
    //     credentials: encryptJson(credentials),
    //     config: { scopes: DEFAULT_HUBSPOT_SCOPES },
    //     status: 'ACTIVE',
    //   },
    //   update: {
    //     credentials: encryptJson(credentials),
    //     status: 'ACTIVE',
    //   },
    // });

    console.log('HubSpot credentials obtained for portal:', credentials.portalId);

    // Redirect to success page
    const returnUrl = stateData.returnUrl || '/dashboard/integrations';
    const successUrl = new URL(returnUrl, request.url);
    successUrl.searchParams.set('success', 'hubspot_connected');
    successUrl.searchParams.set('portalId', credentials.portalId);

    return NextResponse.redirect(successUrl);
  } catch (err) {
    console.error('HubSpot OAuth callback error:', err);

    const errorUrl = new URL('/dashboard/integrations', request.url);
    errorUrl.searchParams.set('error', 'hubspot_connection_failed');
    errorUrl.searchParams.set(
      'error_description',
      err instanceof Error ? err.message : 'Failed to connect to HubSpot'
    );

    return NextResponse.redirect(errorUrl);
  }
}
