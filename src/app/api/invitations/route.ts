import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserWithOrgs, isOrgAdmin } from "@/lib/auth";
import { Role } from "@/generated/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithOrgs();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, role, organizationId } = body;

    if (!email || !role || !organizationId) {
      return NextResponse.json(
        { error: "Email, role, and organizationId are required" },
        { status: 400 }
      );
    }

    if (!Object.values(Role).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user is admin of the organization
    const isAdmin = await isOrgAdmin(user.id, organizationId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user is already a member
    const existingMember = await db.membership.findFirst({
      where: {
        organizationId,
        user: { email },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation
    const existingInvitation = await db.invitation.findFirst({
      where: {
        email,
        organizationId,
        status: "PENDING",
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 }
      );
    }

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await db.invitation.create({
      data: {
        email,
        role,
        organizationId,
        invitedById: user.id,
        expiresAt,
      },
      include: {
        organization: true,
        invitedBy: true,
      },
    });

    // In a real app, you would send an email here
    // For now, just return the invitation with the token
    const inviteUrl = `/invite/${invitation.token}`;

    return NextResponse.json({ ...invitation, inviteUrl }, { status: 201 });
  } catch (error) {
    console.error("Failed to create invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
