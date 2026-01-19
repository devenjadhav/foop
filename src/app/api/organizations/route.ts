import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserWithOrgs, syncUserToDatabase, getServerUser } from "@/lib/auth";
import { Role } from "@/generated/prisma";

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await getServerUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in database
    let dbUser = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!dbUser) {
      dbUser = await syncUserToDatabase({
        id: clerkUser.id,
        email: clerkUser.email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      });
    }

    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const existing = await db.organization.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "This URL slug is already taken" },
        { status: 400 }
      );
    }

    // Create organization and add user as admin
    const organization = await db.organization.create({
      data: {
        name,
        slug,
        memberships: {
          create: {
            userId: dbUser.id,
            role: Role.ADMIN,
          },
        },
      },
      include: {
        memberships: true,
      },
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error("Failed to create organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
