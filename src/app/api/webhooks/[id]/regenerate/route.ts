import { NextResponse } from "next/server";
import { regenerateSecret } from "@/lib/webhooks";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const webhook = regenerateSecret(id);

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    return NextResponse.json({ secret: webhook.secret });
  } catch {
    return NextResponse.json(
      { error: "Failed to regenerate secret" },
      { status: 500 }
    );
  }
}
