/**
 * Deal Updated Trigger Node
 * Fires when a deal is updated in the CRM
 */

import type {
  TriggerNodeDefinition,
  TriggerHandler,
  TriggerEvent,
  TriggerContext,
} from '../../types';

export interface DealUpdatedPayload {
  dealId: string;
  name: string;
  value?: number;
  currency?: string;
  stage: string;
  previousStage?: string;
  probability?: number;
  expectedCloseDate?: string;
  contactId?: string;
  companyId?: string;
  ownerId?: string;
  changedFields: string[];
  customFields?: Record<string, unknown>;
  updatedAt: string;
}

export interface DealUpdatedConfig {
  stages?: string[];
  previousStages?: string[];
  changedFields?: string[];
  minValue?: number;
  maxValue?: number;
  onlyStageChanges?: boolean;
}

export const dealUpdatedTrigger: TriggerNodeDefinition<DealUpdatedConfig> = {
  type: 'trigger.crm.deal_updated',
  label: 'Deal Updated',
  description: 'Triggers when a deal is updated in the CRM',
  category: 'trigger',
  icon: 'briefcase',
  eventType: 'crm.deal.updated',
  supportsWebhook: true,
  supportsPolling: true,
  configFields: [
    {
      key: 'stages',
      type: 'multiselect',
      label: 'Current Stage',
      description: 'Only trigger when deal moves to specific stages',
      required: false,
      options: [
        { label: 'Lead', value: 'lead' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'Proposal', value: 'proposal' },
        { label: 'Negotiation', value: 'negotiation' },
        { label: 'Closed Won', value: 'closed_won' },
        { label: 'Closed Lost', value: 'closed_lost' },
      ],
    },
    {
      key: 'previousStages',
      type: 'multiselect',
      label: 'Previous Stage',
      description: 'Only trigger when deal moves from specific stages',
      required: false,
      options: [
        { label: 'Lead', value: 'lead' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'Proposal', value: 'proposal' },
        { label: 'Negotiation', value: 'negotiation' },
        { label: 'Closed Won', value: 'closed_won' },
        { label: 'Closed Lost', value: 'closed_lost' },
      ],
    },
    {
      key: 'changedFields',
      type: 'multiselect',
      label: 'Changed Fields',
      description: 'Only trigger when specific fields are changed',
      required: false,
      options: [
        { label: 'Stage', value: 'stage' },
        { label: 'Value', value: 'value' },
        { label: 'Owner', value: 'ownerId' },
        { label: 'Expected Close Date', value: 'expectedCloseDate' },
        { label: 'Probability', value: 'probability' },
      ],
    },
    {
      key: 'minValue',
      type: 'number',
      label: 'Minimum Deal Value',
      description: 'Only trigger for deals above this value',
      required: false,
      placeholder: '0',
    },
    {
      key: 'maxValue',
      type: 'number',
      label: 'Maximum Deal Value',
      description: 'Only trigger for deals below this value',
      required: false,
      placeholder: '1000000',
    },
    {
      key: 'onlyStageChanges',
      type: 'boolean',
      label: 'Only Stage Changes',
      description: 'Only trigger when the deal stage changes',
      required: false,
      default: false,
    },
  ],
  outputs: {
    deal: {
      type: 'object',
      label: 'Deal Data',
    },
    changes: {
      type: 'object',
      label: 'Changed Fields',
    },
  },
  defaultConfig: {
    onlyStageChanges: false,
  },
};

export const dealUpdatedHandler: TriggerHandler<DealUpdatedPayload> = {
  validate(
    event: TriggerEvent<DealUpdatedPayload>,
    context: TriggerContext
  ): boolean {
    const config = context.config as DealUpdatedConfig;
    const { payload } = event;

    // Filter by only stage changes
    if (config.onlyStageChanges) {
      if (!payload.changedFields.includes('stage')) {
        return false;
      }
    }

    // Filter by current stage
    if (config.stages && config.stages.length > 0) {
      if (!config.stages.includes(payload.stage)) {
        return false;
      }
    }

    // Filter by previous stage
    if (config.previousStages && config.previousStages.length > 0) {
      if (
        !payload.previousStage ||
        !config.previousStages.includes(payload.previousStage)
      ) {
        return false;
      }
    }

    // Filter by changed fields
    if (config.changedFields && config.changedFields.length > 0) {
      const hasChangedField = config.changedFields.some((field) =>
        payload.changedFields.includes(field)
      );
      if (!hasChangedField) {
        return false;
      }
    }

    // Filter by minimum value
    if (config.minValue !== undefined && payload.value !== undefined) {
      if (payload.value < config.minValue) {
        return false;
      }
    }

    // Filter by maximum value
    if (config.maxValue !== undefined && payload.value !== undefined) {
      if (payload.value > config.maxValue) {
        return false;
      }
    }

    return true;
  },

  transform(
    event: TriggerEvent<DealUpdatedPayload>,
    _context: TriggerContext
  ): Record<string, unknown> {
    const { payload } = event;

    return {
      deal: {
        id: payload.dealId,
        name: payload.name,
        value: payload.value,
        currency: payload.currency || 'USD',
        stage: payload.stage,
        previousStage: payload.previousStage,
        probability: payload.probability,
        expectedCloseDate: payload.expectedCloseDate,
        contactId: payload.contactId,
        companyId: payload.companyId,
        ownerId: payload.ownerId,
        customFields: payload.customFields || {},
        updatedAt: payload.updatedAt,
      },
      changes: {
        fields: payload.changedFields,
        stageChanged: payload.changedFields.includes('stage'),
        valueChanged: payload.changedFields.includes('value'),
        previousStage: payload.previousStage,
        currentStage: payload.stage,
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
