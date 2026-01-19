/**
 * Base types for workflow nodes
 */

export type NodeStatus = 'pending' | 'running' | 'success' | 'failure' | 'skipped';

export interface NodeInput {
  /** Source node ID for dynamic value */
  sourceNodeId?: string;
  /** Source field path */
  sourceField?: string;
  /** Static value (used if no source specified) */
  value?: unknown;
}

export interface NodeOutput {
  /** Output field name */
  name: string;
  /** Output field type */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  /** Human-readable description */
  description?: string;
}

export interface NodeDefinition {
  /** Unique node type identifier (e.g., "crm.create-contact") */
  type: string;
  /** Human-readable name */
  name: string;
  /** Description of what this node does */
  description: string;
  /** Category for grouping in UI */
  category: string;
  /** Input field definitions */
  inputs: NodeInputDefinition[];
  /** Output field definitions */
  outputs: NodeOutput[];
  /** Execute the node action */
  execute: (context: NodeExecutionContext) => Promise<NodeExecutionResult>;
}

export interface NodeInputDefinition {
  /** Field name */
  name: string;
  /** Human-readable label */
  label: string;
  /** Field type */
  type: 'string' | 'number' | 'boolean' | 'email' | 'phone' | 'url' | 'text' | 'select' | 'object';
  /** Whether field is required */
  required: boolean;
  /** Default value */
  defaultValue?: unknown;
  /** Options for select type */
  options?: { label: string; value: string }[];
  /** Human-readable description */
  description?: string;
}

export interface NodeConfig {
  /** Reference to integration for credentials */
  integrationId?: string;
  /** Input field values */
  inputs: Record<string, NodeInput>;
  /** Additional node-specific settings */
  settings?: Record<string, unknown>;
}

export interface NodeExecutionContext {
  /** The node's configuration */
  config: NodeConfig;
  /** Resolved input values from upstream nodes */
  resolvedInputs: Record<string, unknown>;
  /** Integration credentials (decrypted) */
  credentials?: Record<string, unknown>;
  /** Workflow execution ID */
  executionId: string;
  /** Node instance ID */
  nodeId: string;
  /** Organization ID */
  organizationId: string;
}

export interface NodeExecutionResult {
  /** Execution status */
  status: 'success' | 'failure';
  /** Output data */
  data?: Record<string, unknown>;
  /** Error message if failed */
  error?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}
