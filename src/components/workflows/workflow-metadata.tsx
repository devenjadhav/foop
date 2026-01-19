import type { Workflow } from "@/types/workflow";
import { formatDate, formatDateTime } from "@/lib/utils";

interface WorkflowMetadataProps {
  workflow: Workflow;
}

export function WorkflowMetadata({ workflow }: WorkflowMetadataProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold mb-4">Metadata</h2>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">ID</dt>
          <dd className="font-mono">{workflow.id}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
          <dd>
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                workflow.status === "active"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : workflow.status === "inactive"
                  ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
              }`}
            >
              {workflow.status}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Trigger Type</dt>
          <dd className="capitalize">{workflow.triggerType}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Current Version</dt>
          <dd>v{workflow.currentVersion}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Created</dt>
          <dd>{formatDate(workflow.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Last Updated</dt>
          <dd>{formatDate(workflow.updatedAt)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Last Run</dt>
          <dd>{workflow.lastRunAt ? formatDateTime(workflow.lastRunAt) : "Never"}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Tags</dt>
          <dd className="flex gap-1 flex-wrap">
            {workflow.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800"
              >
                {tag}
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </div>
  );
}
