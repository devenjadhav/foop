/**
 * Filter Node
 *
 * Filters data based on configurable conditions.
 * Supports multiple conditions with AND/OR logic.
 * Can optionally pass non-matching items to a secondary output.
 */

import { BaseActionNode } from '../base-node';
import type {
  FilterNodeConfig,
  NodePort,
  NodeData,
  ExecutionContext,
  ExecutionResult,
} from '../types';

export class FilterNode extends BaseActionNode<FilterNodeConfig> {
  readonly type = 'filter' as const;
  readonly name = 'Filter';
  readonly description = 'Filter data based on conditions';

  readonly inputs: NodePort[] = [
    {
      id: 'input',
      name: 'Input',
      description: 'Data to filter',
      required: true,
    },
  ];

  readonly outputs: NodePort[] = [
    {
      id: 'matched',
      name: 'Matched',
      description: 'Items matching the filter conditions',
    },
    {
      id: 'unmatched',
      name: 'Unmatched',
      description: 'Items not matching the filter conditions (when passThrough is enabled)',
    },
  ];

  validateConfig(config: FilterNodeConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.conditions || !Array.isArray(config.conditions)) {
      errors.push('Conditions must be an array');
    } else if (config.conditions.length === 0) {
      errors.push('At least one condition is required');
    } else {
      config.conditions.forEach((condition, index) => {
        if (!condition.field || typeof condition.field !== 'string') {
          errors.push(`Condition ${index + 1}: field is required and must be a string`);
        }
        if (!condition.operator) {
          errors.push(`Condition ${index + 1}: operator is required`);
        }
        // Value is not required for isEmpty/isNotEmpty operators
        const noValueOperators = ['isEmpty', 'isNotEmpty'];
        if (
          condition.value === undefined &&
          !noValueOperators.includes(condition.operator)
        ) {
          errors.push(`Condition ${index + 1}: value is required for operator '${condition.operator}'`);
        }
      });
    }

    if (!config.logic || !['and', 'or'].includes(config.logic)) {
      errors.push('Logic must be either "and" or "or"');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async execute(
    input: NodeData,
    config: FilterNodeConfig,
    _context: ExecutionContext
  ): Promise<ExecutionResult> {
    const validation = this.validateConfig(config);
    if (!validation.valid) {
      return this.failure(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    try {
      const items = this.ensureArray(input);
      const matched: Record<string, unknown>[] = [];
      const unmatched: Record<string, unknown>[] = [];

      for (const item of items) {
        const matches = this.evaluateConditions(item, config.conditions, config.logic);

        if (matches) {
          matched.push(item);
        } else if (config.passThrough) {
          unmatched.push(item);
        }
      }

      // If passThrough is enabled, return both outputs
      if (config.passThrough) {
        return {
          success: true,
          data: matched,
          metadata: {
            matched: matched.length,
            unmatched: unmatched.length,
            unmatchedData: unmatched,
          },
        };
      }

      return this.success(matched);
    } catch (error) {
      return this.failure(
        error instanceof Error ? error.message : 'Unknown error during filter execution'
      );
    }
  }
}

// Default configuration for filter node
export const filterNodeDefaults: FilterNodeConfig = {
  conditions: [],
  logic: 'and',
  passThrough: false,
};
