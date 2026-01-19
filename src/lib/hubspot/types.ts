/**
 * HubSpot connector types
 */

export interface HubSpotTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface HubSpotCredentials {
  tokens: HubSpotTokens;
  portalId: string;
}

export interface HubSpotConfig {
  scopes: string[];
  fieldMappings?: FieldMapping[];
}

export interface FieldMapping {
  hubspotField: string;
  hubspotFieldType: HubSpotFieldType;
  internalField: string;
  direction: 'inbound' | 'outbound' | 'bidirectional';
}

export type HubSpotFieldType =
  | 'string'
  | 'number'
  | 'date'
  | 'datetime'
  | 'enumeration'
  | 'bool'
  | 'phone_number'
  | 'json';

export interface HubSpotContact {
  id: string;
  properties: Record<string, string | null>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotCompany {
  id: string;
  properties: Record<string, string | null>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotDeal {
  id: string;
  properties: Record<string, string | null>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotProperty {
  name: string;
  label: string;
  type: HubSpotFieldType;
  fieldType: string;
  description: string;
  groupName: string;
  options?: Array<{
    label: string;
    value: string;
    description?: string;
    displayOrder: number;
    hidden: boolean;
  }>;
  hidden: boolean;
  modificationMetadata?: {
    readOnlyValue: boolean;
    readOnlyDefinition: boolean;
  };
}

export interface HubSpotPaginatedResponse<T> {
  results: T[];
  paging?: {
    next?: {
      after: string;
      link: string;
    };
  };
}

export interface HubSpotAccountInfo {
  portalId: number;
  uiDomain: string;
  timeZone: string;
  companyCurrency: string;
  additionalCurrencies: string[];
  utcOffset: string;
  utcOffsetMilliseconds: number;
  dataHostingLocation: string;
}

export interface HubSpotError {
  status: string;
  message: string;
  correlationId: string;
  category: string;
}

export interface ConnectionTestResult {
  success: boolean;
  portalId?: string;
  portalName?: string;
  error?: string;
}
