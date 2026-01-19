/**
 * Workflow Action Nodes
 *
 * Data transformation nodes for workflow automation:
 * - Filter: Filter data based on conditions
 * - Map: Transform data by applying rules
 * - Merge: Combine data from multiple sources
 * - Branch: Route data based on conditions
 * - Delay: Add timing control to workflows
 */

// Core types
export type {
  NodeData,
  ExecutionContext,
  ExecutionResult,
  NodePort,
  BaseNodeConfig,
  NodeType,
  ActionNode,
  NodeDefinition,
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

// Base class
export { BaseActionNode } from './base-node';

// Node implementations
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

// Registry and factory functions
export {
  getNode,
  createNode,
  getNodeDefaults,
  getAvailableNodeTypes,
  nodeDefinitions,
  getNodeDefinition,
  getNodesByCategory,
} from './registry';
