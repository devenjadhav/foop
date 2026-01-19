import type { WorkflowRun } from "@/types/workflow";
import { formatDateTime, formatDuration } from "@/lib/utils";

interface WorkflowRunHistoryProps {
  runs: WorkflowRun[];
}

const statusConfig = {
  success: {
    label: "Success",
    className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
  running: {
    label: "Running",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
};

export function WorkflowRunHistory({ runs }: WorkflowRunHistoryProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold mb-4">Run History</h2>
      {runs.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No runs yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="text-left py-2 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                <th className="text-left py-2 font-medium text-zinc-500 dark:text-zinc-400">Started</th>
                <th className="text-left py-2 font-medium text-zinc-500 dark:text-zinc-400">Duration</th>
                <th className="text-left py-2 font-medium text-zinc-500 dark:text-zinc-400">Triggered By</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusConfig[run.status].className
                      }`}
                    >
                      {statusConfig[run.status].label}
                    </span>
                    {run.errorMessage && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{run.errorMessage}</p>
                    )}
                  </td>
                  <td className="py-3">{formatDateTime(run.startedAt)}</td>
                  <td className="py-3">{formatDuration(run.startedAt, run.completedAt)}</td>
                  <td className="py-3 capitalize">{run.triggeredBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
