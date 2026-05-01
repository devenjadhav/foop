"use client";

import type { MergeRequest } from "@/types/merge-queue";
import { GateProgress } from "./gate-progress";

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface MergeRequestDetailProps {
  mergeRequest: MergeRequest;
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
  onPromote?: (id: string) => void;
}

export function MergeRequestDetail({
  mergeRequest: mr,
  onRetry,
  onCancel,
  onPromote,
}: MergeRequestDetailProps) {
  const canRetry = mr.status === "failed" && mr.retryCount < mr.maxRetries;
  const canCancel = mr.status === "pending" || mr.status === "validating";
  const canPromote = mr.status === "pending" && mr.position > 0;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {mr.title}
            </h3>
            {mr.description && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {mr.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {canPromote && (
              <button
                onClick={() => onPromote?.(mr.id)}
                className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Promote
              </button>
            )}
            {canRetry && (
              <button
                onClick={() => onRetry?.(mr.id)}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                Retry ({mr.maxRetries - mr.retryCount} left)
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => onCancel?.(mr.id)}
                className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Submitted by</p>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{mr.submittedBy}</p>
          </div>
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Submitted at</p>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              {formatDateTime(mr.submittedAt)}
            </p>
          </div>
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Source branch</p>
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              {mr.sourceBranch}
            </code>
          </div>
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Target branch</p>
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              {mr.targetBranch}
            </code>
          </div>
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Commit</p>
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              {mr.commitSha}
            </code>
          </div>
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Base</p>
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              {mr.baseSha}
            </code>
          </div>
          {mr.retryCount > 0 && (
            <div>
              <p className="text-zinc-500 dark:text-zinc-400">Retries</p>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {mr.retryCount} / {mr.maxRetries}
              </p>
            </div>
          )}
          {mr.mergedAt && (
            <div>
              <p className="text-zinc-500 dark:text-zinc-400">Merged at</p>
              <p className="font-medium text-green-600 dark:text-green-400">
                {formatDateTime(mr.mergedAt)}
              </p>
            </div>
          )}
        </div>

        {mr.labels.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">Labels</p>
            <div className="flex flex-wrap gap-1.5">
              {mr.labels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Gate Results</p>
          <GateProgress gates={mr.gates} />
        </div>

        {mr.errorMessage && (
          <div className="mt-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Error</p>
            <p className="mt-1 text-xs text-red-700 dark:text-red-400 font-mono">
              {mr.errorMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
