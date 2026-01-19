import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getServerUser, syncUserToDatabase } from "@/lib/auth";
import { AcceptInviteButton } from "./accept-invite-button";

export const dynamic = "force-dynamic";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const clerkUser = await getServerUser();

  const invitation = await db.invitation.findUnique({
    where: { token },
    include: {
      organization: true,
      invitedBy: true,
    },
  });

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Invalid Invitation
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            This invitation link is invalid or has been cancelled.
          </p>
        </div>
      </div>
    );
  }

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const isAccepted = invitation.status === "ACCEPTED";
  const isCancelled = invitation.status === "CANCELLED";

  if (isExpired || isAccepted || isCancelled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            {isExpired ? "Invitation Expired" : isAccepted ? "Already Accepted" : "Invitation Cancelled"}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {isExpired
              ? "This invitation has expired. Please request a new one."
              : isAccepted
              ? "This invitation has already been accepted."
              : "This invitation has been cancelled."}
          </p>
        </div>
      </div>
    );
  }

  const inviterName = invitation.invitedBy.firstName
    ? `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName ?? ""}`.trim()
    : invitation.invitedBy.email;

  // If user is logged in but email doesn't match
  if (clerkUser && clerkUser.email !== invitation.email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Wrong Account
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            This invitation was sent to{" "}
            <span className="font-medium">{invitation.email}</span>. You are
            currently signed in as{" "}
            <span className="font-medium">{clerkUser.email}</span>.
          </p>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Please sign out and sign in with the correct account, or ask for a
            new invitation.
          </p>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to sign up
  if (!clerkUser) {
    redirect(`/sign-up?redirect_url=/invite/${token}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          {invitation.organization.imageUrl ? (
            <img
              src={invitation.organization.imageUrl}
              alt={invitation.organization.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <span className="text-2xl font-medium text-zinc-600 dark:text-zinc-400">
                {invitation.organization.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
              Join {invitation.organization.name}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              @{invitation.organization.slug}
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">{inviterName}</span> has invited you to
          join <span className="font-medium">{invitation.organization.name}</span>{" "}
          as a <span className="font-medium">{invitation.role.toLowerCase()}</span>.
        </p>

        <div className="mt-6">
          <AcceptInviteButton token={token} orgName={invitation.organization.name} />
        </div>
      </div>
    </div>
  );
}
