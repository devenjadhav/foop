/**
 * Webhook Trigger Node
 * Fires when a configured webhook URL receives an HTTP request
 */

import type {
  TriggerNodeDefinition,
  TriggerHandler,
  TriggerEvent,
  TriggerContext,
} from '../../types';

export interface WebhookPayload {
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  rawBody?: string;
  contentType?: string;
  ip?: string;
  userAgent?: string;
  receivedAt: string;
}

export interface WebhookConfig {
  webhookUrl?: string;
  webhookId?: string;
  allowedMethods?: string[];
  secretToken?: string;
  validateSignature?: boolean;
  responseMode?: 'immediate' | 'after_workflow';
  responseStatusCode?: number;
  responseBody?: string;
}

/**
 * Generate a unique webhook URL for a workflow
 */
export function generateWebhookUrl(
  baseUrl: string,
  organizationId: string,
  workflowId: string,
  nodeId: string
): string {
  const webhookId = `${organizationId}-${workflowId}-${nodeId}`;
  return `${baseUrl}/api/webhooks/${webhookId}`;
}

/**
 * Generate a secure webhook token
 */
export function generateWebhookToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export const webhookTrigger: TriggerNodeDefinition<WebhookConfig> = {
  type: 'trigger.core.webhook',
  label: 'Webhook',
  description: 'Triggers when an HTTP request is received at the generated webhook URL',
  category: 'trigger',
  icon: 'webhook',
  eventType: 'core.webhook.received',
  supportsWebhook: true,
  supportsPolling: false,
  configFields: [
    {
      key: 'webhookUrl',
      type: 'string',
      label: 'Webhook URL',
      description: 'The URL that will trigger this workflow (auto-generated)',
      required: false,
    },
    {
      key: 'allowedMethods',
      type: 'multiselect',
      label: 'Allowed HTTP Methods',
      description: 'Which HTTP methods to accept',
      required: false,
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'PATCH', value: 'PATCH' },
        { label: 'DELETE', value: 'DELETE' },
      ],
      default: ['POST'],
    },
    {
      key: 'secretToken',
      type: 'string',
      label: 'Secret Token',
      description: 'Optional secret token for request validation',
      required: false,
      placeholder: 'Enter or generate a secret token',
    },
    {
      key: 'validateSignature',
      type: 'boolean',
      label: 'Validate Signature',
      description: 'Require valid signature using the secret token',
      required: false,
      default: false,
    },
    {
      key: 'responseMode',
      type: 'select',
      label: 'Response Mode',
      description: 'When to send the HTTP response',
      required: false,
      options: [
        { label: 'Immediate (before workflow runs)', value: 'immediate' },
        { label: 'After workflow completes', value: 'after_workflow' },
      ],
      default: 'immediate',
    },
    {
      key: 'responseStatusCode',
      type: 'number',
      label: 'Response Status Code',
      description: 'HTTP status code to return',
      required: false,
      default: 200,
    },
    {
      key: 'responseBody',
      type: 'string',
      label: 'Response Body',
      description: 'Optional custom response body',
      required: false,
      placeholder: '{"status": "received"}',
    },
  ],
  outputs: {
    request: {
      type: 'object',
      label: 'Request Data',
    },
    headers: {
      type: 'object',
      label: 'HTTP Headers',
    },
    body: {
      type: 'object',
      label: 'Request Body',
    },
    query: {
      type: 'object',
      label: 'Query Parameters',
    },
  },
  defaultConfig: {
    allowedMethods: ['POST'],
    validateSignature: false,
    responseMode: 'immediate',
    responseStatusCode: 200,
  },
};

export const webhookHandler: TriggerHandler<WebhookPayload> = {
  validate(
    event: TriggerEvent<WebhookPayload>,
    context: TriggerContext
  ): boolean {
    const config = context.config as WebhookConfig;
    const { payload } = event;

    // Validate HTTP method
    if (config.allowedMethods && config.allowedMethods.length > 0) {
      if (!config.allowedMethods.includes(payload.method)) {
        return false;
      }
    }

    return true;
  },

  transform(
    event: TriggerEvent<WebhookPayload>,
    _context: TriggerContext
  ): Record<string, unknown> {
    const { payload } = event;

    return {
      request: {
        method: payload.method,
        contentType: payload.contentType,
        ip: payload.ip,
        userAgent: payload.userAgent,
        receivedAt: payload.receivedAt,
      },
      headers: payload.headers,
      body: payload.body,
      query: payload.query,
      event: {
        id: event.id,
        type: event.type,
        timestamp: event.timestamp,
        source: event.source,
      },
    };
  },
};
