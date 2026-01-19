import { useCallback, useState } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowEdgeData,
  BezierStyle,
  ConnectionLabel,
} from '@/types/workflow';
import { useConnectionValidation } from './useConnectionValidation';
import { createConnectionLabel } from '@/lib/workflow/connection-labels';

export interface UseWorkflowCanvasOptions {
  initialNodes?: WorkflowNode[];
  initialEdges?: WorkflowEdge[];
  defaultBezierStyle?: BezierStyle;
  onConnectionError?: (error: string) => void;
}

export interface UseWorkflowCanvasReturn {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: OnNodesChange<WorkflowNode>;
  onEdgesChange: OnEdgesChange<WorkflowEdge>;
  onConnect: OnConnect;
  isValidConnection: (connection: Connection) => boolean;
  addNode: (node: WorkflowNode) => void;
  removeNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
  addEdgeWithLabel: (
    connection: Connection,
    label?: string | ConnectionLabel
  ) => void;
  updateEdgeLabel: (edgeId: string, label: string | ConnectionLabel) => void;
  removeEdge: (edgeId: string) => void;
  setEdgeAnimated: (edgeId: string, animated: boolean) => void;
  bezierStyle: BezierStyle;
  setBezierStyle: (style: BezierStyle) => void;
  clearCanvas: () => void;
  getWorkflowData: () => { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
}

/**
 * Main hook for managing the workflow canvas state and interactions
 */
export function useWorkflowCanvas(
  options: UseWorkflowCanvasOptions = {}
): UseWorkflowCanvasReturn {
  const {
    initialNodes = [],
    initialEdges = [],
    defaultBezierStyle = 'smoothstep',
    onConnectionError,
  } = options;

  // Node and edge state
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>(initialEdges);

  // Bezier style state
  const [bezierStyle, setBezierStyle] = useState<BezierStyle>(defaultBezierStyle);

  // Connection validation
  const { validate, isValidConnection } = useConnectionValidation(nodes, edges);

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    (connection) => {
      const validationResult = validate(connection);

      if (!validationResult.valid) {
        onConnectionError?.(validationResult.reason || 'Invalid connection');
        return;
      }

      // Find source and target nodes to determine data type
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const sourceHandle = sourceNode?.data.handles.find(
        (h) => h.id === connection.sourceHandle || (!connection.sourceHandle && h.type === 'source')
      );

      const edgeData: WorkflowEdgeData = {
        validated: true,
        dataType: sourceHandle?.dataType,
      };

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'labeled',
            data: edgeData,
          },
          eds
        )
      );
    },
    [validate, nodes, setEdges, onConnectionError]
  );

  // Add a node
  const addNode = useCallback(
    (node: WorkflowNode) => {
      setNodes((nds) => [...nds, node]);
    },
    [setNodes]
  );

  // Remove a node and its connected edges
  const removeNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  // Update node data
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<WorkflowNode['data']>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        )
      );
    },
    [setNodes]
  );

  // Add edge with label
  const addEdgeWithLabel = useCallback(
    (connection: Connection, label?: string | ConnectionLabel) => {
      const validationResult = validate(connection);

      if (!validationResult.valid) {
        onConnectionError?.(validationResult.reason || 'Invalid connection');
        return;
      }

      const sourceNode = nodes.find((n) => n.id === connection.source);
      const sourceHandle = sourceNode?.data.handles.find(
        (h) => h.id === connection.sourceHandle || (!connection.sourceHandle && h.type === 'source')
      );

      const edgeLabel: ConnectionLabel | undefined = label
        ? typeof label === 'string'
          ? createConnectionLabel(label)
          : label
        : undefined;

      const edgeData: WorkflowEdgeData = {
        label: edgeLabel,
        validated: true,
        dataType: sourceHandle?.dataType,
      };

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'labeled',
            data: edgeData,
          },
          eds
        )
      );
    },
    [validate, nodes, setEdges, onConnectionError]
  );

  // Update edge label
  const updateEdgeLabel = useCallback(
    (edgeId: string, label: string | ConnectionLabel) => {
      const edgeLabel: ConnectionLabel =
        typeof label === 'string' ? createConnectionLabel(label) : label;

      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === edgeId
            ? {
                ...edge,
                data: { ...edge.data, label: edgeLabel },
              }
            : edge
        )
      );
    },
    [setEdges]
  );

  // Remove an edge
  const removeEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    },
    [setEdges]
  );

  // Set edge animation
  const setEdgeAnimated = useCallback(
    (edgeId: string, animated: boolean) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === edgeId
            ? {
                ...edge,
                data: { ...edge.data, animated },
              }
            : edge
        )
      );
    },
    [setEdges]
  );

  // Clear the canvas
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  // Get current workflow data
  const getWorkflowData = useCallback(() => {
    return { nodes, edges };
  }, [nodes, edges]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    addNode,
    removeNode,
    updateNodeData,
    addEdgeWithLabel,
    updateEdgeLabel,
    removeEdge,
    setEdgeAnimated,
    bezierStyle,
    setBezierStyle,
    clearCanvas,
    getWorkflowData,
  };
}
