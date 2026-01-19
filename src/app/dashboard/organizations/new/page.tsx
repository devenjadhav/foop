import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import { CreateOrgForm } from "./create-org-form";

export default async function NewOrganizationPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Create Organization
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Set up a new organization to collaborate with your team
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <CreateOrgForm />
      </div>
    </div>
  );
}
