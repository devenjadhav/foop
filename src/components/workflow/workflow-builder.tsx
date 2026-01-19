"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import { NodePalette } from "./node-palette";
import { WorkflowCanvas } from "./workflow-canvas";
import { NodeIcon } from "./node-icon";
import { cn } from "@/lib/utils";
import type { NodeType } from "@/types/nodes";

interface DroppedNode {
  id: string;
  node: NodeType;
  x: number;
  y: number;
}

const categoryBgColors: Record<string, string> = {
  triggers: "bg-green-100 border-green-300",
  actions: "bg-blue-100 border-blue-300",
  logic: "bg-purple-100 border-purple-300",
};

const categoryIconColors: Record<string, string> = {
  triggers: "text-green-600",
  actions: "text-blue-600",
  logic: "text-purple-600",
};

export function WorkflowBuilder() {
  const [droppedNodes, setDroppedNodes] = useState<DroppedNode[]>([]);
  const [activeNode, setActiveNode] = useState<NodeType | null>(null);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "node") {
      setActiveNode(active.data.current.node);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveNode(null);

    if (over?.id === "canvas" && active.data.current?.type === "node") {
      const node = active.data.current.node as NodeType;

      const canvasElement = document.querySelector('[data-droppable="canvas"]');
      const rect = canvasElement?.getBoundingClientRect();

      if (rect && event.activatorEvent instanceof MouseEvent) {
        const x = event.activatorEvent.clientX - rect.left + (event.delta?.x || 0);
        const y = event.activatorEvent.clientY - rect.top + (event.delta?.y || 0);

        const newDroppedNode: DroppedNode = {
          id: `${node.id}-${Date.now()}`,
          node,
          x: Math.max(90, Math.min(x, rect.width - 90)),
          y: Math.max(30, Math.min(y, rect.height - 30)),
        };

        setDroppedNodes((prev) => [...prev, newDroppedNode]);
      }
    }
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen">
        <NodePalette className="w-80 flex-shrink-0" />
        <div className="flex-1 flex flex-col">
          <header className="flex-shrink-0 h-14 border-b border-border bg-background flex items-center px-4 justify-between">
            <h1 className="text-lg font-semibold text-foreground">
              Workflow Builder
            </h1>
            <div className="text-sm text-muted-foreground">
              {droppedNodes.length} node{droppedNodes.length !== 1 ? "s" : ""} on
              canvas
            </div>
          </header>
          <div className="flex-1 relative" data-droppable="canvas">
            <WorkflowCanvas droppedNodes={droppedNodes} />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeNode && (
          <div
            className={cn(
              "p-3 rounded-lg border-2 shadow-lg min-w-[180px] opacity-90",
              categoryBgColors[activeNode.category]
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "p-1.5 rounded bg-white/50",
                  categoryIconColors[activeNode.category]
                )}
              >
                <NodeIcon name={activeNode.icon} className="h-4 w-4" />
              </div>
              <span className="font-medium text-sm text-foreground">
                {activeNode.name}
              </span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
