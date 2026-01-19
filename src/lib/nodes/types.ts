/**
 * Base types and interfaces for workflow nodes
 */

export type NodeCategory = 'trigger' | 'action' | 'conditional' | 'transform' | 'flow' | 'timing';

export interface NodeInput {
  type: string;
  label: string;
  required?: boolean;
}

export interface NodeOutput {
  type: string;
  label: string;
}

export interface NodeConfigField {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json';
  label: string;
  description?: string;
  required?: boolean;
  default?: unknown;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export interface NodeDefinition<TConfig = Record<string, unknown>> {
  type: string;
  label: string;
  description: string;
  category: NodeCategory;
  icon?: string;
  configFields: NodeConfigField[];
  inputs?: Record<string, NodeInput>;
  outputs?: Record<string, NodeOutput>;
  defaultConfig: TConfig;
}

export interface TriggerNodeDefinition<TConfig = Record<string, unknown>>
  extends NodeDefinition<TConfig> {
  category: 'trigger';
  /** Event type this trigger listens for */
  eventType: string;
  /** Whether this trigger supports webhooks */
  supportsWebhook?: boolean;
  /** Whether this trigger supports polling */
  supportsPolling?: boolean;
}

export interface TriggerEvent<TPayload = Record<string, unknown>> {
  id: string;
  type: string;
  timestamp: Date;
  source: string;
  payload: TPayload;
}

export interface TriggerContext {
  workflowId: string;
  nodeId: string;
  organizationId: string;
  config: Record<string, unknown>;
}

export interface TriggerHandler<TPayload = Record<string, unknown>> {
  /** Validate incoming event matches trigger criteria */
  validate(event: TriggerEvent<TPayload>, context: TriggerContext): boolean;
  /** Transform the event payload for downstream nodes */
  transform(event: TriggerEvent<TPayload>, context: TriggerContext): Record<string, unknown>;
}

// ============================================
// Action Node Types
// ============================================

// Base data type that flows through nodes
export type NodeData = Record<string, unknown> | Record<string, unknown>[];

// Execution context passed to nodes during workflow runs
export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  variables: Record<string, unknown>;
  startTime: Date;
}

// Result of node execution
export interface ExecutionResult {
  success: boolean;
  data?: NodeData;
  error?: string;
  outputPort?: string; // For nodes with multiple outputs (e.g., branch)
  metadata?: Record<string, unknown>;
}

// Port definitions for node inputs/outputs
export interface NodePort {
  id: string;
  name: string;
  description?: string;
  required?: boolean;
}

// Base configuration shared by all nodes
export interface BaseNodeConfig {
  label?: string;
  description?: string;
}

// Node type identifiers
export type NodeType = 'filter' | 'map' | 'merge' | 'branch' | 'delay';

// Base interface for all action nodes
export interface ActionNode<TConfig extends BaseNodeConfig = BaseNodeConfig> {
  readonly type: NodeType;
  readonly name: string;
  readonly description: string;
  readonly inputs: NodePort[];
  readonly outputs: NodePort[];

  // Validate node configuration
  validateConfig(config: TConfig): { valid: boolean; errors: string[] };

  // Execute the node with input data
  execute(
    input: NodeData,
    config: TConfig,
    context: ExecutionContext
  ): Promise<ExecutionResult>;
}

// Action node definition for registry
export interface ActionNodeDefinition {
  type: NodeType;
  name: string;
  description: string;
  category: 'transform' | 'flow' | 'timing';
  icon?: string;
  inputs: NodePort[];
  outputs: NodePort[];
  defaultConfig: BaseNodeConfig;
}

// ============================================
// Filter Node Types
// ============================================

export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'matches' // regex
  | 'in'
  | 'notIn';

export type FilterLogic = 'and' | 'or';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value?: unknown;
  caseSensitive?: boolean;
}

export interface FilterNodeConfig extends BaseNodeConfig {
  conditions: FilterCondition[];
  logic: FilterLogic;
  passThrough?: boolean; // If true, pass items that don't match to secondary output
}

// ============================================
// Map/Transform Node Types
// ============================================

export type TransformOperation =
  | 'set'           // Set a field value
  | 'rename'        // Rename a field
  | 'delete'        // Remove a field
  | 'copy'          // Copy value from one field to another
  | 'template'      // String template interpolation
  | 'math'          // Mathematical expression
  | 'lowercase'     // Convert to lowercase
  | 'uppercase'     // Convert to uppercase
  | 'trim'          // Trim whitespace
  | 'split'         // Split string to array
  | 'join'          // Join array to string
  | 'parseJson'     // Parse JSON string
  | 'stringify'     // Convert to JSON string
  | 'parseNumber'   // Parse to number
  | 'parseDate'     // Parse to date
  | 'formatDate'    // Format date to string
  | 'custom';       // Custom JavaScript expression

export interface TransformRule {
  operation: TransformOperation;
  sourceField?: string;
  targetField: string;
  value?: unknown;
  options?: Record<string, unknown>;
}

export interface MapNodeConfig extends BaseNodeConfig {
  rules: TransformRule[];
  keepOriginal?: boolean; // If true, keep fields not mentioned in rules
}

// ============================================
// Merge Node Types
// ============================================

export type MergeStrategy =
  | 'concat'        // Concatenate arrays
  | 'union'         // Union of arrays (remove duplicates)
  | 'intersect'     // Intersection of arrays
  | 'zip'           // Zip arrays together
  | 'objectMerge'   // Deep merge objects
  | 'objectAssign'; // Shallow merge objects (later overwrites earlier)

export interface MergeNodeConfig extends BaseNodeConfig {
  strategy: MergeStrategy;
  waitForAll?: boolean; // Wait for all inputs before executing
  dedupeKey?: string;   // Field to use for deduplication in union
  timeout?: number;     // Timeout in ms when waiting for inputs
}

// ============================================
// Branch/Conditional Node Types
// ============================================

export interface BranchCondition {
  id: string;
  name: string;
  conditions: FilterCondition[];
  logic: FilterLogic;
  outputPort: string;
}

export interface BranchNodeConfig extends BaseNodeConfig {
  branches: BranchCondition[];
  defaultBranch?: string; // Output port for items matching no conditions
  evaluateAll?: boolean;  // If true, send to all matching branches; if false, first match only
}

// ============================================
// Delay Node Types
// ============================================

export type DelayType =
  | 'fixed'         // Fixed delay
  | 'random'        // Random delay within range
  | 'scheduled'     // Wait until specific time
  | 'rateLimit';    // Rate limiting (items per time window)

export interface DelayNodeConfig extends BaseNodeConfig {
  delayType: DelayType;
  duration?: number;      // Duration in ms for fixed delay
  minDuration?: number;   // Min duration for random delay
  maxDuration?: number;   // Max duration for random delay
  scheduleTime?: string;  // ISO timestamp for scheduled delay
  rateLimit?: {
    count: number;        // Number of items
    windowMs: number;     // Time window in ms
  };
}
