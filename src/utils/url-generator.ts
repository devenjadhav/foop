import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface GeneratedWebhookUrl {
  id: string;
  url: string;
  secret: string;
}

export interface UrlGeneratorConfig {
  baseUrl: string;
  pathPrefix?: string;
}

const DEFAULT_CONFIG: UrlGeneratorConfig = {
  baseUrl: process.env.WEBHOOK_BASE_URL || 'http://localhost:3000',
  pathPrefix: '/api/webhooks',
};

export function generateWebhookId(): string {
  return `wh_${uuidv4().replace(/-/g, '')}`;
}

export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(32).toString('hex')}`;
}

export function generateWebhookUrl(
  webhookId: string,
  config: Partial<UrlGeneratorConfig> = {}
): string {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const { baseUrl, pathPrefix } = mergedConfig;

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPrefix = pathPrefix?.startsWith('/') ? pathPrefix : `/${pathPrefix || ''}`;

  return `${normalizedBase}${normalizedPrefix}/receive/${webhookId}`;
}

export function generateWebhookEndpoint(
  config: Partial<UrlGeneratorConfig> = {}
): GeneratedWebhookUrl {
  const id = generateWebhookId();
  const secret = generateWebhookSecret();
  const url = generateWebhookUrl(id, config);

  return { id, url, secret };
}

export function parseWebhookIdFromUrl(url: string): string | null {
  const match = url.match(/\/receive\/([a-zA-Z0-9_]+)$/);
  return match ? match[1] : null;
}

export function generateInboundWebhookUrl(
  organizationId: string,
  config: Partial<UrlGeneratorConfig> = {}
): GeneratedWebhookUrl {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const id = generateWebhookId();
  const secret = generateWebhookSecret();

  const normalizedBase = mergedConfig.baseUrl.endsWith('/')
    ? mergedConfig.baseUrl.slice(0, -1)
    : mergedConfig.baseUrl;

  const url = `${normalizedBase}/api/webhooks/inbound/${organizationId}/${id}`;

  return { id, url, secret };
}
