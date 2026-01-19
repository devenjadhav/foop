import type { ConnectionLabel, ConnectionLabelStyle, DataType } from '@/types/workflow';

/**
 * Default label style configuration
 */
export const defaultLabelStyle: ConnectionLabelStyle = {
  backgroundColor: '#ffffff',
  color: '#374151',
  fontSize: 12,
  padding: '4px 8px',
  borderRadius: '4px',
};

/**
 * Label style presets for different states
 */
export const labelStylePresets: Record<string, ConnectionLabelStyle> = {
  default: {
    backgroundColor: '#ffffff',
    color: '#374151',
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: '4px',
  },
  info: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: '4px',
  },
  success: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: '4px',
  },
  warning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: '4px',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: '4px',
  },
  dataType: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    fontSize: 10,
    padding: '2px 6px',
    borderRadius: '10px',
  },
};

/**
 * Create a connection label
 */
export function createConnectionLabel(
  text: string,
  options: {
    position?: number;
    style?: ConnectionLabelStyle | keyof typeof labelStylePresets;
  } = {}
): ConnectionLabel {
  const { position = 0.5, style = 'default' } = options;

  const resolvedStyle = typeof style === 'string' ? labelStylePresets[style] : style;

  return {
    text,
    position,
    style: resolvedStyle,
  };
}

/**
 * Create a data type label
 */
export function createDataTypeLabel(dataType: DataType): ConnectionLabel {
  const typeDisplayNames: Record<DataType, string> = {
    any: 'Any',
    string: 'String',
    number: 'Number',
    boolean: 'Bool',
    object: 'Object',
    array: 'Array',
  };

  return createConnectionLabel(typeDisplayNames[dataType], {
    position: 0.5,
    style: 'dataType',
  });
}

/**
 * Create a conditional label
 */
export function createConditionalLabel(condition: string): ConnectionLabel {
  return createConnectionLabel(condition, {
    position: 0.5,
    style: 'info',
  });
}

/**
 * Create a transform label showing data transformation
 */
export function createTransformLabel(from: string, to: string): ConnectionLabel {
  return createConnectionLabel(`${from} → ${to}`, {
    position: 0.5,
    style: 'default',
  });
}

/**
 * Create an error label for invalid connections
 */
export function createErrorLabel(message: string): ConnectionLabel {
  return createConnectionLabel(message, {
    position: 0.5,
    style: 'error',
  });
}

/**
 * Format label text with truncation
 */
export function formatLabelText(text: string, maxLength: number = 30): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Parse label from edge data
 */
export function parseLabelFromData(data: unknown): ConnectionLabel | null {
  if (!data || typeof data !== 'object') return null;

  const edgeData = data as Record<string, unknown>;

  if (edgeData.label && typeof edgeData.label === 'object') {
    const label = edgeData.label as Record<string, unknown>;
    if (typeof label.text === 'string') {
      return {
        text: label.text,
        position: typeof label.position === 'number' ? label.position : 0.5,
        style: label.style as ConnectionLabelStyle | undefined,
      };
    }
  }

  return null;
}

/**
 * Convert label style to CSS properties
 */
export function labelStyleToCSS(style: ConnectionLabelStyle = defaultLabelStyle): React.CSSProperties {
  return {
    backgroundColor: style.backgroundColor,
    color: style.color,
    fontSize: style.fontSize,
    padding: style.padding,
    borderRadius: style.borderRadius,
    border: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    whiteSpace: 'nowrap',
    pointerEvents: 'all',
    cursor: 'pointer',
  };
}

/**
 * Calculate label position on the edge path
 */
export function calculateLabelPosition(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  position: number = 0.5
): { x: number; y: number } {
  return {
    x: sourceX + (targetX - sourceX) * position,
    y: sourceY + (targetY - sourceY) * position,
  };
}

/**
 * Merge label styles
 */
export function mergeLabelStyles(
  base: ConnectionLabelStyle,
  override: Partial<ConnectionLabelStyle>
): ConnectionLabelStyle {
  return {
    ...base,
    ...override,
  };
}
