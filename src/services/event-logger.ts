import { v4 as uuidv4 } from 'uuid';
import { WebhookDeliveryAttempt, WebhookPayload } from '../types/webhook';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface EventLogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: string;
  event: string;
  webhookId?: string;
  organizationId?: string;
  data: Record<string, unknown>;
}

export interface EventLoggerConfig {
  minLevel: LogLevel;
  maxEntries: number;
  persistFn?: (entry: EventLogEntry) => Promise<void>;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const DEFAULT_CONFIG: EventLoggerConfig = {
  minLevel: 'info',
  maxEntries: 10000,
};

export class EventLogger {
  private config: EventLoggerConfig;
  private logs: EventLogEntry[] = [];

  constructor(config: Partial<EventLoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel];
  }

  private async log(
    level: LogLevel,
    category: string,
    event: string,
    data: Record<string, unknown>,
    webhookId?: string,
    organizationId?: string
  ): Promise<EventLogEntry> {
    const entry: EventLogEntry = {
      id: `log_${uuidv4().replace(/-/g, '')}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      event,
      webhookId,
      organizationId,
      data,
    };

    if (this.shouldLog(level)) {
      this.logs.push(entry);

      if (this.logs.length > this.config.maxEntries) {
        this.logs = this.logs.slice(-this.config.maxEntries);
      }

      if (this.config.persistFn) {
        await this.config.persistFn(entry);
      }
    }

    return entry;
  }

  async logWebhookCreated(
    webhookId: string,
    organizationId: string,
    data: Record<string, unknown>
  ): Promise<EventLogEntry> {
    return this.log('info', 'webhook', 'webhook.created', data, webhookId, organizationId);
  }

  async logWebhookUpdated(
    webhookId: string,
    organizationId: string,
    data: Record<string, unknown>
  ): Promise<EventLogEntry> {
    return this.log('info', 'webhook', 'webhook.updated', data, webhookId, organizationId);
  }

  async logWebhookDeleted(
    webhookId: string,
    organizationId: string
  ): Promise<EventLogEntry> {
    return this.log('info', 'webhook', 'webhook.deleted', {}, webhookId, organizationId);
  }

  async logDeliveryAttempt(attempt: WebhookDeliveryAttempt): Promise<EventLogEntry> {
    const level: LogLevel = attempt.status === 'success' ? 'info' : 'warn';
    return this.log(
      level,
      'delivery',
      'delivery.attempt',
      {
        attemptId: attempt.id,
        payloadId: attempt.payloadId,
        attempt: attempt.attempt,
        status: attempt.status,
        statusCode: attempt.statusCode,
        duration: attempt.duration,
        errorMessage: attempt.errorMessage,
      },
      attempt.webhookId
    );
  }

  async logDeliveryCompleted(
    webhookId: string,
    payloadId: string,
    success: boolean,
    totalAttempts: number,
    duration: number
  ): Promise<EventLogEntry> {
    const level: LogLevel = success ? 'info' : 'error';
    return this.log(level, 'delivery', 'delivery.completed', {
      payloadId,
      success,
      totalAttempts,
      duration,
    }, webhookId);
  }

  async logInboundReceived(
    webhookId: string,
    organizationId: string,
    event: string,
    payloadSize: number
  ): Promise<EventLogEntry> {
    return this.log(
      'info',
      'inbound',
      'inbound.received',
      { event, payloadSize },
      webhookId,
      organizationId
    );
  }

  async logSignatureVerification(
    webhookId: string,
    success: boolean,
    error?: string
  ): Promise<EventLogEntry> {
    const level: LogLevel = success ? 'debug' : 'warn';
    return this.log(
      level,
      'security',
      'signature.verification',
      { success, error },
      webhookId
    );
  }

  async logError(
    category: string,
    event: string,
    error: Error | string,
    webhookId?: string,
    organizationId?: string
  ): Promise<EventLogEntry> {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    return this.log(
      'error',
      category,
      event,
      { error: errorMessage, stack: errorStack },
      webhookId,
      organizationId
    );
  }

  getLogs(options: {
    level?: LogLevel;
    category?: string;
    webhookId?: string;
    organizationId?: string;
    since?: Date;
    limit?: number;
  } = {}): EventLogEntry[] {
    let filtered = [...this.logs];

    if (options.level) {
      const minPriority = LOG_LEVEL_PRIORITY[options.level];
      filtered = filtered.filter(
        (log) => LOG_LEVEL_PRIORITY[log.level] >= minPriority
      );
    }

    if (options.category) {
      filtered = filtered.filter((log) => log.category === options.category);
    }

    if (options.webhookId) {
      filtered = filtered.filter((log) => log.webhookId === options.webhookId);
    }

    if (options.organizationId) {
      filtered = filtered.filter(
        (log) => log.organizationId === options.organizationId
      );
    }

    if (options.since) {
      const sinceTime = options.since.getTime();
      filtered = filtered.filter(
        (log) => new Date(log.timestamp).getTime() >= sinceTime
      );
    }

    if (options.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  }

  clearLogs(): void {
    this.logs = [];
  }

  getStats(): {
    totalEntries: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<string, number>;
  } {
    const byLevel: Record<LogLevel, number> = { debug: 0, info: 0, warn: 0, error: 0 };
    const byCategory: Record<string, number> = {};

    for (const log of this.logs) {
      byLevel[log.level]++;
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;
    }

    return {
      totalEntries: this.logs.length,
      byLevel,
      byCategory,
    };
  }
}
