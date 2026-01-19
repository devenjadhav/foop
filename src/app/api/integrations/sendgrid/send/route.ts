import { NextRequest, NextResponse } from "next/server";
import { SendGridClient, SendGridError } from "@/integrations/sendgrid";
import type { EmailAddress } from "@/integrations/sendgrid";

export interface SendEmailRequestBody {
  apiKey: string;
  to: string | string[] | EmailAddress | EmailAddress[];
  from: string | EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, unknown>;
  categories?: string[];
  replyTo?: string | EmailAddress;
  sendAt?: number;
  sandboxMode?: boolean;
}

export interface SendEmailResponseBody {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SendEmailResponseBody>> {
  try {
    const body: SendEmailRequestBody = await request.json();

    const {
      apiKey,
      to,
      from,
      subject,
      html,
      text,
      templateId,
      dynamicTemplateData,
      categories,
      replyTo,
      sendAt,
      sandboxMode,
    } = body;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required" },
        { status: 400 }
      );
    }

    if (!to || !from) {
      return NextResponse.json(
        { success: false, error: "To and from addresses are required" },
        { status: 400 }
      );
    }

    if (!templateId && !subject) {
      return NextResponse.json(
        { success: false, error: "Subject is required when not using a template" },
        { status: 400 }
      );
    }

    if (!templateId && !html && !text) {
      return NextResponse.json(
        { success: false, error: "Email content (html or text) is required when not using a template" },
        { status: 400 }
      );
    }

    const client = new SendGridClient({ apiKey });
    const result = await client.sendEmail({
      to,
      from,
      subject,
      html,
      text,
      templateId,
      dynamicTemplateData,
      categories,
      replyTo,
      sendAt,
      sandboxMode,
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
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
        error: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 }
    );
  }
}
