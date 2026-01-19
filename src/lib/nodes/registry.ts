/**
 * Node Registry
 *
 * Factory and registry for creating and managing action nodes.
 * Provides a centralized way to instantiate nodes by type.
 */

import type { ActionNode, NodeDefinition, NodeType, BaseNodeConfig } from './types';
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

// Singleton instances for each node type
const nodeInstances: Map<NodeType, ActionNode> = new Map();

/**
 * Get a node instance by type
 */
export function getNode(type: NodeType): ActionNode {
  let instance = nodeInstances.get(type);

  if (!instance) {
    instance = createNode(type);
    nodeInstances.set(type, instance);
  }

  return instance;
}

/**
 * Create a new node instance by type
 */
export function createNode(type: NodeType): ActionNode {
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
      throw new Error(`Unknown node type: ${type}`);
  }
}

/**
 * Get default configuration for a node type
 */
export function getNodeDefaults(type: NodeType): BaseNodeConfig {
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
      throw new Error(`Unknown node type: ${type}`);
  }
}

/**
 * Get all available node types
 */
export function getAvailableNodeTypes(): NodeType[] {
  return ['filter', 'map', 'merge', 'branch', 'delay'];
}

/**
 * Node definitions for UI/visualization
 */
export const nodeDefinitions: NodeDefinition[] = [
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
 * Get node definition by type
 */
export function getNodeDefinition(type: NodeType): NodeDefinition | undefined {
  return nodeDefinitions.find((def) => def.type === type);
}

/**
 * Get nodes by category
 */
export function getNodesByCategory(
  category: 'transform' | 'flow' | 'timing'
): NodeDefinition[] {
  return nodeDefinitions.filter((def) => def.category === category);
}
