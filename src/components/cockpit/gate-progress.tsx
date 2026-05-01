"use client";

import type { GateResult } from "@/types/merge-queue";

const gateStatusStyles: Record<string, { bg: string; text: string; icon: string }> = {
  pending: { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-500 dark:text-zinc-400", icon: "○" },
  running: { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-700 dark:text-blue-300", icon: "◑" },
  passed: { bg: "bg-green-100 dark:bg-green-900", text: "text-green-700 dark:text-green-300", icon: "●" },
  failed: { bg: "bg-red-100 dark:bg-red-900", text: "text-red-700 dark:text-red-300", icon: "✕" },
  skipped: { bg: "bg-zinc-50 dark:bg-zinc-900", text: "text-zinc-400 dark:text-zinc-500", icon: "–" },
};

interface GateProgressProps {
  gates: GateResult[];
  compact?: boolean;
}

export function GateProgress({ gates, compact = false }: GateProgressProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {gates.map((gate) => {
          const style = gateStatusStyles[gate.status];
          return (
            <span
              key={gate.name}
              className={`inline-flex h-5 w-5 items-center justify-center rounded text-xs font-medium ${style.bg} ${style.text}`}
              title={`${gate.name}: ${gate.status}`}
            >
              {style.icon}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {gates.map((gate) => {
        const style = gateStatusStyles[gate.status];
        return (
          <div
            key={gate.name}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}
          >
            <span>{style.icon}</span>
            <span>{gate.name}</span>
          </div>
        );
      })}
    </div>
  );
}
