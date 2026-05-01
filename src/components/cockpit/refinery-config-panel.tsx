"use client";

import type { RefineryConfig } from "@/types/merge-queue";

interface RefineryConfigPanelProps {
  config: RefineryConfig;
}

export function RefineryConfigPanel({ config }: RefineryConfigPanelProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Refinery Configuration
        </h3>
      </div>
      <div className="px-6 py-4">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Max Concurrent</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">{config.maxConcurrent}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Gate Timeout</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">
              {Math.floor(config.gateTimeout / 60000)}m
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Max Retries</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">
              {config.retryPolicy.maxRetries}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Retry Backoff</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">
              {config.retryPolicy.backoffMs / 1000}s
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Auto Rebase</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">
              {config.autoRebase ? "Enabled" : "Disabled"}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Bisect on Failure</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">
              {config.bisectOnFailure ? "Enabled" : "Disabled"}
            </dd>
          </div>
        </dl>
        <div className="mt-4">
          <dt className="text-sm text-zinc-500 dark:text-zinc-400">Gates</dt>
          <dd className="mt-1.5 flex flex-wrap gap-1.5">
            {config.gates.map((gate) => (
              <span
                key={gate}
                className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
              >
                {gate}
              </span>
            ))}
          </dd>
        </div>
      </div>
    </div>
  );
}
