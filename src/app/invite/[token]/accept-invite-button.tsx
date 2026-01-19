"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AcceptInviteButtonProps {
  token: string;
  orgName: string;
}

export function AcceptInviteButton({ token, orgName }: AcceptInviteButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to accept invitation");
      }

      const result = await response.json();
      router.push(`/dashboard/organizations/${result.organizationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        onClick={handleAccept}
        disabled={isLoading}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
      >
        {isLoading ? "Joining..." : `Join ${orgName}`}
      </button>

      <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
        By accepting this invitation, you agree to the organization&apos;s terms.
      </p>
    </div>
  );
}
