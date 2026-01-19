"use client";

import { useState } from "react";

interface WorkflowToggleProps {
  workflowId: string;
  initialEnabled: boolean;
}

export function WorkflowToggle({ workflowId, initialEnabled }: WorkflowToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    setEnabled(!enabled);
    setIsLoading(false);
    console.log(`Workflow ${workflowId} ${!enabled ? "enabled" : "disabled"}`);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        {enabled ? "Enabled" : "Disabled"}
      </span>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
          enabled ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-600"
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
