import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Here&apos;s what&apos;s happening with your automations today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Active Automations
          </h3>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            0
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Tasks Completed
          </h3>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            0
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Time Saved
          </h3>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            0h
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Getting Started
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Create your first automation to start saving time on repetitive tasks.
        </p>
        <button className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          Create Automation
        </button>
      </div>
    </div>
  );
}
