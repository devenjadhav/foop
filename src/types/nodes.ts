/**
 * Base types for workflow nodes
 */

export type NodeCategory = 'trigger' | 'action' | 'condition' | 'delay'

export type NodeStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

export interface BaseNodeConfig {
  [key: string]: unknown
}

export interface BaseWorkflowNode<T extends BaseNodeConfig = BaseNodeConfig> {
  id: string
  workflowId: string
  type: string
  name: string
  config: T
  positionX: number
  positionY: number
  createdAt: Date
  updatedAt: Date
}

export interface ExecutionContext {
  workflowId: string
  executionId: string
  userId: string
  organizationId: string
  variables: Record<string, unknown>
  integrations: Map<string, IntegrationCredentials>
}

export interface IntegrationCredentials {
  type: string
  credentials: Record<string, unknown>
}

export interface ExecutionResult {
  status: 'success' | 'failure' | 'skipped'
  output: Record<string, unknown>
  error?: string
  duration: number
}

export interface NodeDefinition<T extends BaseNodeConfig = BaseNodeConfig> {
  type: string
  name: string
  description: string
  category: NodeCategory
  icon?: string
  configSchema: ConfigSchema
  inputHandles: HandleDefinition[]
  outputHandles: HandleDefinition[]
  execute: (
    node: BaseWorkflowNode<T>,
    input: Record<string, unknown>,
    context: ExecutionContext
  ) => Promise<ExecutionResult>
  validate: (config: T) => ValidationError[]
}

export interface HandleDefinition {
  id: string
  name: string
  type: 'default' | 'success' | 'failure' | 'conditional'
}

export interface ConfigSchema {
  fields: ConfigField[]
}

export interface ConfigField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'boolean' | 'json' | 'template'
  required: boolean
  placeholder?: string
  description?: string
  defaultValue?: unknown
  options?: { label: string; value: string }[]
  validation?: FieldValidation
}

export interface FieldValidation {
  minLength?: number
  maxLength?: number
  pattern?: string
  min?: number
  max?: number
}

export interface ValidationError {
  field: string
  message: string
}
