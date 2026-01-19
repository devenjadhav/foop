import { NextRequest, NextResponse } from "next/server";
import { SendGridClient, SendGridError } from "@/integrations/sendgrid";
import type { Contact } from "@/integrations/sendgrid";

export interface SearchContactsResponse {
  success: boolean;
  contacts?: Contact[];
  error?: string;
}

function getApiKey(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SearchContactsResponse>> {
  try {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required in Authorization header" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { query, emails } = body;

    if (!query && !emails) {
      return NextResponse.json(
        { success: false, error: "Either 'query' or 'emails' is required" },
        { status: 400 }
      );
    }

    const client = new SendGridClient({ apiKey });

    if (emails && Array.isArray(emails)) {
      const result = await client.getContactsByEmails(emails);
      return NextResponse.json({
        success: true,
        contacts: Object.values(result.result),
      });
    }

    const result = await client.searchContacts(query);

    return NextResponse.json({
      success: true,
      contacts: result.result,
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
        error: error instanceof Error ? error.message : "Failed to search contacts",
      },
      { status: 500 }
    );
  }
}
