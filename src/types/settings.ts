// Settings Types for Foop B2B Automation SaaS

// Billing & Subscription Types
export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    apiCalls: number;
    teamMembers: number;
    automations: number;
    storage: number; // in GB
  };
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  date: string;
  pdfUrl: string;
}

export interface UsageMetrics {
  apiCalls: { used: number; limit: number };
  teamMembers: { used: number; limit: number };
  automations: { used: number; limit: number };
  storage: { used: number; limit: number };
}

// API Keys Types
export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  scopes: ApiKeyScope[];
  status: 'active' | 'revoked' | 'expired';
}

export type ApiKeyScope =
  | 'read:automations'
  | 'write:automations'
  | 'read:data'
  | 'write:data'
  | 'read:analytics'
  | 'admin';

export interface CreateApiKeyRequest {
  name: string;
  scopes: ApiKeyScope[];
  expiresAt?: string;
}

export interface CreateApiKeyResponse {
  key: ApiKey;
  secret: string; // Only returned once on creation
}

// Team Settings Types
export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: TeamRole;
  joinedAt: string;
  lastActiveAt: string;
  status: 'active' | 'pending' | 'deactivated';
}

export interface TeamInvite {
  id: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired';
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: string;
  settings: TeamSettings;
}

export interface TeamSettings {
  allowMemberInvites: boolean;
  requireTwoFactor: boolean;
  defaultRole: TeamRole;
  allowedDomains: string[];
}

// Notification Preferences Types
export type NotificationChannel = 'email' | 'slack' | 'webhook' | 'in_app';

export interface NotificationPreference {
  category: NotificationCategory;
  channels: {
    [K in NotificationChannel]: boolean;
  };
}

export type NotificationCategory =
  | 'automation_success'
  | 'automation_failure'
  | 'automation_warning'
  | 'team_activity'
  | 'billing_alerts'
  | 'security_alerts'
  | 'product_updates'
  | 'weekly_digest';

export interface SlackIntegration {
  enabled: boolean;
  workspaceName?: string;
  channelId?: string;
  channelName?: string;
  connectedAt?: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: NotificationCategory[];
  secret: string;
  enabled: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
}

export interface NotificationSettings {
  preferences: NotificationPreference[];
  slack: SlackIntegration;
  webhooks: WebhookEndpoint[];
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;
    timezone: string;
  };
}
