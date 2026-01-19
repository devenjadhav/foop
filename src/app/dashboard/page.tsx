import Link from "next/link";
import { getCurrentUserWithOrgs } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUserWithOrgs();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/profile"
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Profile
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            View and edit your profile settings
          </p>
        </Link>

        <Link
          href="/dashboard/organizations"
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Organizations
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Manage your organizations and teams
          </p>
        </Link>

        <Link
          href="/dashboard/organizations/new"
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Create Organization
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Start a new organization and invite your team
          </p>
        </Link>
      </div>

      {user?.memberships && user.memberships.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Your Organizations
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {user.memberships.map((membership) => (
              <Link
                key={membership.id}
                href={`/dashboard/organizations/${membership.organization.id}`}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {membership.organization.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white">
                      {membership.organization.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                      {membership.role}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
