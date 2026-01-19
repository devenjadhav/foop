export type WebhookStatus = 'active' | 'inactive' | 'pending';

export type WebhookEventType =
  | 'workflow.created'
  | 'workflow.updated'
  | 'workflow.deleted'
  | 'workflow.executed'
  | 'integration.connected'
  | 'integration.disconnected'
  | 'user.created'
  | 'user.updated'
  | 'custom';

export interface WebhookConfig {
  id: string;
  organizationId: string;
  name: string;
  url: string;
  secret: string;
  status: WebhookStatus;
  events: WebhookEventType[];
  headers?: Record<string, string>;
  retryConfig: RetryConfig;
  createdAt: Date;
  updatedAt: Date;
  lastTriggeredAt?: Date;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface WebhookPayload {
  id: string;
  webhookId: string;
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface WebhookDeliveryAttempt {
  id: string;
  webhookId: string;
  payloadId: string;
  attempt: number;
  status: 'pending' | 'success' | 'failed';
  statusCode?: number;
  responseBody?: string;
  errorMessage?: string;
  duration?: number;
  createdAt: Date;
}

export interface WebhookDeliveryResult {
  success: boolean;
  attempts: number;
  finalStatusCode?: number;
  errorMessage?: string;
  duration: number;
}

export interface CreateWebhookRequest {
  organizationId: string;
  name: string;
  url: string;
  events: WebhookEventType[];
  headers?: Record<string, string>;
  retryConfig?: Partial<RetryConfig>;
}

export interface UpdateWebhookRequest {
  name?: string;
  url?: string;
  status?: WebhookStatus;
  events?: WebhookEventType[];
  headers?: Record<string, string>;
  retryConfig?: Partial<RetryConfig>;
}

export interface IncomingWebhookPayload {
  event: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ParsedWebhookRequest {
  payload: IncomingWebhookPayload;
  signature: string;
  timestamp: string;
  webhookId: string;
}
