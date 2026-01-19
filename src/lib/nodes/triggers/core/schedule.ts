/**
 * Schedule Trigger Node
 * Fires on a cron schedule
 */

import type {
  TriggerNodeDefinition,
  TriggerHandler,
  TriggerEvent,
  TriggerContext,
} from '../../types';

export interface SchedulePayload {
  scheduledTime: string;
  actualTime: string;
  cronExpression: string;
  timezone: string;
  executionCount: number;
  previousExecution?: string;
  nextExecution?: string;
}

export interface ScheduleConfig {
  cronExpression?: string;
  timezone?: string;
  enabled?: boolean;
  startDate?: string;
  endDate?: string;
}

/**
 * Common cron presets for the schedule picker
 */
export const CRON_PRESETS = [
  { label: 'Every minute', value: '* * * * *', description: 'Runs every minute' },
  { label: 'Every 5 minutes', value: '*/5 * * * *', description: 'Runs every 5 minutes' },
  { label: 'Every 15 minutes', value: '*/15 * * * *', description: 'Runs every 15 minutes' },
  { label: 'Every 30 minutes', value: '*/30 * * * *', description: 'Runs every 30 minutes' },
  { label: 'Every hour', value: '0 * * * *', description: 'Runs at the start of every hour' },
  { label: 'Every 2 hours', value: '0 */2 * * *', description: 'Runs every 2 hours' },
  { label: 'Every 6 hours', value: '0 */6 * * *', description: 'Runs every 6 hours' },
  { label: 'Every 12 hours', value: '0 */12 * * *', description: 'Runs at midnight and noon' },
  { label: 'Daily at midnight', value: '0 0 * * *', description: 'Runs once per day at 00:00' },
  { label: 'Daily at 9 AM', value: '0 9 * * *', description: 'Runs once per day at 09:00' },
  { label: 'Weekly on Monday', value: '0 0 * * 1', description: 'Runs every Monday at midnight' },
  { label: 'Weekly on Friday', value: '0 17 * * 5', description: 'Runs every Friday at 5 PM' },
  { label: 'Monthly on the 1st', value: '0 0 1 * *', description: 'Runs on the 1st of every month' },
  { label: 'Quarterly', value: '0 0 1 */3 *', description: 'Runs on the 1st of every quarter' },
  { label: 'Yearly', value: '0 0 1 1 *', description: 'Runs on January 1st each year' },
] as const;

/**
 * Common timezones for the schedule picker
 */
