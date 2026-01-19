import { useCallback, useMemo } from 'react';
import type { Connection } from '@xyflow/react';
import type { WorkflowNode, WorkflowEdge, ConnectionRule, ConnectionValidationResult } from '@/types/workflow';
import {
  validateConnection,
  defaultValidationRules,
  combineRules,
  createValidationRule,
} from '@/lib/workflow/connection-validator';

export interface UseConnectionValidationOptions {
  customRules?: ConnectionRule[];
  replaceDefaultRules?: boolean;
}

export interface UseConnectionValidationReturn {
  validate: (connection: Connection) => ConnectionValidationResult;
  isValidConnection: (connection: Connection) => boolean;
  getValidationError: (connection: Connection) => string | undefined;
  rules: ConnectionRule[];
  addRule: (rule: ConnectionRule) => void;
  removeRule: (ruleId: string) => void;
}

/**
 * Hook for managing connection validation in the workflow canvas
 */
export function useConnectionValidation(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  options: UseConnectionValidationOptions = {}
): UseConnectionValidationReturn {
  const { customRules = [], replaceDefaultRules = false } = options;

  // Combine rules based on options
  const rules = useMemo(() => {
    if (replaceDefaultRules) {
      return customRules;
    }
    return combineRules(defaultValidationRules, customRules);
  }, [customRules, replaceDefaultRules]);

  // Validate a connection
  const validate = useCallback(
    (connection: Connection): ConnectionValidationResult => {
      return validateConnection(connection, nodes, edges, rules);
    },
    [nodes, edges, rules]
  );

  // Check if a connection is valid (for React Flow's isValidConnection prop)
  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      const result = validate(connection);
      return result.valid;
    },
    [validate]
  );

  // Get validation error message for a connection
  const getValidationError = useCallback(
    (connection: Connection): string | undefined => {
      const result = validate(connection);
      return result.reason;
    },
    [validate]
  );

  // Add a custom rule dynamically
  const addRule = useCallback((rule: ConnectionRule) => {
    // Note: This is a placeholder. In a real implementation,
    // you would use state management to track rules dynamically.
    console.warn(
      'addRule is called but rules are managed through options. ' +
        'Consider using state management for dynamic rules.',
      rule
    );
  }, []);

  // Remove a rule by ID
  const removeRule = useCallback((ruleId: string) => {
    // Note: This is a placeholder. In a real implementation,
    // you would use state management to track rules dynamically.
    console.warn(
      'removeRule is called but rules are managed through options. ' +
        'Consider using state management for dynamic rules.',
      ruleId
    );
  }, []);

  return {
    validate,
    isValidConnection,
    getValidationError,
    rules,
    addRule,
    removeRule,
  };
}

/**
 * Create a connection validation hook with predefined rules
 */
export function createConnectionValidator(
  baseRules: ConnectionRule[] = defaultValidationRules
) {
  return function useConfiguredValidation(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    additionalRules: ConnectionRule[] = []
  ) {
    return useConnectionValidation(nodes, edges, {
      customRules: combineRules(baseRules, additionalRules),
      replaceDefaultRules: true,
    });
  };
}

export { createValidationRule };
