import Link from "next/link";
import { mockCostSummary } from "@/lib/mock-costs";

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CostsPage() {
  const { dailyReports, totalAmount, totalSessions, periodStart, periodEnd } =
    mockCostSummary;

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
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Workflows
              </Link>
              <Link
                href="/costs"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Costs
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Cost Report
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {formatDate(periodStart)} &mdash; {formatDate(periodEnd)}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total Cost (7 days)
            </p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total Sessions
            </p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {totalSessions.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Avg Cost / Session
            </p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(totalAmount / totalSessions)}
            </p>
          </div>
        </div>

        {/* Daily Breakdown Table */}
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Daily Breakdown
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Sessions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Boot
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Mayor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {dailyReports.map((report) => {
                  const bootEntry = report.entries.find(
                    (e) => e.role === "boot"
                  );
                  const mayorEntry = report.entries.find(
                    (e) => e.role === "mayor"
                  );
                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {formatDate(report.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400 text-right">
                        {report.totalSessions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100 text-right">
                        {formatCurrency(report.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400 text-right">
                        {bootEntry ? formatCurrency(bootEntry.amount) : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400 text-right">
                        {mayorEntry ? formatCurrency(mayorEntry.amount) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-zinc-50 dark:bg-zinc-900">
                <tr className="font-semibold">
                  <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">
                    Total
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100 text-right">
                    {totalSessions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100 text-right">
                    {formatCurrency(totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 text-right">
                    {formatCurrency(
                      dailyReports.reduce(
                        (sum, r) =>
                          sum +
                          (r.entries.find((e) => e.role === "boot")?.amount ??
                            0),
                        0
                      )
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 text-right">
                    {formatCurrency(
                      dailyReports.reduce(
                        (sum, r) =>
                          sum +
                          (r.entries.find((e) => e.role === "mayor")?.amount ??
                            0),
                        0
                      )
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-4">
              Cost by Role (Latest Day)
            </h3>
            {dailyReports[0].entries.map((entry) => {
              const percentage = (entry.amount / dailyReports[0].totalAmount) * 100;
              return (
                <div key={entry.role} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                      {entry.role}
                    </span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {formatCurrency(entry.amount)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 rounded-full h-2 dark:bg-zinc-700">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-4">
              Sessions by Role (Latest Day)
            </h3>
            {dailyReports[0].entries.map((entry) => {
              const percentage =
                (entry.sessions / dailyReports[0].totalSessions) * 100;
              return (
                <div key={entry.role} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                      {entry.role}
                    </span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {entry.sessions} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 rounded-full h-2 dark:bg-zinc-700">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
