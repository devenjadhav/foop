import LabeledBezierEdge from './LabeledBezierEdge';
import type { EdgeTypes } from '@xyflow/react';

/**
 * Custom edge types for the workflow canvas
 */
export const workflowEdgeTypes: EdgeTypes = {
  labeled: LabeledBezierEdge,
  // Add more custom edge types as needed
};

export { LabeledBezierEdge };
export default workflowEdgeTypes;
