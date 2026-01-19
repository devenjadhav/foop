"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NodeCategory } from "./node-category";
import { NODE_TYPES, NODE_CATEGORIES, type NodeType } from "@/types/nodes";

interface NodePaletteProps {
  className?: string;
}

export function NodePalette({ className }: NodePaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) {
      return NODE_TYPES;
    }
    const query = searchQuery.toLowerCase();
    return NODE_TYPES.filter(
      (node) =>
        node.name.toLowerCase().includes(query) ||
        node.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const nodesByCategory = useMemo(() => {
    return NODE_CATEGORIES.map((category) => ({
      category,
      nodes: filteredNodes.filter((node) => node.category === category.id),
    }));
  }, [filteredNodes]);

  const hasResults = filteredNodes.length > 0;

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border-r border-border",
        className
      )}
    >
      <div className="flex-shrink-0 p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Nodes</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {hasResults ? (
          nodesByCategory.map(({ category, nodes }) => (
            <NodeCategory
              key={category.id}
              category={category}
              nodes={nodes}
              defaultOpen={!searchQuery || nodes.length > 0}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No nodes found for &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 p-4 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Drag nodes to the canvas to build your workflow
        </p>
      </div>
    </div>
  );
}
