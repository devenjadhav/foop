import type { WorkflowVersion } from "@/types/workflow";
import { formatDateTime } from "@/lib/utils";

interface WorkflowVersionHistoryProps {
  versions: WorkflowVersion[];
  currentVersion: number;
}

export function WorkflowVersionHistory({ versions, currentVersion }: WorkflowVersionHistoryProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold mb-4">Version History</h2>
      <div className="space-y-4">
        {versions.map((version) => (
          <div
            key={version.id}
            className={`relative pl-6 pb-4 border-l-2 last:pb-0 ${
              version.version === currentVersion
                ? "border-blue-500"
                : "border-zinc-200 dark:border-zinc-700"
            }`}
          >
            <div
              className={`absolute left-[-5px] top-0 h-2 w-2 rounded-full ${
                version.version === currentVersion
                  ? "bg-blue-500"
                  : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            />
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">v{version.version}</span>
              {version.version === currentVersion && (
                <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded">
                  Current
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
              {version.changeDescription}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              {version.createdBy} &middot; {formatDateTime(version.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
