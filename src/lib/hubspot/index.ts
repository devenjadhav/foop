/**
 * HubSpot Connector
 *
 * This module provides a complete HubSpot integration with:
 * - OAuth authentication flow
 * - API client wrapper with automatic token refresh
 * - Field mapping utilities for data transformation
 *
 * Usage:
 *
 * 1. Configure environment variables:
 *    - HUBSPOT_CLIENT_ID
 *    - HUBSPOT_CLIENT_SECRET
 *    - HUBSPOT_REDIRECT_URI
 *
 * 2. Initiate OAuth flow:
 *    Redirect user to /api/integrations/hubspot/connect
 *
 * 3. After OAuth callback, use the client:
 *    ```typescript
 *    import { createHubSpotClient, mapFromHubSpot, STANDARD_CONTACT_FIELDS } from '@/lib/hubspot';
 *
 *    const client = createHubSpotClient(tokens);
 *    const contacts = await client.listContacts();
 *    const mapped = contacts.results.map(c => mapFromHubSpot(c, STANDARD_CONTACT_FIELDS));
 *    ```
 *
 * 4. Test connection:
 *    POST /api/integrations/hubspot/test with credentials
 */

// Client
export { HubSpotClient, HubSpotClientError, createHubSpotClient } from './client';

// OAuth
export {
  generateAuthUrl,
  exchangeCodeForTokens,
  refreshTokens,
  getTokenInfo,
  buildCredentials,
  isHubSpotConfigured,
  getOAuthConfig,
  generateState,
  encodeState,
  decodeState,
  DEFAULT_HUBSPOT_SCOPES,
} from './oauth';

// Field Mapping
export {
  mapFromHubSpot,
  mapToHubSpot,
  mapFieldType,
  propertyToFieldMapping,
  mergeFieldMappings,
  getHubSpotFieldNames,
  validateFieldMappings,
  STANDARD_CONTACT_FIELDS,
  STANDARD_COMPANY_FIELDS,
  STANDARD_DEAL_FIELDS,
} from './fields';

// Types
export type {
  HubSpotTokens,
  HubSpotCredentials,
  HubSpotConfig,
  FieldMapping,
  HubSpotFieldType,
  HubSpotContact,
  HubSpotCompany,
  HubSpotDeal,
  HubSpotProperty,
  HubSpotPaginatedResponse,
  HubSpotAccountInfo,
  HubSpotError,
  ConnectionTestResult,
} from './types';
