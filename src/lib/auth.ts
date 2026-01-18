import { auth, currentUser } from "@clerk/nextjs/server";

function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return !!key && key.startsWith("pk_") && !key.includes("your_");
}

export async function getServerAuth() {
  if (!isClerkConfigured()) {
    return { userId: null, sessionId: null, isAuthenticated: false };
  }
  const { userId, sessionId } = await auth();
  return { userId, sessionId, isAuthenticated: !!userId };
}

export async function getServerUser() {
  if (!isClerkConfigured()) {
    return null;
  }
  const user = await currentUser();
  if (!user) return null;

  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress,
    fullName: user.fullName,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    createdAt: user.createdAt,
  };
}

export async function requireServerAuth() {
  if (!isClerkConfigured()) {
    throw new Error("Clerk is not configured");
  }
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export { isClerkConfigured };
