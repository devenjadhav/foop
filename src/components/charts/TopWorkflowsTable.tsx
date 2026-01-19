"use client";

const workflows = [
  { name: "Email Campaign Automation", runs: 342, successRate: 98.2, avgTime: "2.3s" },
  { name: "Data Sync Pipeline", runs: 256, successRate: 94.5, avgTime: "5.8s" },
  { name: "Report Generator", runs: 189, successRate: 99.1, avgTime: "12.4s" },
  { name: "User Onboarding Flow", runs: 145, successRate: 96.8, avgTime: "3.1s" },
  { name: "Inventory Update", runs: 98, successRate: 91.2, avgTime: "8.7s" },
];

export function TopWorkflowsTable() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Top Workflows
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="pb-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Workflow
              </th>
              <th className="pb-3 text-right text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Runs
              </th>
              <th className="pb-3 text-right text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Success Rate
              </th>
              <th className="pb-3 text-right text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Avg Time
              </th>
            </tr>
          </thead>
          <tbody>
            {workflows.map((workflow, index) => (
              <tr
                key={index}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
              >
                <td className="py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {workflow.name}
                </td>
                <td className="py-3 text-right text-sm text-zinc-600 dark:text-zinc-400">
                  {workflow.runs.toLocaleString()}
                </td>
                <td className="py-3 text-right text-sm">
                  <span
                    className={`${
                      workflow.successRate >= 95
                        ? "text-green-500"
                        : workflow.successRate >= 90
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {workflow.successRate}%
                  </span>
                </td>
                <td className="py-3 text-right text-sm text-zinc-600 dark:text-zinc-400">
                  {workflow.avgTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
