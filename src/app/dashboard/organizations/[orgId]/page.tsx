import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUserWithOrgs, getUserRole } from "@/lib/auth";
import { Role } from "@/generated/prisma";

interface OrgPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function OrganizationPage({ params }: OrgPageProps) {
  const { orgId } = await params;
  const user = await getCurrentUserWithOrgs();
  if (!user) {
    redirect("/sign-in");
  }

  const organization = await db.organization.findUnique({
    where: { id: orgId },
    include: {
      memberships: {
        include: {
          user: true,
        },
      },
      invitations: {
        where: { status: "PENDING" },
      },
    },
  });

  if (!organization) {
    notFound();
  }

  const userRole = await getUserRole(user.id, orgId);
  if (!userRole) {
    notFound();
  }

  const isAdmin = userRole === Role.ADMIN;
  const memberCount = organization.memberships.length;
  const pendingInvites = organization.invitations.length;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {organization.imageUrl ? (
            <img
              src={organization.imageUrl}
              alt={organization.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <span className="text-2xl font-medium text-zinc-600 dark:text-zinc-400">
                {organization.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {organization.name}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              @{organization.slug}
            </p>
          </div>
        </div>
        {isAdmin && (
          <Link
            href={`/dashboard/organizations/${orgId}/settings`}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Settings
          </Link>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">Members</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">
            {memberCount}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Pending Invites
          </p>
          <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">
            {pendingInvites}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">Your Role</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">
            {userRole}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">Created</p>
          <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
            {new Date(organization.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Link
          href={`/dashboard/organizations/${orgId}/team`}
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Team Management
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            View team members, manage roles, and invite new members
          </p>
          <div className="mt-4 flex -space-x-2">
            {organization.memberships.slice(0, 5).map((membership) => (
              <div
                key={membership.id}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-zinc-100 dark:border-zinc-900 dark:bg-zinc-800"
              >
                {membership.user.imageUrl ? (
                  <img
                    src={membership.user.imageUrl}
                    alt={membership.user.firstName ?? ""}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {(membership.user.firstName ?? membership.user.email).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            ))}
            {organization.memberships.length > 5 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-zinc-200 dark:border-zinc-900 dark:bg-zinc-700">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  +{organization.memberships.length - 5}
                </span>
              </div>
            )}
          </div>
        </Link>

        {isAdmin && (
          <Link
            href={`/dashboard/organizations/${orgId}/settings`}
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Organization Settings
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Update organization details and manage settings
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
