import { NextRequest, NextResponse } from "next/server";
import { SendGridClient, SendGridError } from "@/integrations/sendgrid";
import type { Template } from "@/integrations/sendgrid";

export interface TemplateResponse {
  success: boolean;
  template?: Template;
  error?: string;
}

export interface DeleteTemplateResponse {
  success: boolean;
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
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
): Promise<NextResponse<TemplateResponse>> {
  try {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required in Authorization header" },
        { status: 401 }
      );
    }

    const { templateId } = await params;
    const client = new SendGridClient({ apiKey });
    const template = await client.getTemplate(templateId);

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
        error: error instanceof Error ? error.message : "Failed to fetch template",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
): Promise<NextResponse<TemplateResponse>> {
  try {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required in Authorization header" },
        { status: 401 }
      );
    }

    const { templateId } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Template name is required" },
        { status: 400 }
      );
    }

    const client = new SendGridClient({ apiKey });
    const template = await client.updateTemplate(templateId, { name });

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
        error: error instanceof Error ? error.message : "Failed to update template",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
): Promise<NextResponse<DeleteTemplateResponse>> {
  try {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required in Authorization header" },
        { status: 401 }
      );
    }

    const { templateId } = await params;
    const client = new SendGridClient({ apiKey });
    await client.deleteTemplate(templateId);

    return NextResponse.json({
      success: true,
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
        error: error instanceof Error ? error.message : "Failed to delete template",
      },
      { status: 500 }
    );
  }
}
