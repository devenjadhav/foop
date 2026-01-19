import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserWithOrgs, isOrgAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ orgId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgId } = await params;
    const user = await getCurrentUserWithOrgs();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await isOrgAdmin(user.id, orgId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const organization = await db.organization.update({
      where: { id: orgId },
      data: { name },
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Failed to update organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgId } = await params;
    const user = await getCurrentUserWithOrgs();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await isOrgAdmin(user.id, orgId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.organization.delete({ where: { id: orgId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}
