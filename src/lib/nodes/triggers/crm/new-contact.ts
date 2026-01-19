/**
 * New Contact Trigger Node
 * Fires when a new contact is created in the CRM
 */

import type {
  TriggerNodeDefinition,
  TriggerHandler,
  TriggerEvent,
  TriggerContext,
} from '../../types';

export interface NewContactPayload {
  contactId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  source?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  createdAt: string;
}

export interface NewContactConfig {
  sources?: string[];
  requiredTags?: string[];
  filterByCompany?: string;
}

export const newContactTrigger: TriggerNodeDefinition<NewContactConfig> = {
  type: 'trigger.crm.new_contact',
  label: 'New Contact',
  description: 'Triggers when a new contact is created in the CRM',
  category: 'trigger',
  icon: 'user-plus',
  eventType: 'crm.contact.created',
  supportsWebhook: true,
  supportsPolling: true,
  configFields: [
    {
      key: 'sources',
      type: 'multiselect',
      label: 'Filter by Source',
      description: 'Only trigger for contacts from specific sources',
      required: false,
      options: [
        { label: 'Website Form', value: 'website_form' },
        { label: 'Import', value: 'import' },
        { label: 'API', value: 'api' },
        { label: 'Manual Entry', value: 'manual' },
        { label: 'Integration', value: 'integration' },
      ],
    },
    {
      key: 'requiredTags',
      type: 'multiselect',
      label: 'Required Tags',
      description: 'Only trigger for contacts with specific tags',
      required: false,
      options: [],
    },
    {
      key: 'filterByCompany',
      type: 'string',
      label: 'Filter by Company',
      description: 'Only trigger for contacts from a specific company',
      required: false,
      placeholder: 'Enter company name',
    },
  ],
  outputs: {
    contact: {
      type: 'object',
      label: 'Contact Data',
    },
  },
  defaultConfig: {},
};

export const newContactHandler: TriggerHandler<NewContactPayload> = {
  validate(
    event: TriggerEvent<NewContactPayload>,
    context: TriggerContext
  ): boolean {
    const config = context.config as NewContactConfig;
    const { payload } = event;

    // Filter by source if configured
    if (config.sources && config.sources.length > 0) {
      if (!payload.source || !config.sources.includes(payload.source)) {
        return false;
      }
    }

    // Filter by required tags if configured
    if (config.requiredTags && config.requiredTags.length > 0) {
      if (!payload.tags) {
        return false;
      }
      const hasAllTags = config.requiredTags.every((tag) =>
        payload.tags!.includes(tag)
      );
      if (!hasAllTags) {
        return false;
      }
    }

    // Filter by company if configured
    if (config.filterByCompany) {
      if (
        !payload.company ||
        !payload.company
          .toLowerCase()
          .includes(config.filterByCompany.toLowerCase())
      ) {
        return false;
      }
    }

    return true;
  },

  transform(
    event: TriggerEvent<NewContactPayload>,
    _context: TriggerContext
  ): Record<string, unknown> {
    const { payload } = event;

    return {
      contact: {
        id: payload.contactId,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        fullName: [payload.firstName, payload.lastName]
          .filter(Boolean)
          .join(' '),
        company: payload.company,
        phone: payload.phone,
        source: payload.source,
        tags: payload.tags || [],
        customFields: payload.customFields || {},
        createdAt: payload.createdAt,
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
