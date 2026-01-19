/**
 * Workflow Nodes
 * Main entry point for node definitions, handlers, and registry
 */

// Types
export type {
  NodeCategory,
  NodeInput,
  NodeOutput,
  NodeConfigField,
  NodeDefinition,
  TriggerNodeDefinition,
  TriggerEvent,
  TriggerContext,
  TriggerHandler,
} from './types';

// Triggers
export {
  // CRM
  newContactTrigger,
  newContactHandler,
  type NewContactPayload,
  type NewContactConfig,
  dealUpdatedTrigger,
  dealUpdatedHandler,
  type DealUpdatedPayload,
  type DealUpdatedConfig,
  // Email
  emailReceivedTrigger,
  emailReceivedHandler,
  type EmailReceivedPayload,
  type EmailReceivedConfig,
  emailOpenedTrigger,
  emailOpenedHandler,
  type EmailOpenedPayload,
  type EmailOpenedConfig,
} from './triggers';

// Registry
export {
  triggerNodes,
  triggerHandlers,
  allNodes,
  getTriggerNode,
  getTriggerHandler,
  getAllTriggerNodes,
  getTriggerNodesByCategory,
  getNode,
  hasNode,
  hasTrigger,
} from './registry';
