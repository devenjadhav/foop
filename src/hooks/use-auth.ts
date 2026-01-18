"use client";

import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";

export function useAuth() {
  const { isLoaded, isSignedIn, userId, sessionId, signOut } = useClerkAuth();
  const { user } = useUser();

  return {
    isLoaded,
    isSignedIn,
    userId,
    sessionId,
    user,
    signOut,
    email: user?.primaryEmailAddress?.emailAddress,
    fullName: user?.fullName,
    firstName: user?.firstName,
    lastName: user?.lastName,
    imageUrl: user?.imageUrl,
  };
}

export function useRequireAuth() {
  const auth = useAuth();

  if (!auth.isLoaded) {
    return { ...auth, isLoading: true };
  }

  if (!auth.isSignedIn) {
    return { ...auth, isLoading: false, isAuthenticated: false };
  }

  return { ...auth, isLoading: false, isAuthenticated: true };
}
