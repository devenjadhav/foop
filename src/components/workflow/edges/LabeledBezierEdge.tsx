import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  type EdgeProps,
} from '@xyflow/react';
import type { WorkflowEdgeData, BezierStyle } from '@/types/workflow';
import { calculateEdgeStyle, dataTypeColors } from '@/lib/workflow/bezier-curves';
import { labelStyleToCSS, defaultLabelStyle, formatLabelText } from '@/lib/workflow/connection-labels';

export interface LabeledBezierEdgeProps extends EdgeProps<WorkflowEdgeData> {
  bezierStyle?: BezierStyle;
}

/**
 * Custom edge component with bezier curves and connection labels
 */
function LabeledBezierEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  style,
  markerEnd,
  bezierStyle = 'smoothstep',
}: LabeledBezierEdgeProps) {
  // Calculate edge path based on bezier style
  const getPath = () => {
    switch (bezierStyle) {
      case 'straight':
        return getStraightPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
        });
      case 'step':
        return getSmoothStepPath({
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition,
          borderRadius: 0,
        });
      case 'smoothstep':
        return getSmoothStepPath({
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition,
          borderRadius: 10,
        });
      case 'smooth':
      default:
        return getBezierPath({
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition,
        });
    }
  };

  const [edgePath, labelX, labelY] = getPath();

  // Calculate edge style based on state
  const edgeStyle = calculateEdgeStyle({
    selected: selected ?? false,
    validated: data?.validated,
    validationError: data?.validationError,
    animated: data?.animated,
    dataType: data?.dataType,
  });

  // Merge with custom style
  const finalStyle = {
    ...edgeStyle,
    ...style,
  };

  // Get label configuration
  const label = data?.label;
  const labelPosition = label?.position ?? 0.5;

  // Calculate actual label position along the path
  const actualLabelX = sourceX + (targetX - sourceX) * labelPosition;
  const actualLabelY = sourceY + (targetY - sourceY) * labelPosition;

  // Use path midpoint for better positioning with curves
  const displayLabelX = labelPosition === 0.5 ? labelX : actualLabelX;
  const displayLabelY = labelPosition === 0.5 ? labelY : actualLabelY;

  // Label style
  const labelStyle = labelStyleToCSS(label?.style ?? defaultLabelStyle);

  // Data type indicator color
  const dataTypeColor = data?.dataType ? dataTypeColors[data.dataType] : undefined;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={finalStyle}
        markerEnd={markerEnd}
      />

      {/* Animated flow indicator */}
      {data?.animated && (
        <circle r={4} fill={dataTypeColor ?? finalStyle.stroke}>
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

      {/* Connection label */}
      {label && (
        <EdgeLabelRenderer>
          <div
            className="workflow-edge-label"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${displayLabelX}px, ${displayLabelY}px)`,
              ...labelStyle,
            }}
          >
            {formatLabelText(label.text)}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Validation error indicator */}
      {data?.validationError && (
        <EdgeLabelRenderer>
          <div
            className="workflow-edge-error"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 20}px)`,
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid #fecaca',
              whiteSpace: 'nowrap',
            }}
          >
            {data.validationError}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Data type badge */}
      {data?.dataType && !label && (
        <EdgeLabelRenderer>
          <div
            className="workflow-edge-datatype"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              backgroundColor: dataTypeColor,
              color: '#ffffff',
              fontSize: 9,
              padding: '1px 5px',
              borderRadius: '8px',
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            {data.dataType}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(LabeledBezierEdge);
