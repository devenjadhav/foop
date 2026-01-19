/**
 * Trigger Nodes
 * Export all trigger node definitions and handlers
 */

// CRM Triggers
export {
  newContactTrigger,
  newContactHandler,
  type NewContactPayload,
  type NewContactConfig,
  dealUpdatedTrigger,
  dealUpdatedHandler,
  type DealUpdatedPayload,
  type DealUpdatedConfig,
} from './crm';

// Email Triggers
export {
  emailReceivedTrigger,
  emailReceivedHandler,
  type EmailReceivedPayload,
  type EmailReceivedConfig,
  emailOpenedTrigger,
  emailOpenedHandler,
  type EmailOpenedPayload,
  type EmailOpenedConfig,
} from './email';
