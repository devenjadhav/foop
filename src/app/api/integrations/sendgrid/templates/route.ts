import { NextRequest, NextResponse } from "next/server";
import { SendGridClient, SendGridError } from "@/integrations/sendgrid";
import type { Template } from "@/integrations/sendgrid";

export interface TemplatesResponse {
  success: boolean;
  templates?: Template[];
  error?: string;
}

export interface CreateTemplateResponse {
  success: boolean;
  template?: Template;
  error?: string;
}

function getApiKey(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<TemplatesResponse>> {
  try {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required in Authorization header" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sync = searchParams.get("sync") === "true";

    const client = new SendGridClient({ apiKey });

    let templates: Template[];
    if (sync) {
      templates = await client.syncTemplates();
    } else {
      const response = await client.getTemplates({
        generations: ["dynamic", "legacy"],
        pageSize: 50,
      });
      templates = response.result;
    }

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    if (error instanceof SendGridError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch templates",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CreateTemplateResponse>> {
  try {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required in Authorization header" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, generation } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Template name is required" },
        { status: 400 }
      );
    }

    const client = new SendGridClient({ apiKey });
    const template = await client.createTemplate({ name, generation });

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    if (error instanceof SendGridError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create template",
      },
      { status: 500 }
    );
  }
}
