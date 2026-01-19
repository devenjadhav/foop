/**
 * Base types and interfaces for workflow nodes
 */

export type NodeCategory = 'trigger' | 'action' | 'conditional' | 'transform';

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
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json' | 'cron';
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
