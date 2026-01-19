import { WebhookConfig, CreateWebhookRequest, UpdateWebhookRequest, RetryConfig } from '../types/webhook';
import { generateWebhookEndpoint } from '../utils/url-generator';
import { EventLogger } from './event-logger';

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 60000,
  backoffMultiplier: 2,
};

export class WebhookStore {
  private webhooks: Map<string, WebhookConfig> = new Map();
  private byOrganization: Map<string, Set<string>> = new Map();
  private eventLogger: EventLogger;

  constructor(eventLogger: EventLogger) {
    this.eventLogger = eventLogger;
  }

  async create(request: CreateWebhookRequest): Promise<WebhookConfig> {
    const endpoint = generateWebhookEndpoint();

    const webhook: WebhookConfig = {
      id: endpoint.id,
      organizationId: request.organizationId,
      name: request.name,
      url: request.url,
      secret: endpoint.secret,
      status: 'active',
      events: request.events,
      headers: request.headers,
      retryConfig: { ...DEFAULT_RETRY_CONFIG, ...request.retryConfig },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.webhooks.set(webhook.id, webhook);

    const orgWebhooks = this.byOrganization.get(request.organizationId) || new Set();
    orgWebhooks.add(webhook.id);
    this.byOrganization.set(request.organizationId, orgWebhooks);

    await this.eventLogger.logWebhookCreated(webhook.id, webhook.organizationId, {
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
    });

    return webhook;
  }

  async get(id: string): Promise<WebhookConfig | null> {
    return this.webhooks.get(id) || null;
  }

  async getByOrganization(organizationId: string): Promise<WebhookConfig[]> {
    const webhookIds = this.byOrganization.get(organizationId);
    if (!webhookIds) return [];

    return Array.from(webhookIds)
      .map((id) => this.webhooks.get(id))
      .filter((w): w is WebhookConfig => w !== undefined);
  }

  async update(id: string, request: UpdateWebhookRequest): Promise<WebhookConfig | null> {
    const webhook = this.webhooks.get(id);
    if (!webhook) return null;

    const updated: WebhookConfig = {
      ...webhook,
      name: request.name ?? webhook.name,
      url: request.url ?? webhook.url,
      status: request.status ?? webhook.status,
      events: request.events ?? webhook.events,
      headers: request.headers ?? webhook.headers,
      retryConfig: request.retryConfig
        ? { ...webhook.retryConfig, ...request.retryConfig }
        : webhook.retryConfig,
      updatedAt: new Date(),
    };

    this.webhooks.set(id, updated);

    await this.eventLogger.logWebhookUpdated(webhook.id, webhook.organizationId, {
      changes: Object.keys(request),
    });

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const webhook = this.webhooks.get(id);
    if (!webhook) return false;

    this.webhooks.delete(id);

    const orgWebhooks = this.byOrganization.get(webhook.organizationId);
    if (orgWebhooks) {
      orgWebhooks.delete(id);
      if (orgWebhooks.size === 0) {
        this.byOrganization.delete(webhook.organizationId);
      }
    }

    await this.eventLogger.logWebhookDeleted(webhook.id, webhook.organizationId);

    return true;
  }

  async updateLastTriggered(id: string): Promise<void> {
    const webhook = this.webhooks.get(id);
    if (webhook) {
      webhook.lastTriggeredAt = new Date();
      webhook.updatedAt = new Date();
    }
  }

  async getBySecret(secret: string): Promise<WebhookConfig | null> {
    for (const webhook of this.webhooks.values()) {
      if (webhook.secret === secret) {
        return webhook;
      }
    }
    return null;
  }

  async findByUrl(url: string): Promise<WebhookConfig | null> {
    for (const webhook of this.webhooks.values()) {
      if (webhook.url === url) {
        return webhook;
      }
    }
    return null;
  }

  async getActiveWebhooksForEvent(
    organizationId: string,
    event: string
  ): Promise<WebhookConfig[]> {
    const orgWebhooks = await this.getByOrganization(organizationId);
    return orgWebhooks.filter(
      (w) =>
        w.status === 'active' &&
        (w.events.includes(event as any) || w.events.includes('custom'))
    );
  }

  getStats(): {
    total: number;
    byStatus: Record<string, number>;
    byOrganization: number;
  } {
    const byStatus: Record<string, number> = {};

    for (const webhook of this.webhooks.values()) {
      byStatus[webhook.status] = (byStatus[webhook.status] || 0) + 1;
    }

    return {
      total: this.webhooks.size,
      byStatus,
      byOrganization: this.byOrganization.size,
    };
  }
}
