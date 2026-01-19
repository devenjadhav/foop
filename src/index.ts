// Main exports for the workflow connection library

// Components
export { WorkflowCanvas, workflowEdgeTypes, LabeledBezierEdge } from './components/workflow';

// Hooks
export {
  useWorkflowCanvas,
  useConnectionValidation,
  createConnectionValidator,
  createValidationRule,
} from './hooks';

// Utilities
export {
  // Validation
  validateConnection,
  defaultValidationRules,
  combineRules,
  noSelfConnectionRule,
  noDuplicateConnectionRule,
  nodeTypeCompatibilityRule,
  dataTypeCompatibilityRule,
  maxConnectionsRule,
  noCyclesRule,
  triggerPositionRule,
  // Bezier curves
  defaultEdgeStyle,
  edgeStylePresets,
  dataTypeColors,
  getEdgeType,
  calculateBezierControlPoints,
  generateBezierPath,
  getPointOnBezier,
  calculateEdgeStyle,
  edgeAnimations,
  edgeAnimationKeyframes,
  // Labels
  defaultLabelStyle,
  labelStylePresets,
  createConnectionLabel,
  createDataTypeLabel,
  createConditionalLabel,
  createTransformLabel,
  createErrorLabel,
  formatLabelText,
  labelStyleToCSS,
  calculateLabelPosition,
  mergeLabelStyles,
} from './lib/workflow';

// Types
export type {
  WorkflowNodeType,
  DataType,
  HandleConfig,
  WorkflowNodeData,
  ConnectionLabel,
  ConnectionLabelStyle,
  WorkflowEdgeData,
  WorkflowNode,
  WorkflowEdge,
  ConnectionValidationResult,
  ConnectionRule,
  BezierStyle,
  EdgeStyleConfig,
} from './types/workflow';
