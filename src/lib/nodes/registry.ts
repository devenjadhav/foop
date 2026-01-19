/**
 * Node Registry
 * Central registry for all node definitions and handlers
 */

import type {
  TriggerNodeDefinition,
  TriggerHandler,
  NodeDefinition,
  ActionNode,
  ActionNodeDefinition,
  NodeType,
  BaseNodeConfig,
} from './types';

import {
  newContactTrigger,
  newContactHandler,
  dealUpdatedTrigger,
  dealUpdatedHandler,
  emailReceivedTrigger,
  emailReceivedHandler,
  emailOpenedTrigger,
  emailOpenedHandler,
} from './triggers';

import {
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

// ============================================
// Trigger Node Registry
// ============================================

// Registry of all trigger node definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const triggerNodes: Record<string, TriggerNodeDefinition<any>> = {
  [newContactTrigger.type]: newContactTrigger,
  [dealUpdatedTrigger.type]: dealUpdatedTrigger,
  [emailReceivedTrigger.type]: emailReceivedTrigger,
  [emailOpenedTrigger.type]: emailOpenedTrigger,
};

// Registry of all trigger handlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const triggerHandlers: Record<string, TriggerHandler<any>> = {
  [newContactTrigger.type]: newContactHandler,
  [dealUpdatedTrigger.type]: dealUpdatedHandler,
  [emailReceivedTrigger.type]: emailReceivedHandler,
  [emailOpenedTrigger.type]: emailOpenedHandler,
};

// Registry of all node definitions (triggers + actions + conditionals)
export const allNodes: Record<string, NodeDefinition> = {
  ...triggerNodes,
};

/**
 * Get a trigger node definition by type
 */
export function getTriggerNode(type: string): TriggerNodeDefinition | undefined {
  return triggerNodes[type];
}

/**
 * Get a trigger handler by type
 */
export function getTriggerHandler(type: string): TriggerHandler | undefined {
  return triggerHandlers[type];
}

/**
 * Get all trigger nodes as an array
 */
export function getAllTriggerNodes(): TriggerNodeDefinition[] {
  return Object.values(triggerNodes);
}

/**
 * Get trigger nodes by category (CRM, Email, etc.)
 */
export function getTriggerNodesByCategory(
  category: 'crm' | 'email'
): TriggerNodeDefinition[] {
  const prefix = `trigger.${category}.`;
  return Object.values(triggerNodes).filter((node) =>
    node.type.startsWith(prefix)
  );
}

/**
 * Get a node definition by type
 */
export function getNode(type: string): NodeDefinition | undefined {
  return allNodes[type];
}

/**
 * Check if a node type exists
 */
export function hasNode(type: string): boolean {
  return type in allNodes;
}

/**
 * Check if a trigger type exists
 */
export function hasTrigger(type: string): boolean {
  return type in triggerNodes;
}

// ============================================
// Action Node Registry
// ============================================

// Singleton instances for each action node type
const actionNodeInstances: Map<NodeType, ActionNode> = new Map();

/**
 * Get an action node instance by type
 */
export function getActionNode(type: NodeType): ActionNode {
  let instance = actionNodeInstances.get(type);

  if (!instance) {
    instance = createActionNode(type);
    actionNodeInstances.set(type, instance);
  }

  return instance;
}

/**
 * Create a new action node instance by type
 */
export function createActionNode(type: NodeType): ActionNode {
  switch (type) {
    case 'filter':
      return new FilterNode();
    case 'map':
      return new MapNode();
    case 'merge':
      return new MergeNode();
    case 'branch':
      return new BranchNode();
    case 'delay':
      return new DelayNode();
    default:
      throw new Error(`Unknown action node type: ${type}`);
  }
}

/**
 * Get default configuration for an action node type
 */
export function getActionNodeDefaults(type: NodeType): BaseNodeConfig {
  switch (type) {
    case 'filter':
      return filterNodeDefaults;
    case 'map':
      return mapNodeDefaults;
    case 'merge':
      return mergeNodeDefaults;
    case 'branch':
      return branchNodeDefaults;
    case 'delay':
      return delayNodeDefaults;
    default:
      throw new Error(`Unknown action node type: ${type}`);
  }
}

/**
 * Get all available action node types
 */
export function getAvailableActionNodeTypes(): NodeType[] {
  return ['filter', 'map', 'merge', 'branch', 'delay'];
}

/**
 * Action node definitions for UI/visualization
 */
export const actionNodeDefinitions: ActionNodeDefinition[] = [
  {
    type: 'filter',
    name: 'Filter',
    description: 'Filter data based on conditions',
    category: 'transform',
    icon: 'filter',
    inputs: [{ id: 'input', name: 'Input', required: true }],
    outputs: [
      { id: 'matched', name: 'Matched' },
      { id: 'unmatched', name: 'Unmatched' },
    ],
    defaultConfig: filterNodeDefaults,
  },
  {
    type: 'map',
    name: 'Map / Transform',
    description: 'Transform data by applying rules to fields',
    category: 'transform',
    icon: 'transform',
    inputs: [{ id: 'input', name: 'Input', required: true }],
    outputs: [{ id: 'output', name: 'Output' }],
    defaultConfig: mapNodeDefaults,
  },
  {
    type: 'merge',
    name: 'Merge',
    description: 'Combine data from multiple sources',
    category: 'transform',
    icon: 'merge',
    inputs: [
      { id: 'input1', name: 'Input 1', required: true },
      { id: 'input2', name: 'Input 2', required: true },
      { id: 'input3', name: 'Input 3' },
      { id: 'input4', name: 'Input 4' },
    ],
    outputs: [{ id: 'output', name: 'Output' }],
    defaultConfig: mergeNodeDefaults,
  },
  {
    type: 'branch',
    name: 'Branch',
    description: 'Route data to different outputs based on conditions',
    category: 'flow',
    icon: 'branch',
    inputs: [{ id: 'input', name: 'Input', required: true }],
    outputs: [
      { id: 'branch1', name: 'Branch 1' },
      { id: 'branch2', name: 'Branch 2' },
      { id: 'branch3', name: 'Branch 3' },
      { id: 'branch4', name: 'Branch 4' },
      { id: 'default', name: 'Default' },
    ],
    defaultConfig: branchNodeDefaults,
  },
  {
    type: 'delay',
    name: 'Delay',
    description: 'Add delays or rate limiting to workflow execution',
    category: 'timing',
    icon: 'clock',
    inputs: [{ id: 'input', name: 'Input', required: true }],
    outputs: [{ id: 'output', name: 'Output' }],
    defaultConfig: delayNodeDefaults,
  },
];

/**
 * Get action node definition by type
 */
export function getActionNodeDefinition(type: NodeType): ActionNodeDefinition | undefined {
  return actionNodeDefinitions.find((def) => def.type === type);
}

/**
 * Get action nodes by category
 */
export function getActionNodesByCategory(
  category: 'transform' | 'flow' | 'timing'
): ActionNodeDefinition[] {
  return actionNodeDefinitions.filter((def) => def.category === category);
}
