import { NextRequest, NextResponse } from "next/server";
import { SendGridClient, SendGridError } from "@/integrations/sendgrid";
import type { ContactList } from "@/integrations/sendgrid";

export interface ListsResponse {
  success: boolean;
  lists?: ContactList[];
  error?: string;
}

export interface CreateListResponse {
  success: boolean;
  list?: ContactList;
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
): Promise<NextResponse<ListsResponse>> {
  try {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required in Authorization header" },
        { status: 401 }
      );
    }

    const client = new SendGridClient({ apiKey });
    const response = await client.getLists();

    return NextResponse.json({
      success: true,
      lists: response.result,
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
        error: error instanceof Error ? error.message : "Failed to fetch lists",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CreateListResponse>> {
  try {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required in Authorization header" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "List name is required" },
        { status: 400 }
      );
    }

    const client = new SendGridClient({ apiKey });
    const list = await client.createList({ name });

    return NextResponse.json({
      success: true,
      list,
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
        error: error instanceof Error ? error.message : "Failed to create list",
      },
      { status: 500 }
    );
  }
}
