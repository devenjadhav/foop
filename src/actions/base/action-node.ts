import type {
  ActionNodeDefinition,
  ActionNodeExecutionContext,
  ActionNodeExecutionResult,
} from '@/types/action-node.types';

/**
 * Base class for all action nodes in the workflow system
 */
export abstract class BaseActionNode<TConfig = Record<string, unknown>, TInput = Record<string, unknown>, TOutput = unknown> {
  abstract readonly definition: ActionNodeDefinition;

  /**
   * Execute the action node with the given configuration and input
   */
  abstract execute(
    config: TConfig,
    input: TInput,
    context: ActionNodeExecutionContext
  ): Promise<ActionNodeExecutionResult<TOutput>>;

  /**
   * Validate the node configuration before execution
   */
  validate(config: TConfig): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    const { configSchema } = this.definition;

    for (const field of configSchema.required || []) {
      const value = (config as Record<string, unknown>)[field];
      if (value === undefined || value === null || value === '') {
        errors.push(`Required field "${field}" is missing`);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Get the node type identifier
   */
  get type(): string {
    return this.definition.type;
  }

  /**
   * Get the node display name
   */
  get name(): string {
    return this.definition.name;
  }

  /**
   * Helper to create a success result
   */
  protected success<T>(data: T, executionTime: number): ActionNodeExecutionResult<T> {
    return {
      success: true,
      data,
      metadata: { executionTime },
    };
  }

  /**
   * Helper to create an error result
   */
  protected error(code: string, message: string, details?: unknown): ActionNodeExecutionResult<never> {
    return {
      success: false,
      error: { code, message, details },
      metadata: { executionTime: 0 },
    };
  }
}
