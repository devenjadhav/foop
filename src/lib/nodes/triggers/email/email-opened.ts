/**
 * Email Opened Trigger Node
 * Fires when a tracked email is opened by the recipient
 */

import type {
  TriggerNodeDefinition,
  TriggerHandler,
  TriggerEvent,
  TriggerContext,
} from '../../types';

export interface EmailOpenedPayload {
  messageId: string;
  campaignId?: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  openCount: number;
  firstOpenedAt?: string;
  openedAt: string;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
  device?: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    os?: string;
    browser?: string;
  };
}

export interface EmailOpenedConfig {
  campaigns?: string[];
  recipientDomains?: string[];
  firstOpenOnly?: boolean;
  minOpenCount?: number;
  deviceTypes?: Array<'desktop' | 'mobile' | 'tablet'>;
  countries?: string[];
}

export const emailOpenedTrigger: TriggerNodeDefinition<EmailOpenedConfig> = {
  type: 'trigger.email.opened',
  label: 'Email Opened',
  description: 'Triggers when a recipient opens a tracked email',
  category: 'trigger',
  icon: 'mail-open',
  eventType: 'email.opened',
  supportsWebhook: true,
  supportsPolling: false,
  configFields: [
    {
      key: 'campaigns',
      type: 'multiselect',
      label: 'Campaigns',
      description: 'Only trigger for emails from specific campaigns',
      required: false,
      options: [],
    },
    {
      key: 'recipientDomains',
      type: 'multiselect',
      label: 'Recipient Domains',
      description: 'Only trigger for recipients from specific domains',
      required: false,
      options: [],
    },
    {
      key: 'firstOpenOnly',
      type: 'boolean',
      label: 'First Open Only',
      description: 'Only trigger on the first open, ignore subsequent opens',
      required: false,
      default: false,
    },
    {
      key: 'minOpenCount',
      type: 'number',
      label: 'Minimum Open Count',
      description: 'Only trigger after email has been opened this many times',
      required: false,
      placeholder: '1',
    },
    {
      key: 'deviceTypes',
      type: 'multiselect',
      label: 'Device Types',
      description: 'Only trigger for opens from specific device types',
      required: false,
      options: [
        { label: 'Desktop', value: 'desktop' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'Tablet', value: 'tablet' },
      ],
    },
    {
      key: 'countries',
      type: 'multiselect',
      label: 'Countries',
      description: 'Only trigger for opens from specific countries',
      required: false,
      options: [],
    },
  ],
  outputs: {
    open: {
      type: 'object',
      label: 'Open Event Data',
    },
    recipient: {
      type: 'object',
      label: 'Recipient Data',
    },
  },
  defaultConfig: {
    firstOpenOnly: false,
  },
};

export const emailOpenedHandler: TriggerHandler<EmailOpenedPayload> = {
  validate(
    event: TriggerEvent<EmailOpenedPayload>,
    context: TriggerContext
  ): boolean {
    const config = context.config as EmailOpenedConfig;
    const { payload } = event;

    // Filter by campaigns
    if (config.campaigns && config.campaigns.length > 0) {
      if (!payload.campaignId || !config.campaigns.includes(payload.campaignId)) {
        return false;
      }
    }

    // Filter by recipient domains
    if (config.recipientDomains && config.recipientDomains.length > 0) {
      const recipientDomain = payload.recipientEmail
        .split('@')[1]
        ?.toLowerCase();
      const matches = config.recipientDomains.some(
        (domain) => domain.toLowerCase() === recipientDomain
      );
      if (!matches) {
        return false;
      }
    }

    // Filter by first open only
    if (config.firstOpenOnly) {
      if (payload.openCount > 1) {
        return false;
      }
    }

    // Filter by minimum open count
    if (config.minOpenCount !== undefined) {
      if (payload.openCount < config.minOpenCount) {
        return false;
      }
    }

    // Filter by device types
    if (config.deviceTypes && config.deviceTypes.length > 0) {
      if (
        !payload.device ||
        payload.device.type === 'unknown' ||
        !config.deviceTypes.includes(payload.device.type as 'desktop' | 'mobile' | 'tablet')
      ) {
        return false;
      }
    }

    // Filter by countries
    if (config.countries && config.countries.length > 0) {
      if (
        !payload.location?.country ||
        !config.countries.includes(payload.location.country)
      ) {
        return false;
      }
    }

    return true;
  },

  transform(
    event: TriggerEvent<EmailOpenedPayload>,
    _context: TriggerContext
  ): Record<string, unknown> {
    const { payload } = event;

    return {
      open: {
        messageId: payload.messageId,
        campaignId: payload.campaignId,
        subject: payload.subject,
        openCount: payload.openCount,
        firstOpenedAt: payload.firstOpenedAt,
        openedAt: payload.openedAt,
        isFirstOpen: payload.openCount === 1,
      },
      recipient: {
        email: payload.recipientEmail,
        name: payload.recipientName,
        domain: payload.recipientEmail.split('@')[1],
      },
      device: payload.device || {
        type: 'unknown',
        os: null,
        browser: null,
      },
      location: payload.location || {
        city: null,
        region: null,
        country: null,
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
