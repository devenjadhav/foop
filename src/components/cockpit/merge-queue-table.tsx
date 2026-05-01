"use client";

import type { MergeRequest } from "@/types/merge-queue";
import { GateProgress } from "./gate-progress";

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-700 dark:text-zinc-300", label: "Pending" },
  validating: { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-700 dark:text-blue-300", label: "Validating" },
  processing: { bg: "bg-indigo-100 dark:bg-indigo-900", text: "text-indigo-700 dark:text-indigo-300", label: "Processing" },
  merged: { bg: "bg-green-100 dark:bg-green-900", text: "text-green-700 dark:text-green-300", label: "Merged" },
  failed: { bg: "bg-red-100 dark:bg-red-900", text: "text-red-700 dark:text-red-300", label: "Failed" },
  cancelled: { bg: "bg-zinc-50 dark:bg-zinc-900", text: "text-zinc-400 dark:text-zinc-500", label: "Cancelled" },
};

const priorityStyles: Record<string, string> = {
  critical: "text-red-600 dark:text-red-400",
  high: "text-orange-600 dark:text-orange-400",
  normal: "text-zinc-600 dark:text-zinc-400",
  low: "text-zinc-400 dark:text-zinc-500",
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

interface MergeQueueTableProps {
  mergeRequests: MergeRequest[];
  onSelect?: (mr: MergeRequest) => void;
  selectedId?: string;
}

export function MergeQueueTable({ mergeRequests, onSelect, selectedId }: MergeQueueTableProps) {
  if (mergeRequests.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No merge requests in queue</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
        <thead className="bg-zinc-50 dark:bg-zinc-900/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Merge Request
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Gates
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Submitted
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Branch
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {mergeRequests.map((mr) => {
            const status = statusStyles[mr.status];
            return (
              <tr
                key={mr.id}
                onClick={() => onSelect?.(mr)}
                className={`cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                  selectedId === mr.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
              >
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={`text-xs font-medium ${priorityStyles[mr.priority]}`}>
                    {mr.priority === "critical" ? "!!" : mr.priority === "high" ? "!" : ""}
                    {mr.position < 99 ? mr.position + 1 : "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {mr.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {mr.submittedBy} &middot; {mr.commitSha.slice(0, 7)}
                    </p>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <GateProgress gates={mr.gates} compact />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <span title={mr.submittedAt.toISOString()}>
                    {formatRelativeTime(mr.submittedAt)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {mr.sourceBranch}
                  </code>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
