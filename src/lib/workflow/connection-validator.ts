import type { Connection } from '@xyflow/react';
import type {
  WorkflowNode,
  WorkflowEdge,
  ConnectionRule,
  ConnectionValidationResult,
  WorkflowNodeType,
  DataType,
} from '@/types/workflow';

/**
 * Get node by ID from nodes array
 */
function getNodeById(nodes: WorkflowNode[], id: string): WorkflowNode | undefined {
  return nodes.find((node) => node.id === id);
}

/**
 * Get handle configuration from a node
 */
function getHandleConfig(node: WorkflowNode, handleId: string | null) {
  if (!handleId) return node.data.handles[0];
  return node.data.handles.find((h) => h.id === handleId);
}

/**
 * Count existing connections for a specific handle
 */
function countHandleConnections(
  edges: WorkflowEdge[],
  nodeId: string,
  handleId: string | null,
  type: 'source' | 'target'
): number {
  return edges.filter((edge) => {
    if (type === 'source') {
      return edge.source === nodeId && (edge.sourceHandle === handleId || (!edge.sourceHandle && !handleId));
    }
    return edge.target === nodeId && (edge.targetHandle === handleId || (!edge.targetHandle && !handleId));
  }).length;
}

/**
 * Check if data types are compatible
 */
function areDataTypesCompatible(sourceType: DataType, targetType: DataType): boolean {
  if (sourceType === 'any' || targetType === 'any') return true;
  return sourceType === targetType;
}

/**
 * Rule: Prevent self-connections
 */
const noSelfConnectionRule: ConnectionRule = {
  id: 'no-self-connection',
  description: 'Nodes cannot connect to themselves',
  validate: (connection) => {
    if (connection.source === connection.target) {
      return { valid: false, reason: 'Cannot connect a node to itself' };
    }
    return { valid: true };
  },
};

/**
 * Rule: Prevent duplicate connections
 */
const noDuplicateConnectionRule: ConnectionRule = {
  id: 'no-duplicate-connection',
  description: 'Duplicate connections between the same handles are not allowed',
  validate: (connection, _nodes, edges) => {
    const exists = edges.some(
      (edge) =>
        edge.source === connection.source &&
        edge.target === connection.target &&
        edge.sourceHandle === connection.sourceHandle &&
        edge.targetHandle === connection.targetHandle
    );
    if (exists) {
      return { valid: false, reason: 'Connection already exists' };
    }
    return { valid: true };
  },
};

/**
 * Rule: Validate node type compatibility
 */
const nodeTypeCompatibilityRule: ConnectionRule = {
  id: 'node-type-compatibility',
  description: 'Validates that node types can be connected',
  validate: (connection, nodes) => {
    const sourceNode = getNodeById(nodes, connection.source);
    const targetNode = getNodeById(nodes, connection.target);

    if (!sourceNode || !targetNode) {
      return { valid: false, reason: 'Source or target node not found' };
    }

    const sourceType = sourceNode.data.nodeType;
    const targetType = targetNode.data.nodeType;

    // Define allowed connections between node types
    const allowedConnections: Record<WorkflowNodeType, WorkflowNodeType[]> = {
      trigger: ['action', 'condition', 'transform'],
      action: ['action', 'condition', 'transform', 'output'],
      condition: ['action', 'condition', 'transform', 'output'],
      transform: ['action', 'condition', 'transform', 'output'],
      output: [], // Output nodes cannot have outgoing connections
    };

    if (!allowedConnections[sourceType]?.includes(targetType)) {
      return {
        valid: false,
        reason: `Cannot connect ${sourceType} to ${targetType}`,
      };
    }

    return { valid: true };
  },
};

/**
 * Rule: Validate data type compatibility between handles
 */
const dataTypeCompatibilityRule: ConnectionRule = {
  id: 'data-type-compatibility',
  description: 'Validates that connected handles have compatible data types',
  validate: (connection, nodes) => {
    const sourceNode = getNodeById(nodes, connection.source);
    const targetNode = getNodeById(nodes, connection.target);

    if (!sourceNode || !targetNode) {
      return { valid: false, reason: 'Source or target node not found' };
    }

    const sourceHandle = getHandleConfig(sourceNode, connection.sourceHandle);
    const targetHandle = getHandleConfig(targetNode, connection.targetHandle);

    if (!sourceHandle || !targetHandle) {
      return { valid: false, reason: 'Handle configuration not found' };
    }

    if (!areDataTypesCompatible(sourceHandle.dataType, targetHandle.dataType)) {
      return {
        valid: false,
        reason: `Incompatible data types: ${sourceHandle.dataType} → ${targetHandle.dataType}`,
      };
    }

    return { valid: true };
  },
};

