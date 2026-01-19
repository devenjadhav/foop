/**
 * Node Registry
 * Central registry for all node definitions and handlers
 */

import type {
  TriggerNodeDefinition,
  TriggerHandler,
  NodeDefinition,
} from './types';

import {
  webhookTrigger,
  webhookHandler,
  scheduleTrigger,
  scheduleHandler,
  manualTrigger,
  manualHandler,
} from './triggers';

// Registry of all trigger node definitions
export const triggerNodes: Record<string, TriggerNodeDefinition> = {
  [webhookTrigger.type]: webhookTrigger,
  [scheduleTrigger.type]: scheduleTrigger,
  [manualTrigger.type]: manualTrigger,
};

// Registry of all trigger handlers
export const triggerHandlers: Record<string, TriggerHandler> = {
  [webhookTrigger.type]: webhookHandler,
  [scheduleTrigger.type]: scheduleHandler,
  [manualTrigger.type]: manualHandler,
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
 * Get trigger nodes by category (core, crm, email, etc.)
 */
export function getTriggerNodesByCategory(
  category: 'core' | 'crm' | 'email'
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
