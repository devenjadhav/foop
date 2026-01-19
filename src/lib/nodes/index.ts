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
  // Action node types
  NodeData,
  ExecutionContext,
  ExecutionResult,
  NodePort,
  BaseNodeConfig,
  NodeType,
  ActionNode,
  ActionNodeDefinition,
  // Filter types
  FilterOperator,
  FilterLogic,
  FilterCondition,
  FilterNodeConfig,
  // Map types
  TransformOperation,
  TransformRule,
  MapNodeConfig,
  // Merge types
  MergeStrategy,
  MergeNodeConfig,
  // Branch types
  BranchCondition,
  BranchNodeConfig,
  // Delay types
  DelayType,
  DelayNodeConfig,
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

// Base class for action nodes
export { BaseActionNode } from './base-node';

// Action node implementations
export {
  FilterNode,
  filterNodeDefaults,
  MapNode,
  mapNodeDefaults,
  MergeNode,
  mergeNodeDefaults,
  BranchNode,
  branchNodeDefaults,
  DelayNode,
  delayNodeDefaults,
} from './implementations';

// Additional types from implementations
export type { MergeInput } from './implementations/merge';
export type { BranchExecutionResult } from './implementations/branch';

// Registry
export {
  // Trigger registry
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
  // Action node registry
  getActionNode,
  createActionNode,
  getActionNodeDefaults,
  getAvailableActionNodeTypes,
  actionNodeDefinitions,
  getActionNodeDefinition,
  getActionNodesByCategory,
} from './registry';
