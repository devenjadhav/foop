/**
 * Merge Node
 *
 * Combines data from multiple inputs using various strategies.
 * Supports array concatenation, union, intersection, zipping,
 * and object merging operations.
 */

import { BaseActionNode } from '../base-node';
import type {
  MergeNodeConfig,
  NodePort,
  NodeData,
  ExecutionContext,
  ExecutionResult,
} from '../types';

// Extended input type for merge operations that may receive multiple inputs
export interface MergeInput {
  inputs: NodeData[];
}

export class MergeNode extends BaseActionNode<MergeNodeConfig> {
  readonly type = 'merge' as const;
  readonly name = 'Merge';
  readonly description = 'Combine data from multiple sources';

  readonly inputs: NodePort[] = [
    {
      id: 'input1',
      name: 'Input 1',
      description: 'First data source',
      required: true,
    },
    {
      id: 'input2',
      name: 'Input 2',
      description: 'Second data source',
      required: true,
    },
    {
      id: 'input3',
      name: 'Input 3',
      description: 'Third data source (optional)',
      required: false,
    },
    {
      id: 'input4',
      name: 'Input 4',
      description: 'Fourth data source (optional)',
      required: false,
    },
  ];

  readonly outputs: NodePort[] = [
    {
      id: 'output',
      name: 'Output',
      description: 'Merged data',
    },
  ];

