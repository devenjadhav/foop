/**
 * Manual Trigger Node
 * Fires when manually triggered via the UI button
 */

import type {
  TriggerNodeDefinition,
  TriggerHandler,
  TriggerEvent,
  TriggerContext,
} from '../../types';

export interface ManualPayload {
  triggeredBy: string;
  triggeredByEmail?: string;
  triggeredAt: string;
  inputData?: Record<string, unknown>;
  note?: string;
}

export interface ManualConfig {
  requireConfirmation?: boolean;
  confirmationMessage?: string;
  allowInputData?: boolean;
  inputDataSchema?: Record<string, unknown>;
  buttonLabel?: string;
  buttonColor?: string;
}

export const manualTrigger: TriggerNodeDefinition<ManualConfig> = {
  type: 'trigger.core.manual',
  label: 'Manual Trigger',
  description: 'Triggers when manually activated via the Run button in the UI',
  category: 'trigger',
  icon: 'play',
  eventType: 'core.manual.triggered',
  supportsWebhook: false,
  supportsPolling: false,
  configFields: [
    {
      key: 'buttonLabel',
      type: 'string',
      label: 'Button Label',
      description: 'Custom label for the trigger button',
      required: false,
      placeholder: 'Run Workflow',
      default: 'Run Workflow',
    },
    {
      key: 'buttonColor',
      type: 'select',
      label: 'Button Color',
      description: 'Color theme for the trigger button',
      required: false,
      options: [
        { label: 'Primary (Blue)', value: 'primary' },
        { label: 'Success (Green)', value: 'success' },
        { label: 'Warning (Orange)', value: 'warning' },
        { label: 'Danger (Red)', value: 'danger' },
        { label: 'Neutral (Gray)', value: 'neutral' },
      ],
      default: 'primary',
    },
    {
      key: 'requireConfirmation',
      type: 'boolean',
      label: 'Require Confirmation',
      description: 'Show a confirmation dialog before triggering',
      required: false,
      default: false,
    },
    {
      key: 'confirmationMessage',
      type: 'string',
      label: 'Confirmation Message',
      description: 'Message to show in the confirmation dialog',
      required: false,
      placeholder: 'Are you sure you want to run this workflow?',
    },
    {
      key: 'allowInputData',
      type: 'boolean',
      label: 'Allow Input Data',
      description: 'Allow users to provide input data when triggering',
      required: false,
      default: false,
    },
    {
      key: 'inputDataSchema',
      type: 'json',
      label: 'Input Data Schema',
      description: 'JSON schema defining the expected input data structure',
      required: false,
      placeholder: '{"type": "object", "properties": {...}}',
    },
  ],
  outputs: {
    trigger: {
      type: 'object',
      label: 'Trigger Data',
    },
    user: {
      type: 'object',
      label: 'User Who Triggered',
    },
    inputData: {
      type: 'object',
      label: 'User Input Data',
    },
  },
  defaultConfig: {
    buttonLabel: 'Run Workflow',
    buttonColor: 'primary',
    requireConfirmation: false,
    allowInputData: false,
  },
};

export const manualHandler: TriggerHandler<ManualPayload> = {
  validate(
    _event: TriggerEvent<ManualPayload>,
    _context: TriggerContext
  ): boolean {
    // Manual triggers always pass validation as they are explicitly initiated
    return true;
  },

  transform(
    event: TriggerEvent<ManualPayload>,
    _context: TriggerContext
  ): Record<string, unknown> {
    const { payload } = event;

    return {
      trigger: {
        triggeredAt: payload.triggeredAt,
        note: payload.note,
      },
      user: {
        id: payload.triggeredBy,
        email: payload.triggeredByEmail,
      },
      inputData: payload.inputData || {},
      event: {
        id: event.id,
        type: event.type,
        timestamp: event.timestamp,
        source: event.source,
      },
    };
  },
};
