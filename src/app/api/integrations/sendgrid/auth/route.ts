import { NextRequest, NextResponse } from "next/server";
import { SendGridAuth, validateApiKeyFormat } from "@/integrations/sendgrid";

export interface AuthValidationResponse {
  valid: boolean;
  email?: string;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<AuthValidationResponse>> {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { valid: false, error: "API key is required" },
        { status: 400 }
      );
    }

    if (!validateApiKeyFormat(apiKey)) {
      return NextResponse.json(
        { valid: false, error: "Invalid API key format. SendGrid API keys start with 'SG.'" },
        { status: 400 }
      );
    }

    const auth = new SendGridAuth({ apiKey });
    const result = await auth.testConnection();

    if (result.valid) {
      return NextResponse.json({
        valid: true,
        email: result.email,
      });
    }

    return NextResponse.json(
      { valid: false, error: result.error },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      },
      { status: 500 }
    );
  }
}
