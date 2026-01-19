import type { BezierStyle, EdgeStyleConfig, DataType } from '@/types/workflow';

/**
 * Default edge style configuration
 */
export const defaultEdgeStyle: EdgeStyleConfig = {
  bezierStyle: 'smoothstep',
  strokeWidth: 2,
  strokeColor: '#64748b',
  selectedColor: '#3b82f6',
  animatedColor: '#22c55e',
};

/**
 * Edge style presets for different states
 */
export const edgeStylePresets = {
  default: {
    stroke: '#64748b',
    strokeWidth: 2,
  },
  selected: {
    stroke: '#3b82f6',
    strokeWidth: 3,
  },
  valid: {
    stroke: '#22c55e',
    strokeWidth: 2,
  },
  invalid: {
    stroke: '#ef4444',
    strokeWidth: 2,
    strokeDasharray: '5,5',
  },
  pending: {
    stroke: '#f59e0b',
    strokeWidth: 2,
    strokeDasharray: '3,3',
  },
} as const;

/**
 * Color mapping for different data types
 */
export const dataTypeColors: Record<DataType, string> = {
  any: '#64748b',
  string: '#22c55e',
  number: '#3b82f6',
  boolean: '#f59e0b',
  object: '#8b5cf6',
  array: '#ec4899',
};

/**
 * Get edge type string for React Flow based on bezier style
 */
export function getEdgeType(style: BezierStyle): string {
  switch (style) {
    case 'smooth':
      return 'default';
    case 'straight':
      return 'straight';
    case 'step':
      return 'step';
    case 'smoothstep':
      return 'smoothstep';
    default:
      return 'smoothstep';
  }
}

/**
 * Calculate bezier control points for custom curves
 */
export function calculateBezierControlPoints(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  curvature: number = 0.25
): { controlPoint1: { x: number; y: number }; controlPoint2: { x: number; y: number } } {
  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  const offset = distance * curvature;

  return {
    controlPoint1: {
      x: sourceX + offset,
      y: sourceY,
    },
    controlPoint2: {
      x: targetX - offset,
      y: targetY,
    },
  };
}

/**
 * Generate SVG path for custom bezier curve
 */
export function generateBezierPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  style: BezierStyle = 'smoothstep',
  curvature: number = 0.25
): string {
  switch (style) {
    case 'straight':
      return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

    case 'step': {
      const midX = (sourceX + targetX) / 2;
      return `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
    }

    case 'smoothstep': {
      const midX = (sourceX + targetX) / 2;
      const radius = Math.min(10, Math.abs(targetY - sourceY) / 2, Math.abs(midX - sourceX));

      if (Math.abs(targetY - sourceY) < radius * 2) {
        return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
      }

      const direction = targetY > sourceY ? 1 : -1;

      return `M ${sourceX} ${sourceY}
              L ${midX - radius} ${sourceY}
              Q ${midX} ${sourceY} ${midX} ${sourceY + radius * direction}
              L ${midX} ${targetY - radius * direction}
              Q ${midX} ${targetY} ${midX + radius} ${targetY}
              L ${targetX} ${targetY}`;
    }

    case 'smooth':
    default: {
      const { controlPoint1, controlPoint2 } = calculateBezierControlPoints(
        sourceX,
        sourceY,
        targetX,
        targetY,
        curvature
      );
      return `M ${sourceX} ${sourceY} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${targetX} ${targetY}`;
    }
  }
}

/**
 * Get point along a bezier curve at a given t (0-1)
 */
export function getPointOnBezier(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  t: number,
  curvature: number = 0.25
): { x: number; y: number } {
  const { controlPoint1, controlPoint2 } = calculateBezierControlPoints(
    sourceX,
    sourceY,
    targetX,
    targetY,
    curvature
  );

  // Cubic bezier formula
  const x =
    Math.pow(1 - t, 3) * sourceX +
    3 * Math.pow(1 - t, 2) * t * controlPoint1.x +
    3 * (1 - t) * Math.pow(t, 2) * controlPoint2.x +
    Math.pow(t, 3) * targetX;

  const y =
    Math.pow(1 - t, 3) * sourceY +
    3 * Math.pow(1 - t, 2) * t * controlPoint1.y +
    3 * (1 - t) * Math.pow(t, 2) * controlPoint2.y +
    Math.pow(t, 3) * targetY;

  return { x, y };
}

/**
 * Calculate edge style based on state and data type
 */
export function calculateEdgeStyle(options: {
  selected?: boolean;
  validated?: boolean;
  validationError?: string;
  animated?: boolean;
  dataType?: DataType;
}): React.CSSProperties {
  const { selected, validated, validationError, animated, dataType } = options;

  let baseStyle = { ...edgeStylePresets.default };

  if (validationError) {
    baseStyle = { ...edgeStylePresets.invalid };
  } else if (validated) {
    baseStyle = { ...edgeStylePresets.valid };
  } else if (selected) {
    baseStyle = { ...edgeStylePresets.selected };
  }

  // Apply data type color if specified
  if (dataType && !validationError) {
    baseStyle.stroke = dataTypeColors[dataType];
  }

  return {
    ...baseStyle,
    transition: 'stroke 0.2s, stroke-width 0.2s',
  } as React.CSSProperties;
}

/**
 * Animation configurations for edges
 */
export const edgeAnimations = {
  flow: {
    strokeDasharray: '5,5',
    animation: 'flow 1s linear infinite',
  },
  pulse: {
    animation: 'pulse 2s ease-in-out infinite',
  },
  none: {},
} as const;

/**
 * CSS keyframes for edge animations (to be added to global styles)
 */
export const edgeAnimationKeyframes = `
  @keyframes flow {
    from {
      stroke-dashoffset: 10;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;
