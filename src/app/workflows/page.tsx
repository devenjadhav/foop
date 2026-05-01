import Link from "next/link";
import { mockWorkflow } from "@/lib/mock-data";

export default function WorkflowsPage() {
  const workflows = [mockWorkflow];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              Foop
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/workflows"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Workflows
              </Link>
              <Link
                href="/costs"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Costs
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Workflows</h1>
        <div className="grid gap-4">
          {workflows.map((workflow) => (
            <Link
              key={workflow.id}
              href={`/workflows/${workflow.id}`}
              className="block rounded-lg border border-zinc-200 bg-white p-6 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{workflow.name}</h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{workflow.description}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    workflow.enabled
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {workflow.enabled ? "Active" : "Inactive"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
