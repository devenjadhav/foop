/**
 * Base types for workflow action nodes
 */

export interface ActionNodeDefinition {
  type: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  inputs: ActionNodePortDefinition[];
  outputs: ActionNodePortDefinition[];
  configSchema: ActionNodeConfigSchema;
}

export interface ActionNodePortDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
  description: string;
  required?: boolean;
}

export interface ActionNodeConfigSchema {
  properties: Record<string, ActionNodeConfigProperty>;
  required?: string[];
}

export interface ActionNodeConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'select' | 'expression';
  label: string;
  description?: string;
  placeholder?: string;
  default?: unknown;
  options?: { label: string; value: string }[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface ActionNodeExecutionContext {
  workflowId: string;
  executionId: string;
  nodeId: string;
  credentials?: Record<string, unknown>;
  variables?: Record<string, unknown>;
}

export interface ActionNodeExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    executionTime: number;
    retryCount?: number;
  };
}
