"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { NodeIcon } from "./node-icon";
import type { NodeType, NodeCategory } from "@/types/nodes";

interface NodeItemProps {
  node: NodeType;
}

const categoryColors: Record<NodeCategory, string> = {
  triggers: "border-l-green-500 hover:bg-green-50",
  actions: "border-l-blue-500 hover:bg-blue-50",
  logic: "border-l-purple-500 hover:bg-purple-50",
};

const categoryIconColors: Record<NodeCategory, string> = {
  triggers: "text-green-600",
  actions: "text-blue-600",
  logic: "text-purple-600",
};

export function NodeItem({ node }: NodeItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: node.id,
      data: {
        type: "node",
        node,
      },
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-3 p-3 bg-white border border-l-4 rounded-lg cursor-grab active:cursor-grabbing transition-all",
        categoryColors[node.category],
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary"
      )}
    >
      <div className="flex-shrink-0 text-muted-foreground">
        <GripVertical className="h-4 w-4" />
      </div>
      <div
        className={cn(
          "flex-shrink-0 p-2 rounded-md bg-muted",
          categoryIconColors[node.category]
        )}
      >
        <NodeIcon name={node.icon} className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground truncate">
          {node.name}
        </h4>
        <p className="text-xs text-muted-foreground truncate">
          {node.description}
        </p>
      </div>
    </div>
  );
}
