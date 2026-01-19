import React, { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
  Panel,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { WorkflowNode, WorkflowEdge, BezierStyle } from '@/types/workflow';
import { useWorkflowCanvas } from '@/hooks/useWorkflowCanvas';
import { workflowEdgeTypes } from './edges';

export interface WorkflowCanvasProps {
  initialNodes?: WorkflowNode[];
  initialEdges?: WorkflowEdge[];
  nodeTypes?: NodeTypes;
  defaultBezierStyle?: BezierStyle;
  showMiniMap?: boolean;
  showControls?: boolean;
  showBackground?: boolean;
  onConnectionError?: (error: string) => void;
  onWorkflowChange?: (data: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }) => void;
}

/**
 * Main workflow canvas component with React Flow
 */
export function WorkflowCanvas({
  initialNodes = [],
  initialEdges = [],
  nodeTypes = {},
  defaultBezierStyle = 'smoothstep',
  showMiniMap = true,
  showControls = true,
  showBackground = true,
  onConnectionError,
  onWorkflowChange,
}: WorkflowCanvasProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    bezierStyle,
    setBezierStyle,
  } = useWorkflowCanvas({
    initialNodes,
    initialEdges,
    defaultBezierStyle,
    onConnectionError,
  });

  // Notify parent of changes
  const handleNodesChange: typeof onNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // Defer to avoid state update during render
      setTimeout(() => {
        onWorkflowChange?.({ nodes, edges });
      }, 0);
    },
    [onNodesChange, onWorkflowChange, nodes, edges]
  );

  const handleEdgesChange: typeof onEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      setTimeout(() => {
        onWorkflowChange?.({ nodes, edges });
      }, 0);
    },
    [onEdgesChange, onWorkflowChange, nodes, edges]
  );

  // Style selector options
  const bezierOptions: { value: BezierStyle; label: string }[] = [
    { value: 'smoothstep', label: 'Smooth Step' },
    { value: 'smooth', label: 'Bezier' },
    { value: 'straight', label: 'Straight' },
    { value: 'step', label: 'Step' },
  ];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        edgeTypes={workflowEdgeTypes}
        defaultEdgeOptions={{
          type: 'labeled',
        }}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        {showBackground && (
          <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
        )}

        {showControls && <Controls />}

        {showMiniMap && (
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
        )}

        {/* Edge style selector panel */}
        <Panel position="top-right">
          <div
            style={{
              backgroundColor: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <label
              htmlFor="bezier-style"
              style={{ fontSize: '12px', color: '#64748b' }}
            >
              Edge Style:
            </label>
            <select
              id="bezier-style"
              value={bezierStyle}
              onChange={(e) => setBezierStyle(e.target.value as BezierStyle)}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            >
              {bezierOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default WorkflowCanvas;
