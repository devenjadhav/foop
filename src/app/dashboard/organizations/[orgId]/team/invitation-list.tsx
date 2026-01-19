"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/types";

interface Invitation {
  id: string;
  email: string;
  role: Role;
  expiresAt: string;
  invitedBy: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface InvitationListProps {
  invitations: Invitation[];
  orgId: string;
  canManage: boolean;
}

export function InvitationList({ invitations, orgId, canManage }: InvitationListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCancelInvitation = async (invitationId: string) => {
    setLoadingId(invitationId);
    setError(null);

    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel invitation");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel invitation");
    } finally {
      setLoadingId(null);
    }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div className="mt-4 space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {invitations.map((invitation) => {
          const inviterName = invitation.invitedBy.firstName
            ? `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName ?? ""}`.trim()
            : invitation.invitedBy.email;
          const expired = isExpired(invitation.expiresAt);

          return (
            <div
              key={invitation.id}
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {invitation.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {invitation.email}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    Invited by {inviterName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {invitation.role}
                </span>
                {expired ? (
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    Expired
                  </span>
                ) : (
                  <span className="text-xs text-zinc-500 dark:text-zinc-500">
                    Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                  </span>
                )}
                {canManage && (
                  <button
                    onClick={() => handleCancelInvitation(invitation.id)}
                    disabled={loadingId === invitation.id}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
