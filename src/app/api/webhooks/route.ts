import { NextResponse } from "next/server";
import { getWebhooks, createWebhook } from "@/lib/webhooks";

export async function GET() {
  const webhooks = getWebhooks();
  return NextResponse.json(webhooks);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, url, events } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: "Name and URL are required" },
        { status: 400 }
      );
    }

    const webhook = createWebhook({
      name,
      url,
      events: events || [],
    });

    return NextResponse.json(webhook, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create webhook" },
      { status: 500 }
    );
  }
}
