import { NextResponse } from "next/server";
import { testWebhook } from "@/lib/webhooks";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = testWebhook(id);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: "Failed to test webhook" },
      { status: 500 }
    );
  }
}
