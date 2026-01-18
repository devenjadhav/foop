import { auth, currentUser } from "@clerk/nextjs/server";

export async function getServerAuth() {
  const { userId, sessionId } = await auth();
  return { userId, sessionId, isAuthenticated: !!userId };
}

export async function getServerUser() {
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
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}
