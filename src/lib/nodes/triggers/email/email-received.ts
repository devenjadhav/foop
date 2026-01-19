/**
 * Email Received Trigger Node
 * Fires when an email is received
 */

import type {
  TriggerNodeDefinition,
  TriggerHandler,
  TriggerEvent,
  TriggerContext,
} from '../../types';

export interface EmailReceivedPayload {
  messageId: string;
  threadId?: string;
  from: {
    email: string;
    name?: string;
  };
  to: Array<{
    email: string;
    name?: string;
  }>;
  cc?: Array<{
    email: string;
    name?: string;
  }>;
  subject: string;
  bodyPreview?: string;
  bodyHtml?: string;
  bodyText?: string;
  hasAttachments: boolean;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
  labels?: string[];
  receivedAt: string;
}

export interface EmailReceivedConfig {
  fromAddresses?: string[];
  fromDomains?: string[];
  subjectContains?: string;
  subjectNotContains?: string;
  hasAttachments?: boolean;
  labels?: string[];
  excludeLabels?: string[];
}

export const emailReceivedTrigger: TriggerNodeDefinition<EmailReceivedConfig> = {
  type: 'trigger.email.received',
  label: 'Email Received',
  description: 'Triggers when an email is received in the inbox',
  category: 'trigger',
  icon: 'mail',
  eventType: 'email.received',
  supportsWebhook: true,
  supportsPolling: true,
  configFields: [
    {
      key: 'fromAddresses',
      type: 'multiselect',
      label: 'From Addresses',
      description: 'Only trigger for emails from specific addresses',
      required: false,
      options: [],
    },
    {
      key: 'fromDomains',
      type: 'multiselect',
      label: 'From Domains',
      description: 'Only trigger for emails from specific domains',
      required: false,
      options: [],
    },
    {
      key: 'subjectContains',
      type: 'string',
      label: 'Subject Contains',
      description: 'Only trigger when subject contains this text',
      required: false,
      placeholder: 'Enter text to match',
    },
    {
      key: 'subjectNotContains',
      type: 'string',
      label: 'Subject Does Not Contain',
      description: 'Exclude emails where subject contains this text',
      required: false,
      placeholder: 'Enter text to exclude',
    },
    {
      key: 'hasAttachments',
      type: 'boolean',
      label: 'Has Attachments',
      description: 'Only trigger for emails with attachments',
      required: false,
    },
    {
      key: 'labels',
      type: 'multiselect',
      label: 'Include Labels',
      description: 'Only trigger for emails with specific labels',
      required: false,
      options: [
        { label: 'Inbox', value: 'inbox' },
        { label: 'Important', value: 'important' },
        { label: 'Starred', value: 'starred' },
      ],
    },
    {
      key: 'excludeLabels',
      type: 'multiselect',
      label: 'Exclude Labels',
      description: 'Exclude emails with specific labels',
      required: false,
      options: [
        { label: 'Spam', value: 'spam' },
        { label: 'Trash', value: 'trash' },
        { label: 'Promotions', value: 'promotions' },
      ],
    },
  ],
  outputs: {
    email: {
      type: 'object',
      label: 'Email Data',
    },
  },
  defaultConfig: {},
};

export const emailReceivedHandler: TriggerHandler<EmailReceivedPayload> = {
  validate(
    event: TriggerEvent<EmailReceivedPayload>,
    context: TriggerContext
  ): boolean {
    const config = context.config as EmailReceivedConfig;
    const { payload } = event;

    // Filter by from addresses
    if (config.fromAddresses && config.fromAddresses.length > 0) {
      const fromEmail = payload.from.email.toLowerCase();
      const matches = config.fromAddresses.some(
        (addr) => addr.toLowerCase() === fromEmail
      );
      if (!matches) {
        return false;
      }
    }

    // Filter by from domains
    if (config.fromDomains && config.fromDomains.length > 0) {
      const fromDomain = payload.from.email.split('@')[1]?.toLowerCase();
      const matches = config.fromDomains.some(
        (domain) => domain.toLowerCase() === fromDomain
      );
      if (!matches) {
        return false;
      }
    }

    // Filter by subject contains
    if (config.subjectContains) {
      if (
        !payload.subject
          .toLowerCase()
          .includes(config.subjectContains.toLowerCase())
      ) {
        return false;
      }
    }

    // Filter by subject not contains
    if (config.subjectNotContains) {
      if (
        payload.subject
          .toLowerCase()
          .includes(config.subjectNotContains.toLowerCase())
      ) {
        return false;
      }
    }

    // Filter by attachments
    if (config.hasAttachments !== undefined) {
      if (payload.hasAttachments !== config.hasAttachments) {
        return false;
      }
    }

    // Filter by labels
    if (config.labels && config.labels.length > 0) {
      if (!payload.labels) {
        return false;
      }
      const hasRequiredLabel = config.labels.some((label) =>
        payload.labels!.includes(label)
      );
      if (!hasRequiredLabel) {
        return false;
      }
    }

    // Filter by excluded labels
    if (config.excludeLabels && config.excludeLabels.length > 0) {
      if (payload.labels) {
        const hasExcludedLabel = config.excludeLabels.some((label) =>
          payload.labels!.includes(label)
        );
        if (hasExcludedLabel) {
          return false;
        }
      }
    }

    return true;
  },

  transform(
    event: TriggerEvent<EmailReceivedPayload>,
    _context: TriggerContext
  ): Record<string, unknown> {
    const { payload } = event;

    return {
      email: {
        messageId: payload.messageId,
        threadId: payload.threadId,
        from: payload.from,
        to: payload.to,
        cc: payload.cc || [],
        subject: payload.subject,
        bodyPreview: payload.bodyPreview,
        bodyHtml: payload.bodyHtml,
        bodyText: payload.bodyText,
        hasAttachments: payload.hasAttachments,
        attachments: payload.attachments || [],
        labels: payload.labels || [],
        receivedAt: payload.receivedAt,
      },
      event: {
        id: event.id,
        type: event.type,
        timestamp: event.timestamp,
        source: event.source,
      },
    };
  },
};
