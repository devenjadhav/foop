/**
 * HubSpot API client wrapper
 */

import type {
  HubSpotTokens,
  HubSpotContact,
  HubSpotCompany,
  HubSpotDeal,
  HubSpotProperty,
  HubSpotPaginatedResponse,
  HubSpotAccountInfo,
  HubSpotError,
} from './types';

const HUBSPOT_API_BASE = 'https://api.hubapi.com';

export class HubSpotClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public hubspotError?: HubSpotError
  ) {
    super(message);
    this.name = 'HubSpotClientError';
  }
}

export class HubSpotClient {
  private accessToken: string;
  private refreshToken: string;
  private expiresAt: number;
  private clientId: string;
  private clientSecret: string;
  private onTokenRefresh?: (tokens: HubSpotTokens) => Promise<void>;

  constructor(
    tokens: HubSpotTokens,
    options: {
      clientId: string;
      clientSecret: string;
      onTokenRefresh?: (tokens: HubSpotTokens) => Promise<void>;
    }
  ) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.expiresAt = tokens.expiresAt;
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.onTokenRefresh = options.onTokenRefresh;
  }

  private isTokenExpired(): boolean {
    // Consider token expired 5 minutes before actual expiry
    return Date.now() >= this.expiresAt - 5 * 60 * 1000;
  }

  private async refreshAccessToken(): Promise<void> {
    const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new HubSpotClientError(
        'Failed to refresh access token',
        response.status,
        error
      );
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.expiresAt = Date.now() + data.expires_in * 1000;

    if (this.onTokenRefresh) {
      await this.onTokenRefresh({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiresAt: this.expiresAt,
      });
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }

    const url = `${HUBSPOT_API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let error: HubSpotError | undefined;
      try {
        error = await response.json();
      } catch {
        // Response may not be JSON
      }
      throw new HubSpotClientError(
        error?.message || `HubSpot API error: ${response.statusText}`,
        response.status,
        error
      );
    }

    return response.json();
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<HubSpotAccountInfo> {
    return this.request<HubSpotAccountInfo>('/account-info/v3/details');
  }

  // ==================== Contacts ====================

  /**
   * Get a single contact by ID
   */
  async getContact(
    contactId: string,
    properties?: string[]
  ): Promise<HubSpotContact> {
    const params = properties
      ? `?properties=${properties.join(',')}`
      : '';
    return this.request<HubSpotContact>(
      `/crm/v3/objects/contacts/${contactId}${params}`
    );
  }

  /**
   * List contacts with pagination
   */
  async listContacts(options?: {
    limit?: number;
    after?: string;
    properties?: string[];
  }): Promise<HubSpotPaginatedResponse<HubSpotContact>> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.after) params.set('after', options.after);
    if (options?.properties) {
      params.set('properties', options.properties.join(','));
    }
    const query = params.toString() ? `?${params}` : '';
    return this.request<HubSpotPaginatedResponse<HubSpotContact>>(
      `/crm/v3/objects/contacts${query}`
    );
  }

  /**
   * Create a contact
   */
  async createContact(
    properties: Record<string, string>
  ): Promise<HubSpotContact> {
    return this.request<HubSpotContact>('/crm/v3/objects/contacts', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });
  }

  /**
   * Update a contact
   */
  async updateContact(
    contactId: string,
    properties: Record<string, string>
  ): Promise<HubSpotContact> {
    return this.request<HubSpotContact>(
      `/crm/v3/objects/contacts/${contactId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ properties }),
      }
    );
  }

  /**
   * Delete a contact
   */
  async deleteContact(contactId: string): Promise<void> {
    await this.request(`/crm/v3/objects/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get contact properties schema
   */
  async getContactProperties(): Promise<HubSpotProperty[]> {
    const response = await this.request<{ results: HubSpotProperty[] }>(
      '/crm/v3/properties/contacts'
    );
    return response.results;
  }

  // ==================== Companies ====================

  /**
   * Get a single company by ID
   */
  async getCompany(
    companyId: string,
    properties?: string[]
  ): Promise<HubSpotCompany> {
    const params = properties
      ? `?properties=${properties.join(',')}`
      : '';
    return this.request<HubSpotCompany>(
      `/crm/v3/objects/companies/${companyId}${params}`
    );
  }

  /**
   * List companies with pagination
   */
  async listCompanies(options?: {
    limit?: number;
    after?: string;
    properties?: string[];
  }): Promise<HubSpotPaginatedResponse<HubSpotCompany>> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.after) params.set('after', options.after);
    if (options?.properties) {
      params.set('properties', options.properties.join(','));
    }
    const query = params.toString() ? `?${params}` : '';
    return this.request<HubSpotPaginatedResponse<HubSpotCompany>>(
      `/crm/v3/objects/companies${query}`
    );
  }

  /**
   * Create a company
   */
  async createCompany(
    properties: Record<string, string>
  ): Promise<HubSpotCompany> {
    return this.request<HubSpotCompany>('/crm/v3/objects/companies', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });
  }

  /**
   * Update a company
   */
  async updateCompany(
    companyId: string,
    properties: Record<string, string>
  ): Promise<HubSpotCompany> {
    return this.request<HubSpotCompany>(
      `/crm/v3/objects/companies/${companyId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ properties }),
      }
    );
  }

  /**
   * Get company properties schema
   */
  async getCompanyProperties(): Promise<HubSpotProperty[]> {
    const response = await this.request<{ results: HubSpotProperty[] }>(
      '/crm/v3/properties/companies'
    );
    return response.results;
  }

  // ==================== Deals ====================

  /**
   * Get a single deal by ID
   */
  async getDeal(dealId: string, properties?: string[]): Promise<HubSpotDeal> {
    const params = properties
      ? `?properties=${properties.join(',')}`
      : '';
    return this.request<HubSpotDeal>(
      `/crm/v3/objects/deals/${dealId}${params}`
    );
  }

  /**
   * List deals with pagination
   */
  async listDeals(options?: {
    limit?: number;
    after?: string;
    properties?: string[];
  }): Promise<HubSpotPaginatedResponse<HubSpotDeal>> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.after) params.set('after', options.after);
    if (options?.properties) {
      params.set('properties', options.properties.join(','));
    }
    const query = params.toString() ? `?${params}` : '';
    return this.request<HubSpotPaginatedResponse<HubSpotDeal>>(
      `/crm/v3/objects/deals${query}`
    );
  }

  /**
   * Create a deal
   */
  async createDeal(properties: Record<string, string>): Promise<HubSpotDeal> {
    return this.request<HubSpotDeal>('/crm/v3/objects/deals', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });
  }

  /**
   * Update a deal
   */
  async updateDeal(
    dealId: string,
    properties: Record<string, string>
  ): Promise<HubSpotDeal> {
    return this.request<HubSpotDeal>(`/crm/v3/objects/deals/${dealId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });
  }

  /**
   * Get deal properties schema
   */
  async getDealProperties(): Promise<HubSpotProperty[]> {
    const response = await this.request<{ results: HubSpotProperty[] }>(
      '/crm/v3/properties/deals'
    );
    return response.results;
  }

  // ==================== Search ====================

  /**
   * Search contacts
   */
  async searchContacts(
    query: string,
    options?: {
      limit?: number;
      after?: string;
      properties?: string[];
    }
  ): Promise<HubSpotPaginatedResponse<HubSpotContact>> {
    return this.request<HubSpotPaginatedResponse<HubSpotContact>>(
      '/crm/v3/objects/contacts/search',
      {
        method: 'POST',
        body: JSON.stringify({
          query,
          limit: options?.limit || 10,
          after: options?.after,
          properties: options?.properties,
        }),
      }
    );
  }

  /**
   * Search companies
   */
  async searchCompanies(
    query: string,
    options?: {
      limit?: number;
      after?: string;
      properties?: string[];
    }
  ): Promise<HubSpotPaginatedResponse<HubSpotCompany>> {
    return this.request<HubSpotPaginatedResponse<HubSpotCompany>>(
      '/crm/v3/objects/companies/search',
      {
        method: 'POST',
        body: JSON.stringify({
          query,
          limit: options?.limit || 10,
          after: options?.after,
          properties: options?.properties,
        }),
      }
    );
  }

  /**
   * Search deals
   */
  async searchDeals(
    query: string,
    options?: {
      limit?: number;
      after?: string;
      properties?: string[];
    }
  ): Promise<HubSpotPaginatedResponse<HubSpotDeal>> {
    return this.request<HubSpotPaginatedResponse<HubSpotDeal>>(
      '/crm/v3/objects/deals/search',
      {
        method: 'POST',
        body: JSON.stringify({
          query,
          limit: options?.limit || 10,
          after: options?.after,
          properties: options?.properties,
        }),
      }
    );
  }
}

/**
 * Create a HubSpot client from stored credentials
 */
export function createHubSpotClient(
  tokens: HubSpotTokens,
  options?: {
    onTokenRefresh?: (tokens: HubSpotTokens) => Promise<void>;
  }
): HubSpotClient {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'HUBSPOT_CLIENT_ID and HUBSPOT_CLIENT_SECRET must be configured'
    );
  }

  return new HubSpotClient(tokens, {
    clientId,
    clientSecret,
    onTokenRefresh: options?.onTokenRefresh,
  });
}
