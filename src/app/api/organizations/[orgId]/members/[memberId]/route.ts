import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserWithOrgs, isOrgAdmin } from "@/lib/auth";
import { Role } from "@/generated/prisma";

interface RouteParams {
  params: Promise<{ orgId: string; memberId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgId, memberId } = await params;
    const user = await getCurrentUserWithOrgs();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await isOrgAdmin(user.id, orgId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !Object.values(Role).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Get the membership
    const membership = await db.membership.findUnique({
      where: { id: memberId },
    });

    if (!membership || membership.organizationId !== orgId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Prevent removing the last admin
    if (membership.role === Role.ADMIN && role !== Role.ADMIN) {
      const adminCount = await db.membership.count({
        where: { organizationId: orgId, role: Role.ADMIN },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last admin" },
          { status: 400 }
        );
      }
    }

    const updated = await db.membership.update({
      where: { id: memberId },
      data: { role },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgId, memberId } = await params;
    const user = await getCurrentUserWithOrgs();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await isOrgAdmin(user.id, orgId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the membership
    const membership = await db.membership.findUnique({
      where: { id: memberId },
    });

    if (!membership || membership.organizationId !== orgId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Prevent removing yourself
    if (membership.userId === user.id) {
      return NextResponse.json(
        { error: "You cannot remove yourself" },
        { status: 400 }
      );
    }

    // Prevent removing the last admin
    if (membership.role === Role.ADMIN) {
      const adminCount = await db.membership.count({
        where: { organizationId: orgId, role: Role.ADMIN },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last admin" },
          { status: 400 }
        );
      }
    }

    await db.membership.delete({ where: { id: memberId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
