/**
 * Workflow nodes - registry and executors
 */

export { nodeRegistry } from './registry'
export * from './utils'
export * from './executors'

// Re-export types
export type {
  NodeDefinition,
  BaseWorkflowNode,
  ExecutionContext,
  ExecutionResult,
  ValidationError,
  ConfigSchema,
  ConfigField,
  HandleDefinition,
} from '../../types/nodes'

export type {
  EmailNodeType,
  SendEmailConfig,
  BulkSendConfig,
  AddToListConfig,
  RemoveFromListConfig,
  SendEmailResult,
  BulkSendResult,
  ListOperationResult,
} from '../../types/email-nodes'

export { EMAIL_NODE_TYPES } from '../../types/email-nodes'

// Import and register all email nodes
import { nodeRegistry } from './registry'
import { sendEmailNode, bulkSendNode, addToListNode, removeFromListNode } from './executors'

/**
 * Register all built-in email action nodes
 */
export function registerEmailNodes(): void {
  nodeRegistry.register(sendEmailNode)
  nodeRegistry.register(bulkSendNode)
  nodeRegistry.register(addToListNode)
  nodeRegistry.register(removeFromListNode)
}

/**
 * Initialize all built-in nodes
 * Call this during application startup
 */
export function initializeNodes(): void {
  registerEmailNodes()
}
