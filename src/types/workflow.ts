import type { Node, Edge, Connection } from '@xyflow/react';

/**
 * Node types supported in the workflow canvas
 */
export type WorkflowNodeType = 'trigger' | 'action' | 'condition' | 'transform' | 'output';

/**
 * Data type for values flowing through connections
 */
export type DataType = 'any' | 'string' | 'number' | 'boolean' | 'object' | 'array';

/**
 * Handle configuration for node inputs/outputs
 */
export interface HandleConfig {
  id: string;
  type: 'source' | 'target';
  dataType: DataType;
  label?: string;
  maxConnections?: number;
}

/**
 * Base data structure for workflow nodes
 */
export interface WorkflowNodeData {
  label: string;
  nodeType: WorkflowNodeType;
  handles: HandleConfig[];
  config?: Record<string, unknown>;
}

/**
 * Connection label configuration
 */
export interface ConnectionLabel {
  text: string;
  position?: number; // 0-1, position along the edge
  style?: ConnectionLabelStyle;
}

export interface ConnectionLabelStyle {
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  padding?: string;
  borderRadius?: string;
}

/**
 * Edge data structure for workflow connections
 */
export interface WorkflowEdgeData {
  label?: ConnectionLabel;
  dataType?: DataType;
  validated?: boolean;
  validationError?: string;
  animated?: boolean;
}

/**
 * Typed workflow node
 */
export type WorkflowNode = Node<WorkflowNodeData>;

/**
 * Typed workflow edge
 */
export type WorkflowEdge = Edge<WorkflowEdgeData>;

/**
 * Validation result for connections
 */
export interface ConnectionValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Connection rule definition
 */
export interface ConnectionRule {
  id: string;
  description: string;
  validate: (
    connection: Connection,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ) => ConnectionValidationResult;
}

/**
 * Bezier curve style presets
 */
export type BezierStyle = 'smooth' | 'straight' | 'step' | 'smoothstep';

/**
 * Edge style configuration
 */
export interface EdgeStyleConfig {
  bezierStyle: BezierStyle;
  strokeWidth: number;
  strokeColor: string;
  selectedColor: string;
  animatedColor?: string;
}
