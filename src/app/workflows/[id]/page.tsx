import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkflowById } from "@/lib/mock-data";
import { WorkflowMetadata } from "@/components/workflows/workflow-metadata";
import { WorkflowVersionHistory } from "@/components/workflows/workflow-version-history";
import { WorkflowRunHistory } from "@/components/workflows/workflow-run-history";
import { WorkflowToggle } from "@/components/workflows/workflow-toggle";

interface WorkflowDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkflowDetailPage({ params }: WorkflowDetailPageProps) {
  const { id } = await params;
  const workflow = getWorkflowById(id);

  if (!workflow) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/workflows"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                &larr; Back to Workflows
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{workflow.name}</h1>
            {workflow.description && (
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">{workflow.description}</p>
            )}
          </div>
          <WorkflowToggle workflowId={workflow.id} initialEnabled={workflow.enabled} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <WorkflowMetadata workflow={workflow} />
          <WorkflowVersionHistory
            versions={workflow.versions}
            currentVersion={workflow.currentVersion}
          />
        </div>

        <div className="mt-6">
          <WorkflowRunHistory runs={workflow.runs} />
        </div>
      </main>
    </div>
  );
}
