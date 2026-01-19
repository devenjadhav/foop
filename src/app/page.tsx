import { WorkflowRunsChart } from "@/components/charts/WorkflowRunsChart";
import { SuccessRatePieChart } from "@/components/charts/SuccessRatePieChart";
import { TopWorkflowsTable } from "@/components/charts/TopWorkflowsTable";
import { ExecutionTimeHistogram } from "@/components/charts/ExecutionTimeHistogram";

export default function AnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Monitor your workflow performance and execution metrics
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Runs" value="1,247" change="+12.5%" positive />
          <StatCard title="Success Rate" value="87.3%" change="+2.1%" positive />
          <StatCard title="Avg Execution" value="4.2s" change="-0.8s" positive />
          <StatCard title="Active Workflows" value="24" change="+3" positive />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <WorkflowRunsChart />
          <SuccessRatePieChart />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TopWorkflowsTable />
          <ExecutionTimeHistogram />
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  positive,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
      <p
        className={`mt-1 text-sm ${
          positive ? "text-green-500" : "text-red-500"
        }`}
      >
        {change} from last period
      </p>
    </div>
  );
}