  validateConfig(config: MergeNodeConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const validStrategies = [
      'concat',
      'union',
      'intersect',
      'zip',
      'objectMerge',
      'objectAssign',
    ];

    if (!config.strategy || !validStrategies.includes(config.strategy)) {
      errors.push(`Strategy must be one of: ${validStrategies.join(', ')}`);
    }

    if (config.timeout !== undefined) {
      if (typeof config.timeout !== 'number' || config.timeout < 0) {
        errors.push('Timeout must be a positive number');
      }
    }

    if (config.strategy === 'union' && config.dedupeKey !== undefined) {
      if (typeof config.dedupeKey !== 'string' || config.dedupeKey.length === 0) {
        errors.push('dedupeKey must be a non-empty string');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async execute(
    input: NodeData,
    config: MergeNodeConfig,
    _context: ExecutionContext
  ): Promise<ExecutionResult> {
    const validation = this.validateConfig(config);
    if (!validation.valid) {
      return this.failure(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    try {
      // Handle both single input (array of inputs) and MergeInput structure
      let inputs: NodeData[];

      if (this.isMergeInput(input)) {
        inputs = input.inputs;
      } else if (Array.isArray(input)) {
        // Check if this is an array of separate inputs or a single array input
        // We treat it as a single input if it's not explicitly a MergeInput
        inputs = [input];
      } else {
        inputs = [input];
      }

      if (inputs.length < 2) {
        return this.failure('Merge requires at least 2 inputs');
      }

      let result: NodeData;

      switch (config.strategy) {
        case 'concat':
          result = this.concatArrays(inputs);
          break;

        case 'union':
          result = this.unionArrays(inputs, config.dedupeKey);
          break;

        case 'intersect':
          result = this.intersectArrays(inputs, config.dedupeKey);
          break;

        case 'zip':
          result = this.zipArrays(inputs);
          break;

        case 'objectMerge':
          result = this.deepMergeObjects(inputs);
          break;

        case 'objectAssign':
          result = this.shallowMergeObjects(inputs);
          break;

        default:
          return this.failure(`Unknown merge strategy: ${config.strategy}`);
      }

      return this.success(result);
    } catch (error) {
      return this.failure(
        error instanceof Error ? error.message : 'Unknown error during merge execution'
      );
    }
  }

  private isMergeInput(input: unknown): input is MergeInput {
    return (
      typeof input === 'object' &&
      input !== null &&
      'inputs' in input &&
      Array.isArray((input as MergeInput).inputs)
    );
  }

  /**
   * Concatenate arrays from all inputs
   */
  private concatArrays(inputs: NodeData[]): Record<string, unknown>[] {
    const result: Record<string, unknown>[] = [];

    for (const input of inputs) {
      const items = this.ensureArray(input);
      result.push(...items);
    }

    return result;
  }

  /**
   * Union of arrays (remove duplicates)
   */
  private unionArrays(
    inputs: NodeData[],
    dedupeKey?: string
  ): Record<string, unknown>[] {
    const all = this.concatArrays(inputs);

    if (dedupeKey) {
      // Deduplicate by key field
      const seen = new Map<unknown, Record<string, unknown>>();
      for (const item of all) {
        const key = this.getFieldValue(item, dedupeKey);
        if (!seen.has(key)) {
          seen.set(key, item);
        }
      }
      return Array.from(seen.values());
    }

    // Deduplicate by JSON stringification
    const seen = new Set<string>();
    const result: Record<string, unknown>[] = [];

    for (const item of all) {
      const key = JSON.stringify(item);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }

    return result;
  }

  /**
   * Intersection of arrays (items present in all inputs)
   */
  private intersectArrays(
    inputs: NodeData[],
    dedupeKey?: string
  ): Record<string, unknown>[] {
    if (inputs.length === 0) return [];

    const firstInput = this.ensureArray(inputs[0]);

    if (inputs.length === 1) return firstInput;

    // Create sets for each subsequent input
    const otherSets: Set<string>[] = inputs.slice(1).map((input) => {
      const items = this.ensureArray(input);
      return new Set(
        items.map((item) =>
          dedupeKey
            ? String(this.getFieldValue(item, dedupeKey))
            : JSON.stringify(item)
        )
      );
    });

    // Filter first input to only include items present in all other inputs
    return firstInput.filter((item) => {
      const key = dedupeKey
        ? String(this.getFieldValue(item, dedupeKey))
        : JSON.stringify(item);
      return otherSets.every((set) => set.has(key));
    });
  }

  /**
   * Zip arrays together (combine corresponding elements)
   */
  private zipArrays(inputs: NodeData[]): Record<string, unknown>[] {
    const arrays = inputs.map((input) => this.ensureArray(input));

    // Find the length of the shortest array
    const minLength = Math.min(...arrays.map((arr) => arr.length));
    const result: Record<string, unknown>[] = [];

    for (let i = 0; i < minLength; i++) {
      const combined: Record<string, unknown> = {};

      arrays.forEach((arr, inputIndex) => {
        const item = arr[i];
        // Spread each input's fields with a prefix to avoid collisions
        for (const [key, value] of Object.entries(item)) {
          combined[`input${inputIndex + 1}_${key}`] = value;
        }
      });

      result.push(combined);
    }

    return result;
  }

  /**
   * Deep merge objects (recursive merge, arrays are concatenated)
   */
  private deepMergeObjects(inputs: NodeData[]): Record<string, unknown> {
    const objects = inputs.map((input) => {
      if (Array.isArray(input)) {
        return input.length > 0 ? input[0] : {};
      }
      return input;
    });

    return objects.reduce(
      (merged, obj) => this.deepMerge(merged, obj),
      {} as Record<string, unknown>
    );
  }

  private deepMerge(
    target: Record<string, unknown>,
    source: Record<string, unknown>
  ): Record<string, unknown> {
    const result = { ...target };

    for (const [key, sourceValue] of Object.entries(source)) {
      const targetValue = result[key];

      if (
        this.isPlainObject(sourceValue) &&
        this.isPlainObject(targetValue)
      ) {
        // Recursively merge objects
        result[key] = this.deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        );
      } else if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
        // Concatenate arrays
        result[key] = [...targetValue, ...sourceValue];
      } else {
        // Overwrite with source value
        result[key] = this.deepClone(sourceValue);
      }
    }

    return result;
  }

  /**
   * Shallow merge objects (Object.assign style, later values overwrite)
   */
  private shallowMergeObjects(inputs: NodeData[]): Record<string, unknown> {
    const objects = inputs.map((input) => {
      if (Array.isArray(input)) {
        return input.length > 0 ? input[0] : {};
      }
      return input;
    });

    return Object.assign({}, ...objects);
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      Object.prototype.toString.call(value) === '[object Object]'
    );
  }
}

// Default configuration for merge node
export const mergeNodeDefaults: MergeNodeConfig = {
  strategy: 'concat',
  waitForAll: true,
  timeout: 30000,
};
