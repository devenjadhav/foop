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
  newContactTrigger,
  newContactHandler,
  dealUpdatedTrigger,
  dealUpdatedHandler,
  emailReceivedTrigger,
  emailReceivedHandler,
  emailOpenedTrigger,
  emailOpenedHandler,
} from './triggers';

// Registry of all trigger node definitions
export const triggerNodes: Record<string, TriggerNodeDefinition> = {
  [newContactTrigger.type]: newContactTrigger,
  [dealUpdatedTrigger.type]: dealUpdatedTrigger,
  [emailReceivedTrigger.type]: emailReceivedTrigger,
  [emailOpenedTrigger.type]: emailOpenedTrigger,
};

// Registry of all trigger handlers
export const triggerHandlers: Record<string, TriggerHandler> = {
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
