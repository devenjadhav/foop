"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NodeItem } from "./node-item";
import type { NodeType, NodeCategoryInfo } from "@/types/nodes";

interface NodeCategoryProps {
  category: NodeCategoryInfo;
  nodes: NodeType[];
  defaultOpen?: boolean;
}

export function NodeCategory({
  category,
  nodes,
  defaultOpen = true,
}: NodeCategoryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (nodes.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={cn("font-semibold text-sm", category.color)}>
            {category.name}
          </span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {nodes.length}
          </span>
        </div>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-2">
          {nodes.map((node) => (
            <NodeItem key={node.id} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}
