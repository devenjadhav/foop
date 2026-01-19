import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUserWithOrgs, isOrgAdmin } from "@/lib/auth";
import { OrgSettingsForm } from "./org-settings-form";
import { DeleteOrgButton } from "./delete-org-button";

interface SettingsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function OrganizationSettingsPage({ params }: SettingsPageProps) {
  const { orgId } = await params;
  const user = await getCurrentUserWithOrgs();
  if (!user) {
    redirect("/sign-in");
  }

  const organization = await db.organization.findUnique({
    where: { id: orgId },
  });

  if (!organization) {
    notFound();
  }

  const isAdmin = await isOrgAdmin(user.id, orgId);
  if (!isAdmin) {
    redirect(`/dashboard/organizations/${orgId}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Organization Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Manage your organization settings and details
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          General Settings
        </h2>
        <OrgSettingsForm
          organization={{
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
          }}
        />
      </div>

      <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm dark:border-red-900 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
          Danger Zone
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Permanently delete this organization and all of its data. This action
          cannot be undone.
        </p>
        <div className="mt-4">
          <DeleteOrgButton orgId={orgId} orgName={organization.name} />
        </div>
      </div>
    </div>
  );
}
