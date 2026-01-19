import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserWithOrgs } from "@/lib/auth";

export default async function OrganizationsPage() {
  const user = await getCurrentUserWithOrgs();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Organizations
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Manage your organizations and teams
          </p>
        </div>
        <Link
          href="/dashboard/organizations/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Create Organization
        </Link>
      </div>

      {user.memberships.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {user.memberships.map((membership) => (
            <Link
              key={membership.id}
              href={`/dashboard/organizations/${membership.organization.id}`}
              className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-4">
                {membership.organization.imageUrl ? (
                  <img
                    src={membership.organization.imageUrl}
                    alt={membership.organization.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <span className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
                      {membership.organization.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-zinc-900 truncate dark:text-white">
                    {membership.organization.name}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    @{membership.organization.slug}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {membership.role}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  Joined {new Date(membership.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
            No organizations yet
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Get started by creating your first organization
          </p>
          <Link
            href="/dashboard/organizations/new"
            className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            Create Organization
          </Link>
        </div>
      )}
    </div>
  );
}
