import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerUser, syncUserToDatabase } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: token } = await params;
    const clerkUser = await getServerUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the invitation by token
    const invitation = await db.invitation.findUnique({
      where: { token },
      include: {
        organization: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Check invitation status
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: `Invitation is ${invitation.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date(invitation.expiresAt) < new Date()) {
      await db.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
    }

    // Check if email matches
    if (invitation.email !== clerkUser.email) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 400 }
      );
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

    // Check if user is already a member
    const existingMembership = await db.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: dbUser.id,
          organizationId: invitation.organizationId,
        },
      },
    });

    if (existingMembership) {
      // Mark invitation as accepted anyway
      await db.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });
      return NextResponse.json({
        message: "You are already a member of this organization",
        organizationId: invitation.organizationId,
      });
    }

    // Create membership and mark invitation as accepted
    await db.$transaction([
      db.membership.create({
        data: {
          userId: dbUser.id,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
      }),
      db.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      }),
    ]);

    return NextResponse.json({
      message: "Invitation accepted",
      organizationId: invitation.organizationId,
    });
  } catch (error) {
    console.error("Failed to accept invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
