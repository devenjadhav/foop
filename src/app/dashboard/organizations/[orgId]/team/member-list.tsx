"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/types";

interface Member {
  id: string;
  role: Role;
  userId: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    imageUrl: string | null;
  };
}

interface MemberListProps {
  members: Member[];
  orgId: string;
  currentUserId: string;
  currentUserRole: Role;
  canManage: boolean;
}

export function MemberList({
  members,
  orgId,
  currentUserId,
  currentUserRole,
  canManage,
}: MemberListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    setLoadingId(memberId);
    setError(null);

    try {
      const response = await fetch(`/api/organizations/${orgId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update role");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    setLoadingId(memberId);
    setError(null);

    try {
      const response = await fetch(`/api/organizations/${orgId}/members/${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove member");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {members.map((member) => {
          const isCurrentUser = member.userId === currentUserId;
          const displayName = member.user.firstName
            ? `${member.user.firstName} ${member.user.lastName ?? ""}`.trim()
            : member.user.email;

          return (
            <div
              key={member.id}
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                {member.user.imageUrl ? (
                  <img
                    src={member.user.imageUrl}
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {displayName}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-zinc-500">(you)</span>
                    )}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    {member.user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {canManage && !isCurrentUser ? (
                  <>
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                      disabled={loadingId === member.id}
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    >
                      <option value={Role.ADMIN}>Admin</option>
                      <option value={Role.MEMBER}>Member</option>
                      <option value={Role.VIEWER}>Viewer</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={loadingId === member.id}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {member.role}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
