// Connection validation
export {
  validateConnection,
  defaultValidationRules,
  createValidationRule,
  combineRules,
  noSelfConnectionRule,
  noDuplicateConnectionRule,
  nodeTypeCompatibilityRule,
  dataTypeCompatibilityRule,
  maxConnectionsRule,
  noCyclesRule,
  triggerPositionRule,
} from './connection-validator';

// Bezier curves and edge styling
export {
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
} from './bezier-curves';

// Connection labels
export {
  defaultLabelStyle,
  labelStylePresets,
  createConnectionLabel,
  createDataTypeLabel,
  createConditionalLabel,
  createTransformLabel,
  createErrorLabel,
  formatLabelText,
  parseLabelFromData,
  labelStyleToCSS,
  calculateLabelPosition,
  mergeLabelStyles,
} from './connection-labels';
