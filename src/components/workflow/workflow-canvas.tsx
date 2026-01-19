"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { NodeType } from "@/types/nodes";
import { NodeIcon } from "./node-icon";

interface DroppedNode {
  id: string;
  node: NodeType;
  x: number;
  y: number;
}

interface WorkflowCanvasProps {
  droppedNodes: DroppedNode[];
  className?: string;
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

export function WorkflowCanvas({
  droppedNodes,
  className,
}: WorkflowCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative flex-1 bg-[#fafafa] overflow-hidden",
        isOver && "ring-2 ring-inset ring-primary/50 bg-primary/5",
        className
      )}
      style={{
        backgroundImage: `
          linear-gradient(to right, #e5e5e5 1px, transparent 1px),
          linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
    >
      {droppedNodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              Start building your workflow
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Drag nodes from the palette on the left and drop them here to
              create your automation workflow.
            </p>
          </div>
        </div>
      )}

      {droppedNodes.map((droppedNode) => (
        <div
          key={droppedNode.id}
          className={cn(
            "absolute p-3 rounded-lg border-2 shadow-md min-w-[180px]",
            categoryBgColors[droppedNode.node.category]
          )}
          style={{
            left: droppedNode.x,
            top: droppedNode.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "p-1.5 rounded bg-white/50",
                categoryIconColors[droppedNode.node.category]
              )}
            >
              <NodeIcon name={droppedNode.node.icon} className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm text-foreground">
              {droppedNode.node.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
