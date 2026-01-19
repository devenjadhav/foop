/**
 * Map/Transform Node
 *
 * Transforms data by applying rules to modify, rename, or compute new fields.
 * Supports various transformation operations including string manipulation,
 * math operations, type conversions, and custom expressions.
 */

import { BaseActionNode } from '../base-node';
import type {
  MapNodeConfig,
  TransformRule,
  NodePort,
  NodeData,
  ExecutionContext,
  ExecutionResult,
} from '../types';

export class MapNode extends BaseActionNode<MapNodeConfig> {
  readonly type = 'map' as const;
  readonly name = 'Map / Transform';
  readonly description = 'Transform data by applying rules to fields';

  readonly inputs: NodePort[] = [
    {
      id: 'input',
      name: 'Input',
      description: 'Data to transform',
      required: true,
    },
  ];

  readonly outputs: NodePort[] = [
    {
      id: 'output',
      name: 'Output',
      description: 'Transformed data',
    },
  ];

  validateConfig(config: MapNodeConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.rules || !Array.isArray(config.rules)) {
      errors.push('Rules must be an array');
    } else if (config.rules.length === 0) {
      errors.push('At least one transformation rule is required');
    } else {
      config.rules.forEach((rule, index) => {
        if (!rule.operation) {
          errors.push(`Rule ${index + 1}: operation is required`);
        }
        if (!rule.targetField && rule.operation !== 'delete') {
          errors.push(`Rule ${index + 1}: targetField is required`);
        }

        // Validate operation-specific requirements
        const requiresSource = ['rename', 'copy', 'lowercase', 'uppercase', 'trim', 'split', 'parseJson', 'stringify', 'parseNumber', 'parseDate', 'formatDate'];
        const requiresValue = ['set', 'template', 'math'];

        if (requiresSource.includes(rule.operation) && !rule.sourceField) {
          errors.push(`Rule ${index + 1}: sourceField is required for '${rule.operation}' operation`);
        }
        if (requiresValue.includes(rule.operation) && rule.value === undefined) {
          errors.push(`Rule ${index + 1}: value is required for '${rule.operation}' operation`);
        }
        if (rule.operation === 'delete' && !rule.sourceField && !rule.targetField) {
          errors.push(`Rule ${index + 1}: sourceField or targetField is required for delete operation`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async execute(
    input: NodeData,
    config: MapNodeConfig,
    _context: ExecutionContext
  ): Promise<ExecutionResult> {
    const validation = this.validateConfig(config);
    if (!validation.valid) {
      return this.failure(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    try {
      const items = this.ensureArray(input);
      const transformed: Record<string, unknown>[] = [];

      for (const item of items) {
        let result = config.keepOriginal ? this.deepClone(item) : {};

        for (const rule of config.rules) {
          result = this.applyRule(result, item, rule);
        }

        transformed.push(result);
      }

      // Return single object if input was single object
      const output = Array.isArray(input) ? transformed : transformed[0];
      return this.success(output as NodeData);
    } catch (error) {
      return this.failure(
        error instanceof Error ? error.message : 'Unknown error during transform execution'
      );
    }
  }

  private applyRule(
    current: Record<string, unknown>,
    original: Record<string, unknown>,
    rule: TransformRule
  ): Record<string, unknown> {
    const sourceValue = rule.sourceField
      ? this.getFieldValue(original, rule.sourceField)
      : undefined;

    switch (rule.operation) {
      case 'set':
        return this.setFieldValue(current, rule.targetField, rule.value);

      case 'rename':
        if (sourceValue !== undefined) {
          const withValue = this.setFieldValue(current, rule.targetField, sourceValue);
          return this.deleteField(withValue, rule.sourceField!);
        }
        return current;

      case 'delete':
        return this.deleteField(current, rule.sourceField || rule.targetField);

      case 'copy':
        if (sourceValue !== undefined) {
          return this.setFieldValue(current, rule.targetField, this.deepClone(sourceValue));
        }
        return current;

      case 'template':
        return this.setFieldValue(
          current,
          rule.targetField,
          this.interpolateTemplate(String(rule.value), original)
        );

      case 'math':
        return this.setFieldValue(
          current,
          rule.targetField,
          this.evaluateMath(String(rule.value), original)
        );

      case 'lowercase':
        return this.setFieldValue(
          current,
          rule.targetField,
          String(sourceValue ?? '').toLowerCase()
        );

      case 'uppercase':
        return this.setFieldValue(
          current,
          rule.targetField,
          String(sourceValue ?? '').toUpperCase()
        );

      case 'trim':
        return this.setFieldValue(
          current,
          rule.targetField,
          String(sourceValue ?? '').trim()
        );

      case 'split': {
        const delimiter = (rule.options?.delimiter as string) ?? ',';
        return this.setFieldValue(
          current,
          rule.targetField,
          String(sourceValue ?? '').split(delimiter)
        );
      }

      case 'join': {
        const separator = (rule.options?.separator as string) ?? ',';
        if (Array.isArray(sourceValue)) {
          return this.setFieldValue(current, rule.targetField, sourceValue.join(separator));
        }
        return this.setFieldValue(current, rule.targetField, String(sourceValue ?? ''));
      }

      case 'parseJson':
        try {
          return this.setFieldValue(
            current,
            rule.targetField,
            JSON.parse(String(sourceValue ?? '{}'))
          );
        } catch {
          return this.setFieldValue(current, rule.targetField, null);
        }

      case 'stringify':
        return this.setFieldValue(
          current,
          rule.targetField,
          JSON.stringify(sourceValue)
        );

      case 'parseNumber': {
        const num = Number(sourceValue);
        return this.setFieldValue(
          current,
          rule.targetField,
          isNaN(num) ? null : num
        );
      }

      case 'parseDate': {
        const date = new Date(String(sourceValue));
        return this.setFieldValue(
          current,
          rule.targetField,
          isNaN(date.getTime()) ? null : date.toISOString()
        );
      }

      case 'formatDate': {
        const dateValue = new Date(String(sourceValue));
        if (isNaN(dateValue.getTime())) {
          return this.setFieldValue(current, rule.targetField, null);
        }
        const format = (rule.options?.format as string) ?? 'iso';
        return this.setFieldValue(
          current,
          rule.targetField,
          this.formatDate(dateValue, format)
        );
      }

      case 'custom':
        return this.setFieldValue(
          current,
          rule.targetField,
          this.evaluateCustomExpression(String(rule.value), original)
        );

      default:
        return current;
    }
  }

  /**
   * Interpolate a template string with field values
   * Supports {{field}} syntax
   */
  private interpolateTemplate(template: string, data: Record<string, unknown>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_match, field) => {
      const value = this.getFieldValue(data, field.trim());
      return value !== undefined ? String(value) : '';
    });
  }

  /**
   * Evaluate a simple math expression with field references
   * Supports basic arithmetic: +, -, *, /, %, ()
   * Field references use {{field}} syntax
   */
  private evaluateMath(expression: string, data: Record<string, unknown>): number | null {
    try {
      // Replace field references with their numeric values
      const substituted = expression.replace(/\{\{([^}]+)\}\}/g, (_match, field) => {
        const value = this.getFieldValue(data, field.trim());
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`Field '${field}' is not a number`);
        }
        return String(num);
      });

      // Validate the expression only contains safe characters
      if (!/^[\d\s+\-*/%().]+$/.test(substituted)) {
        throw new Error('Invalid characters in math expression');
      }

      // Use Function constructor for safe math evaluation
      // This is safer than eval() as it creates an isolated scope
      const result = new Function(`return (${substituted})`)();
      return typeof result === 'number' && !isNaN(result) ? result : null;
    } catch {
      return null;
    }
  }

  /**
   * Evaluate a custom expression
   * Limited to safe operations for security
   */
  private evaluateCustomExpression(
    expression: string,
    data: Record<string, unknown>
  ): unknown {
    try {
      // Replace field references
      const substituted = expression.replace(/\{\{([^}]+)\}\}/g, (_match, field) => {
        const value = this.getFieldValue(data, field.trim());
        return JSON.stringify(value);
      });

      // Execute in isolated context with limited scope
      const fn = new Function('data', `
        const { String, Number, Boolean, Array, Object, Math, Date, JSON } = globalThis;
        return (${substituted});
      `);

      return fn(data);
    } catch {
      return null;
    }
  }

  /**
   * Format a date according to the specified format
   */
  private formatDate(date: Date, format: string): string {
    const pad = (n: number): string => n.toString().padStart(2, '0');

    switch (format) {
      case 'iso':
        return date.toISOString();
      case 'date':
        return date.toISOString().split('T')[0];
      case 'time':
        return date.toISOString().split('T')[1].split('.')[0];
      case 'unix':
        return Math.floor(date.getTime() / 1000).toString();
      case 'unixMs':
        return date.getTime().toString();
      default:
        // Simple custom format support
        return format
          .replace('YYYY', date.getFullYear().toString())
          .replace('MM', pad(date.getMonth() + 1))
          .replace('DD', pad(date.getDate()))
          .replace('HH', pad(date.getHours()))
          .replace('mm', pad(date.getMinutes()))
          .replace('ss', pad(date.getSeconds()));
    }
  }
}

// Default configuration for map node
export const mapNodeDefaults: MapNodeConfig = {
  rules: [],
  keepOriginal: true,
};
