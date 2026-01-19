import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUserWithOrgs, getUserRole, isOrgAdmin } from "@/lib/auth";
import { Role } from "@/generated/prisma";
import { InviteForm } from "./invite-form";
import { MemberList } from "./member-list";
import { InvitationList } from "./invitation-list";

interface TeamPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { orgId } = await params;
  const user = await getCurrentUserWithOrgs();
  if (!user) {
    redirect("/sign-in");
  }

  const userRole = await getUserRole(user.id, orgId);
  if (!userRole) {
    notFound();
  }

  const organization = await db.organization.findUnique({
    where: { id: orgId },
    include: {
      memberships: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      invitations: {
        where: { status: "PENDING" },
        include: {
          invitedBy: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!organization) {
    notFound();
  }

  const isAdmin = userRole === Role.ADMIN;
  const canManageMembers = isAdmin || userRole === Role.MEMBER;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Team - {organization.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Manage your team members and invitations
        </p>
      </div>

      {isAdmin && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Invite Team Members
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Send invitations to new team members
          </p>
          <InviteForm orgId={orgId} />
        </div>
      )}

      {organization.invitations.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Pending Invitations
          </h2>
          <InvitationList
            invitations={organization.invitations.map((inv) => ({
              id: inv.id,
              email: inv.email,
              role: inv.role,
              expiresAt: inv.expiresAt.toISOString(),
              invitedBy: {
                firstName: inv.invitedBy.firstName,
                lastName: inv.invitedBy.lastName,
                email: inv.invitedBy.email,
              },
            }))}
            orgId={orgId}
            canManage={isAdmin}
          />
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Team Members ({organization.memberships.length})
        </h2>
        <MemberList
          members={organization.memberships.map((m) => ({
            id: m.id,
            role: m.role,
            userId: m.user.id,
            user: {
              id: m.user.id,
              firstName: m.user.firstName,
              lastName: m.user.lastName,
              email: m.user.email,
              imageUrl: m.user.imageUrl,
            },
          }))}
          orgId={orgId}
          currentUserId={user.id}
          currentUserRole={userRole}
          canManage={isAdmin}
        />
      </div>
    </div>
  );
}
