/**
 * Utility functions for node execution
 */

import type { ExecutionContext, ExecutionResult, ValidationError } from '../../types/nodes'

/**
 * Resolve template variables in a string
 * Supports {{variable.path}} syntax
 */
export function resolveTemplate(
  template: string,
  variables: Record<string, unknown>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = getNestedValue(variables, path.trim())
    if (value === undefined || value === null) {
      return match // Keep original if not found
    }
    return String(value)
  })
}

/**
 * Get a nested value from an object using dot notation
 */
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string
): unknown {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined
    }
    if (typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }

  return current
}

/**
 * Set a nested value in an object using dot notation
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }

  current[keys[keys.length - 1]] = value
}

/**
 * Validate an email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Create a successful execution result
 */
export function successResult(
  output: Record<string, unknown>,
  startTime: number
): ExecutionResult {
  return {
    status: 'success',
    output,
    duration: Date.now() - startTime,
  }
}

/**
 * Create a failed execution result
 */
export function failureResult(
  error: string,
  startTime: number,
  output: Record<string, unknown> = {}
): ExecutionResult {
  return {
    status: 'failure',
    output,
    error,
    duration: Date.now() - startTime,
  }
}

/**
 * Create a skipped execution result
 */
export function skippedResult(
  reason: string,
  startTime: number
): ExecutionResult {
  return {
    status: 'skipped',
    output: { reason },
    duration: Date.now() - startTime,
  }
}

/**
 * Create a validation error
 */
export function validationError(field: string, message: string): ValidationError {
  return { field, message }
}

/**
 * Get integration credentials from context
 */
export function getIntegration(
  context: ExecutionContext,
  type: string
): Record<string, unknown> | undefined {
  const integration = context.integrations.get(type)
  return integration?.credentials
}

/**
 * Merge input data with context variables for template resolution
 */
export function mergeInputWithContext(
  input: Record<string, unknown>,
  context: ExecutionContext
): Record<string, unknown> {
  return {
    ...context.variables,
    input,
    execution: {
      id: context.executionId,
      workflowId: context.workflowId,
    },
  }
}

/**
 * Extract emails from an array of objects
 */
export function extractEmails(
  data: unknown[],
  emailField: string = 'email'
): string[] {
  return data
    .map((item) => {
      if (typeof item === 'string') {
        return item
      }
      if (typeof item === 'object' && item !== null) {
        return getNestedValue(item as Record<string, unknown>, emailField)
      }
      return undefined
    })
    .filter((email): email is string => typeof email === 'string' && isValidEmail(email))
}

/**
 * Batch an array into chunks
 */
export function batchArray<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize))
  }
  return batches
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
