/**
 * HubSpot connection test endpoint
 * Tests the connection using stored credentials
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHubSpotClient, HubSpotClientError } from '@/lib/hubspot/client';
import { isHubSpotConfigured } from '@/lib/hubspot/oauth';
import type { HubSpotTokens, ConnectionTestResult } from '@/lib/hubspot/types';

export async function POST(request: NextRequest) {
  // Check if HubSpot is configured
  if (!isHubSpotConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: 'HubSpot integration is not configured',
      } satisfies ConnectionTestResult,
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    // In a real implementation, you would:
    // 1. Get integrationId from the request
    // 2. Fetch credentials from database
    // 3. Decrypt credentials
    //
    // For now, accept tokens directly for testing
    const tokens: HubSpotTokens = body.tokens;

    if (!tokens?.accessToken || !tokens?.refreshToken || !tokens?.expiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or missing credentials',
        } satisfies ConnectionTestResult,
        { status: 400 }
      );
    }

    // Create client and test connection
    const client = createHubSpotClient(tokens);

    // Test by fetching account info
    const accountInfo = await client.getAccountInfo();

    // Try to list contacts to verify CRM access
    await client.listContacts({ limit: 1 });

    return NextResponse.json({
      success: true,
      portalId: String(accountInfo.portalId),
      portalName: accountInfo.uiDomain,
    } satisfies ConnectionTestResult);
  } catch (err) {
    console.error('HubSpot connection test failed:', err);

    if (err instanceof HubSpotClientError) {
      return NextResponse.json(
        {
          success: false,
          error: `HubSpot API error: ${err.message}`,
        } satisfies ConnectionTestResult,
        { status: err.statusCode >= 500 ? 502 : 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Connection test failed',
      } satisfies ConnectionTestResult,
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for simple connectivity check
 */
export async function GET() {
  if (!isHubSpotConfigured()) {
    return NextResponse.json({
      configured: false,
      message: 'HubSpot integration is not configured. Please set HUBSPOT_CLIENT_ID, HUBSPOT_CLIENT_SECRET, and HUBSPOT_REDIRECT_URI.',
    });
  }

  return NextResponse.json({
    configured: true,
    message: 'HubSpot integration is configured. Use POST with credentials to test connection.',
  });
}