export const TIMEZONES = [
  { label: 'UTC', value: 'UTC' },
  { label: 'America/New_York (EST/EDT)', value: 'America/New_York' },
  { label: 'America/Chicago (CST/CDT)', value: 'America/Chicago' },
  { label: 'America/Denver (MST/MDT)', value: 'America/Denver' },
  { label: 'America/Los_Angeles (PST/PDT)', value: 'America/Los_Angeles' },
  { label: 'Europe/London (GMT/BST)', value: 'Europe/London' },
  { label: 'Europe/Paris (CET/CEST)', value: 'Europe/Paris' },
  { label: 'Europe/Berlin (CET/CEST)', value: 'Europe/Berlin' },
  { label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Asia/Shanghai (CST)', value: 'Asia/Shanghai' },
  { label: 'Asia/Singapore (SGT)', value: 'Asia/Singapore' },
  { label: 'Australia/Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
] as const;

/**
 * Parse cron expression into human-readable format
 */
export function parseCronToHuman(cronExpression: string): string {
  const preset = CRON_PRESETS.find(p => p.value === cronExpression);
  if (preset) {
    return preset.description;
  }

  const parts = cronExpression.split(' ');
  if (parts.length !== 5) {
    return 'Invalid cron expression';
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Simple parsing for common patterns
  if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every minute';
  }

  if (minute.startsWith('*/') && hour === '*') {
    return `Every ${minute.slice(2)} minutes`;
  }

  if (minute === '0' && hour.startsWith('*/')) {
    return `Every ${hour.slice(2)} hours`;
  }

  return `Cron: ${cronExpression}`;
}

/**
 * Validate a cron expression
 */
export function validateCronExpression(expression: string): boolean {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return false;
  }

  const patterns = [
    /^(\*|(\d+|\*)(\/\d+)?|(\d+(-\d+)?)(,(\d+(-\d+)?))*)$/, // minute (0-59)
    /^(\*|(\d+|\*)(\/\d+)?|(\d+(-\d+)?)(,(\d+(-\d+)?))*)$/, // hour (0-23)
    /^(\*|(\d+|\*)(\/\d+)?|(\d+(-\d+)?)(,(\d+(-\d+)?))*)$/, // day of month (1-31)
    /^(\*|(\d+|\*)(\/\d+)?|(\d+(-\d+)?)(,(\d+(-\d+)?))*)$/, // month (1-12)
    /^(\*|(\d+|\*)(\/\d+)?|(\d+(-\d+)?)(,(\d+(-\d+)?))*)$/, // day of week (0-6)
  ];

  return parts.every((part, index) => patterns[index].test(part));
}

export const scheduleTrigger: TriggerNodeDefinition<ScheduleConfig> = {
  type: 'trigger.core.schedule',
  label: 'Schedule',
  description: 'Triggers on a recurring schedule using cron expressions',
  category: 'trigger',
  icon: 'clock',
  eventType: 'core.schedule.tick',
  supportsWebhook: false,
  supportsPolling: false,
  configFields: [
    {
      key: 'cronExpression',
      type: 'cron',
      label: 'Schedule',
      description: 'When to run the workflow (cron expression)',
      required: true,
      placeholder: '0 9 * * *',
      default: '0 9 * * *',
    },
    {
      key: 'timezone',
      type: 'select',
      label: 'Timezone',
      description: 'Timezone for the schedule',
      required: false,
      options: TIMEZONES.map(tz => ({ label: tz.label, value: tz.value })),
      default: 'UTC',
    },
    {
      key: 'enabled',
      type: 'boolean',
      label: 'Enabled',
      description: 'Whether the schedule is active',
      required: false,
      default: true,
    },
    {
      key: 'startDate',
      type: 'string',
      label: 'Start Date',
      description: 'Optional date to start the schedule (ISO 8601)',
      required: false,
      placeholder: '2024-01-01T00:00:00Z',
    },
    {
      key: 'endDate',
      type: 'string',
      label: 'End Date',
      description: 'Optional date to end the schedule (ISO 8601)',
      required: false,
      placeholder: '2024-12-31T23:59:59Z',
    },
  ],
  outputs: {
    schedule: {
      type: 'object',
      label: 'Schedule Data',
    },
    timestamp: {
      type: 'string',
      label: 'Execution Timestamp',
    },
  },
  defaultConfig: {
    cronExpression: '0 9 * * *',
    timezone: 'UTC',
    enabled: true,
  },
};

export const scheduleHandler: TriggerHandler<SchedulePayload> = {
  validate(
    event: TriggerEvent<SchedulePayload>,
    context: TriggerContext
  ): boolean {
    const config = context.config as ScheduleConfig;
    const { payload } = event;

    // Check if schedule is enabled
    if (config.enabled === false) {
      return false;
    }

    // Check start date constraint
    if (config.startDate) {
      const startDate = new Date(config.startDate);
      const executionDate = new Date(payload.actualTime);
      if (executionDate < startDate) {
        return false;
      }
    }

    // Check end date constraint
    if (config.endDate) {
      const endDate = new Date(config.endDate);
      const executionDate = new Date(payload.actualTime);
      if (executionDate > endDate) {
        return false;
      }
    }

    return true;
  },

  transform(
    event: TriggerEvent<SchedulePayload>,
    _context: TriggerContext
  ): Record<string, unknown> {
    const { payload } = event;

    return {
      schedule: {
        cronExpression: payload.cronExpression,
        timezone: payload.timezone,
        scheduledTime: payload.scheduledTime,
        actualTime: payload.actualTime,
        executionCount: payload.executionCount,
        previousExecution: payload.previousExecution,
        nextExecution: payload.nextExecution,
        humanReadable: parseCronToHuman(payload.cronExpression),
      },
      timestamp: payload.actualTime,
      event: {
        id: event.id,
        type: event.type,
        timestamp: event.timestamp,
        source: event.source,
      },
    };
  },
};
