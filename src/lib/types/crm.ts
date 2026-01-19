/**
 * CRM-specific type definitions
 */

export type CRMProvider = 'hubspot' | 'salesforce' | 'pipedrive' | 'generic';

export interface CRMContact {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  title?: string;
  address?: CRMAddress;
  customFields?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CRMAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface CRMDeal {
  id: string;
  name: string;
  amount?: number;
  currency?: string;
  stage?: string;
  pipeline?: string;
  probability?: number;
  expectedCloseDate?: string;
  contactId?: string;
  companyId?: string;
  ownerId?: string;
  customFields?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CRMNote {
  id: string;
  content: string;
  associatedObjectType: 'contact' | 'deal' | 'company';
  associatedObjectId: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CRMSearchQuery {
  objectType: 'contact' | 'deal' | 'company' | 'note';
  filters: CRMSearchFilter[];
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CRMSearchFilter {
  field: string;
  operator: 'eq' | 'neq' | 'contains' | 'starts_with' | 'ends_with' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in';
  value: unknown;
}

export interface CRMSearchResult<T> {
  results: T[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

// Input types for CRM nodes

export interface CreateContactInput {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  title?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  customFields?: Record<string, unknown>;
}

export interface UpdateContactInput {
  contactId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  title?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  customFields?: Record<string, unknown>;
}

export interface CreateDealInput {
  name: string;
  amount?: number;
  currency?: string;
  stage?: string;
  pipeline?: string;
  probability?: number;
  expectedCloseDate?: string;
  contactId?: string;
  companyId?: string;
  ownerId?: string;
  customFields?: Record<string, unknown>;
}

export interface UpdateDealInput {
  dealId: string;
  name?: string;
  amount?: number;
  currency?: string;
  stage?: string;
  pipeline?: string;
  probability?: number;
  expectedCloseDate?: string;
  contactId?: string;
  companyId?: string;
  ownerId?: string;
  customFields?: Record<string, unknown>;
}

export interface AddNoteInput {
  content: string;
  associatedObjectType: 'contact' | 'deal' | 'company';
  associatedObjectId: string;
}

export interface SearchRecordsInput {
  objectType: 'contact' | 'deal' | 'company' | 'note';
  searchField: string;
  operator: CRMSearchFilter['operator'];
  searchValue: string;
  limit?: number;
}
