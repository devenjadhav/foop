import { redirect } from "next/navigation";
import { getServerUser, getCurrentUserWithOrgs } from "@/lib/auth";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const clerkUser = await getServerUser();
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const dbUser = await getCurrentUserWithOrgs();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Profile
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Personal Information
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Update your personal details here
            </p>

            <ProfileForm
              user={{
                id: dbUser?.id ?? "",
                email: clerkUser.email,
                firstName: clerkUser.firstName ?? "",
                lastName: clerkUser.lastName ?? "",
                imageUrl: clerkUser.imageUrl ?? "",
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Profile Picture
            </h2>
            <div className="mt-4 flex flex-col items-center">
              {clerkUser.imageUrl ? (
                <img
                  src={clerkUser.imageUrl}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <span className="text-2xl font-medium text-zinc-600 dark:text-zinc-400">
                    {clerkUser.firstName?.charAt(0) ?? clerkUser.email.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
                Profile picture is managed through Clerk
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Organizations
            </h2>
            <div className="mt-4 space-y-3">
              {dbUser?.memberships && dbUser.memberships.length > 0 ? (
                dbUser.memberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          {membership.organization.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">
                        {membership.organization.name}
                      </span>
                    </div>
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {membership.role}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  No organizations yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
