/**
 * Base class for all action nodes
 * Provides common functionality and utilities
 */

import type {
  ActionNode,
  BaseNodeConfig,
  NodeData,
  NodePort,
  NodeType,
  ExecutionContext,
  ExecutionResult,
  FilterCondition,
} from './types';

export abstract class BaseActionNode<TConfig extends BaseNodeConfig = BaseNodeConfig>
  implements ActionNode<TConfig>
{
  abstract readonly type: NodeType;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly inputs: NodePort[];
  abstract readonly outputs: NodePort[];

  abstract validateConfig(config: TConfig): { valid: boolean; errors: string[] };

  abstract execute(
    input: NodeData,
    config: TConfig,
    context: ExecutionContext
  ): Promise<ExecutionResult>;

  // ============================================
  // Utility Methods for Subclasses
  // ============================================

  /**
   * Safely get a nested value from an object using dot notation
   */
  protected getFieldValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      if (typeof current === 'object' && current !== null) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Safely set a nested value in an object using dot notation
   */
  protected setFieldValue(
    obj: Record<string, unknown>,
    path: string,
    value: unknown
  ): Record<string, unknown> {
    const result = { ...obj };
    const parts = path.split('.');
    let current: Record<string, unknown> = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
        current[part] = {};
      } else {
        current[part] = { ...(current[part] as Record<string, unknown>) };
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
    return result;
  }

  /**
   * Delete a nested field from an object using dot notation
   */
  protected deleteField(obj: Record<string, unknown>, path: string): Record<string, unknown> {
    const result = { ...obj };
    const parts = path.split('.');

    if (parts.length === 1) {
      delete result[path];
      return result;
    }

    let current: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
        return result; // Path doesn't exist, nothing to delete
      }
      current[part] = { ...(current[part] as Record<string, unknown>) };
      current = current[part] as Record<string, unknown>;
    }

    delete current[parts[parts.length - 1]];
    return result;
  }

  /**
   * Evaluate a filter condition against a value
   */
  protected evaluateCondition(
    item: Record<string, unknown>,
    condition: FilterCondition
  ): boolean {
    const value = this.getFieldValue(item, condition.field);
    const compareValue = condition.value;
    const caseSensitive = condition.caseSensitive ?? true;

    // Normalize strings for case-insensitive comparison
    const normalizeString = (val: unknown): string => {
      const str = String(val ?? '');
      return caseSensitive ? str : str.toLowerCase();
    };

    switch (condition.operator) {
      case 'equals':
        if (typeof value === 'string' && typeof compareValue === 'string') {
          return normalizeString(value) === normalizeString(compareValue);
        }
        return value === compareValue;

      case 'notEquals':
        if (typeof value === 'string' && typeof compareValue === 'string') {
          return normalizeString(value) !== normalizeString(compareValue);
        }
        return value !== compareValue;

      case 'contains':
        return normalizeString(value).includes(normalizeString(compareValue));

      case 'notContains':
        return !normalizeString(value).includes(normalizeString(compareValue));

      case 'startsWith':
        return normalizeString(value).startsWith(normalizeString(compareValue));

      case 'endsWith':
        return normalizeString(value).endsWith(normalizeString(compareValue));

      case 'greaterThan':
        return Number(value) > Number(compareValue);

      case 'greaterThanOrEqual':
        return Number(value) >= Number(compareValue);

      case 'lessThan':
        return Number(value) < Number(compareValue);

      case 'lessThanOrEqual':
        return Number(value) <= Number(compareValue);

      case 'isEmpty':
        return (
          value === null ||
          value === undefined ||
          value === '' ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && Object.keys(value as object).length === 0)
        );

      case 'isNotEmpty':
        return !(
          value === null ||
          value === undefined ||
          value === '' ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && Object.keys(value as object).length === 0)
        );

      case 'matches':
        try {
          const regex = new RegExp(
            String(compareValue),
            caseSensitive ? '' : 'i'
          );
          return regex.test(String(value ?? ''));
        } catch {
          return false;
        }

      case 'in':
        if (Array.isArray(compareValue)) {
          return compareValue.some((v) =>
            caseSensitive
              ? v === value
              : normalizeString(v) === normalizeString(value)
          );
        }
        return false;

      case 'notIn':
        if (Array.isArray(compareValue)) {
          return !compareValue.some((v) =>
            caseSensitive
              ? v === value
              : normalizeString(v) === normalizeString(value)
          );
        }
        return true;

      default:
        return false;
    }
  }

  /**
   * Evaluate multiple conditions with AND/OR logic
   */
  protected evaluateConditions(
    item: Record<string, unknown>,
    conditions: FilterCondition[],
    logic: 'and' | 'or'
  ): boolean {
    if (conditions.length === 0) {
      return true;
    }

    if (logic === 'and') {
      return conditions.every((condition) => this.evaluateCondition(item, condition));
    } else {
      return conditions.some((condition) => this.evaluateCondition(item, condition));
    }
  }

  /**
   * Ensure input is an array for consistent processing
   */
  protected ensureArray(input: NodeData): Record<string, unknown>[] {
    if (Array.isArray(input)) {
      return input;
    }
    return [input];
  }

  /**
   * Create a successful execution result
   */
  protected success(data: NodeData, outputPort?: string): ExecutionResult {
    return {
      success: true,
      data,
      outputPort,
    };
  }

  /**
   * Create a failed execution result
   */
  protected failure(error: string): ExecutionResult {
    return {
      success: false,
      error,
    };
  }

  /**
   * Sleep for a specified duration
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Deep clone an object
   */
  protected deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
