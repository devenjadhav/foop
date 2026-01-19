import { v4 as uuidv4 } from 'uuid';
import {
  WebhookConfig,
  WebhookPayload,
  WebhookDeliveryAttempt,
  WebhookDeliveryResult,
  RetryConfig,
} from '../types/webhook';
import { createSignatureHeader } from '../utils/signature';
import { EventLogger } from './event-logger';

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 60000,
  backoffMultiplier: 2,
};

export class WebhookDeliveryService {
  private eventLogger: EventLogger;

  constructor(eventLogger: EventLogger) {
    this.eventLogger = eventLogger;
  }

  async deliver(
    webhook: WebhookConfig,
    payload: WebhookPayload
  ): Promise<WebhookDeliveryResult> {
    const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...webhook.retryConfig };
    const startTime = Date.now();
    let lastAttempt: WebhookDeliveryAttempt | null = null;

    for (let attempt = 1; attempt <= retryConfig.maxRetries + 1; attempt++) {
      const attemptResult = await this.attemptDelivery(webhook, payload, attempt);
      lastAttempt = attemptResult;

      await this.eventLogger.logDeliveryAttempt(attemptResult);

      if (attemptResult.status === 'success') {
        return {
          success: true,
          attempts: attempt,
          finalStatusCode: attemptResult.statusCode,
          duration: Date.now() - startTime,
        };
      }

      if (attempt <= retryConfig.maxRetries) {
        const delay = this.calculateBackoff(attempt, retryConfig);
        await this.sleep(delay);
      }
    }

    return {
      success: false,
      attempts: retryConfig.maxRetries + 1,
      finalStatusCode: lastAttempt?.statusCode,
      errorMessage: lastAttempt?.errorMessage || 'Max retries exceeded',
      duration: Date.now() - startTime,
    };
  }

  private async attemptDelivery(
    webhook: WebhookConfig,
    payload: WebhookPayload,
    attemptNumber: number
  ): Promise<WebhookDeliveryAttempt> {
    const attemptId = `att_${uuidv4().replace(/-/g, '')}`;
    const payloadString = JSON.stringify(payload);
    const { header: signatureHeader, timestamp } = createSignatureHeader(
      payloadString,
      webhook.secret
    );

    const startTime = Date.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Id': webhook.id,
        'X-Webhook-Signature': signatureHeader,
        'X-Webhook-Timestamp': timestamp,
        'X-Delivery-Id': attemptId,
        'User-Agent': 'Foop-Webhook/1.0',
        ...webhook.headers,
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: payloadString,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const duration = Date.now() - startTime;
      const responseBody = await response.text();

      const isSuccess = response.status >= 200 && response.status < 300;

      return {
        id: attemptId,
        webhookId: webhook.id,
        payloadId: payload.id,
        attempt: attemptNumber,
        status: isSuccess ? 'success' : 'failed',
        statusCode: response.status,
        responseBody: responseBody.substring(0, 1000),
        duration,
        createdAt: new Date(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        id: attemptId,
        webhookId: webhook.id,
        payloadId: payload.id,
        attempt: attemptNumber,
        status: 'failed',
        errorMessage,
        duration,
        createdAt: new Date(),
      };
    }
  }

  private calculateBackoff(attempt: number, config: RetryConfig): number {
    const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
    const jitter = Math.random() * 0.3 * delay;
    return Math.min(delay + jitter, config.maxDelayMs);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async deliverBatch(
    webhook: WebhookConfig,
    payloads: WebhookPayload[]
  ): Promise<Map<string, WebhookDeliveryResult>> {
    const results = new Map<string, WebhookDeliveryResult>();

    for (const payload of payloads) {
      const result = await this.deliver(webhook, payload);
      results.set(payload.id, result);
    }

    return results;
  }
}

export function createWebhookPayload(
  webhookId: string,
  event: WebhookPayload['event'],
  data: Record<string, unknown>,
  metadata?: Record<string, unknown>
): WebhookPayload {
  return {
    id: `evt_${uuidv4().replace(/-/g, '')}`,
    webhookId,
    event,
    timestamp: new Date().toISOString(),
    data,
    metadata,
  };
}