/**
 * Rule: Enforce maximum connections per handle
 */
const maxConnectionsRule: ConnectionRule = {
  id: 'max-connections',
  description: 'Enforces maximum connection limits on handles',
  validate: (connection, nodes, edges) => {
    const sourceNode = getNodeById(nodes, connection.source);
    const targetNode = getNodeById(nodes, connection.target);

    if (!sourceNode || !targetNode) {
      return { valid: false, reason: 'Source or target node not found' };
    }

    const sourceHandle = getHandleConfig(sourceNode, connection.sourceHandle);
    const targetHandle = getHandleConfig(targetNode, connection.targetHandle);

    // Check source handle limit
    if (sourceHandle?.maxConnections) {
      const currentCount = countHandleConnections(
        edges,
        connection.source,
        connection.sourceHandle,
        'source'
      );
      if (currentCount >= sourceHandle.maxConnections) {
        return {
          valid: false,
          reason: `Source handle has reached maximum connections (${sourceHandle.maxConnections})`,
        };
      }
    }

    // Check target handle limit
    if (targetHandle?.maxConnections) {
      const currentCount = countHandleConnections(
        edges,
        connection.target,
        connection.targetHandle,
        'target'
      );
      if (currentCount >= targetHandle.maxConnections) {
        return {
          valid: false,
          reason: `Target handle has reached maximum connections (${targetHandle.maxConnections})`,
        };
      }
    }

    return { valid: true };
  },
};

/**
 * Rule: Prevent circular dependencies (cycles)
 */
const noCyclesRule: ConnectionRule = {
  id: 'no-cycles',
  description: 'Prevents circular dependencies in the workflow',
  validate: (connection, nodes, edges) => {
    // Build adjacency list including the new connection
    const adjacency = new Map<string, string[]>();

    // Initialize with all nodes
    nodes.forEach((node) => adjacency.set(node.id, []));

    // Add existing edges
    edges.forEach((edge) => {
      const targets = adjacency.get(edge.source) || [];
      targets.push(edge.target);
      adjacency.set(edge.source, targets);
    });

    // Add the proposed connection
    const targets = adjacency.get(connection.source) || [];
    targets.push(connection.target);
    adjacency.set(connection.source, targets);

    // DFS to detect cycle starting from target
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    function hasCycle(nodeId: string): boolean {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = adjacency.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    }

    // Check for cycles starting from source
    if (hasCycle(connection.source)) {
      return {
        valid: false,
        reason: 'Connection would create a circular dependency',
      };
    }

    return { valid: true };
  },
};

/**
 * Rule: Triggers can only be at the start
 */
const triggerPositionRule: ConnectionRule = {
  id: 'trigger-position',
  description: 'Trigger nodes cannot have incoming connections',
  validate: (connection, nodes) => {
    const targetNode = getNodeById(nodes, connection.target);

    if (targetNode?.data.nodeType === 'trigger') {
      return {
        valid: false,
        reason: 'Trigger nodes cannot have incoming connections',
      };
    }

    return { valid: true };
  },
};

/**
 * Default set of validation rules
 */
export const defaultValidationRules: ConnectionRule[] = [
  noSelfConnectionRule,
  noDuplicateConnectionRule,
  triggerPositionRule,
  nodeTypeCompatibilityRule,
  dataTypeCompatibilityRule,
  maxConnectionsRule,
  noCyclesRule,
];

/**
 * Validate a connection against all rules
 */
export function validateConnection(
  connection: Connection,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  rules: ConnectionRule[] = defaultValidationRules
): ConnectionValidationResult {
  for (const rule of rules) {
    const result = rule.validate(connection, nodes, edges);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}

/**
 * Create a custom validation rule
 */
export function createValidationRule(
  id: string,
  description: string,
  validate: ConnectionRule['validate']
): ConnectionRule {
  return { id, description, validate };
}

/**
 * Combine multiple rule sets
 */
export function combineRules(...ruleSets: ConnectionRule[][]): ConnectionRule[] {
  const seen = new Set<string>();
  const combined: ConnectionRule[] = [];

  for (const rules of ruleSets) {
    for (const rule of rules) {
      if (!seen.has(rule.id)) {
        seen.add(rule.id);
        combined.push(rule);
      }
    }
  }

  return combined;
}

export {
  noSelfConnectionRule,
  noDuplicateConnectionRule,
  nodeTypeCompatibilityRule,
  dataTypeCompatibilityRule,
  maxConnectionsRule,
  noCyclesRule,
  triggerPositionRule,
};
