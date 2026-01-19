import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { Role } from "@/generated/prisma";

export function isClerkConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
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
    email: user.emailAddresses[0]?.emailAddress ?? "",
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    imageUrl: user.imageUrl,
  };
}

export async function requireServerAuth() {
  const { userId, isAuthenticated } = await getServerAuth();
  if (!isAuthenticated || !userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

// Sync Clerk user to database
export async function syncUserToDatabase(clerkUser: {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}) {
  return db.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email: clerkUser.email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      clerkId: clerkUser.id,
      email: clerkUser.email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
  });
}

// Get database user from Clerk ID
export async function getDbUser(clerkId: string) {
  return db.user.findUnique({
    where: { clerkId },
    include: {
      memberships: {
        include: {
          organization: true,
        },
      },
    },
  });
}

// Get current user with their organizations
export async function getCurrentUserWithOrgs() {
  const clerkUser = await getServerUser();
  if (!clerkUser) return null;

  const dbUser = await getDbUser(clerkUser.id);
  if (!dbUser) {
    // Auto-sync user to database on first access
    const newUser = await syncUserToDatabase({
      id: clerkUser.id,
      email: clerkUser.email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    });
    return {
      ...newUser,
      memberships: [],
    };
  }

  return dbUser;
}

// Check if user has a specific role in an organization
export async function hasRole(
  userId: string,
  organizationId: string,
  roles: Role[]
): Promise<boolean> {
  const membership = await db.membership.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  });

  return membership ? roles.includes(membership.role) : false;
}

// Check if user is admin of an organization
export async function isOrgAdmin(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return hasRole(userId, organizationId, [Role.ADMIN]);
}

// Check if user is member (admin or member) of an organization
export async function isOrgMember(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return hasRole(userId, organizationId, [Role.ADMIN, Role.MEMBER]);
}

// Check if user has any access to an organization
export async function hasOrgAccess(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return hasRole(userId, organizationId, [Role.ADMIN, Role.MEMBER, Role.VIEWER]);
}

// Get user's role in an organization
export async function getUserRole(
  userId: string,
  organizationId: string
): Promise<Role | null> {
  const membership = await db.membership.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  });

  return membership?.role ?? null;
}
