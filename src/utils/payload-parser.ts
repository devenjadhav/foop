import { IncomingWebhookPayload, WebhookEventType } from '../types/webhook';

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RawWebhookPayload {
  body: string | Buffer | Record<string, unknown>;
  contentType?: string;
}

const VALID_EVENT_TYPES: Set<string> = new Set([
  'workflow.created',
  'workflow.updated',
  'workflow.deleted',
  'workflow.executed',
  'integration.connected',
  'integration.disconnected',
  'user.created',
  'user.updated',
  'custom',
]);

export function parsePayload(raw: RawWebhookPayload): ParseResult<IncomingWebhookPayload> {
  const { body, contentType } = raw;

  let parsed: Record<string, unknown>;

  try {
    if (typeof body === 'string') {
      parsed = JSON.parse(body);
    } else if (Buffer.isBuffer(body)) {
      parsed = JSON.parse(body.toString('utf-8'));
    } else if (typeof body === 'object' && body !== null) {
      parsed = body;
    } else {
      return { success: false, error: 'Invalid payload format' };
    }
  } catch (err) {
    return { success: false, error: `JSON parse error: ${(err as Error).message}` };
  }

  if (!parsed.event || typeof parsed.event !== 'string') {
    return { success: false, error: 'Missing or invalid "event" field' };
  }

  if (!parsed.data || typeof parsed.data !== 'object') {
    return { success: false, error: 'Missing or invalid "data" field' };
  }

  const payload: IncomingWebhookPayload = {
    event: parsed.event,
    data: parsed.data as Record<string, unknown>,
    metadata: parsed.metadata as Record<string, unknown> | undefined,
  };

  return { success: true, data: payload };
}

export function validateEventType(event: string): event is WebhookEventType {
  return VALID_EVENT_TYPES.has(event);
}

export function normalizePayload(payload: IncomingWebhookPayload): IncomingWebhookPayload {
  return {
    event: payload.event.toLowerCase().trim(),
    data: payload.data,
    metadata: payload.metadata ? { ...payload.metadata } : undefined,
  };
}

export function extractPayloadString(raw: RawWebhookPayload): string {
  const { body } = raw;

  if (typeof body === 'string') {
    return body;
  }

  if (Buffer.isBuffer(body)) {
    return body.toString('utf-8');
  }

  return JSON.stringify(body);
}

export function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ['password', 'secret', 'token', 'api_key', 'apiKey', 'authorization'];

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizePayload(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function validatePayloadSize(
  payload: string | Buffer,
  maxSizeBytes: number = 1024 * 1024 // 1MB default
): { valid: boolean; size: number; error?: string } {
  const size = Buffer.byteLength(payload);

  if (size > maxSizeBytes) {
    return {
      valid: false,
      size,
      error: `Payload size ${size} bytes exceeds maximum ${maxSizeBytes} bytes`,
    };
  }

  return { valid: true, size };
}
