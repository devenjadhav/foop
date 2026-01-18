"use client";

import { ClerkProvider as BaseClerkProvider } from "@clerk/nextjs";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function isValidClerkKey(key: string | undefined): boolean {
  return !!key && key.startsWith("pk_") && !key.includes("your_");
}

export function ClerkProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isValidClerkKey(publishableKey)) {
    // Return children without Clerk wrapper when keys are not configured
    return <>{children}</>;
  }

  return <BaseClerkProvider>{children}</BaseClerkProvider>;
}
