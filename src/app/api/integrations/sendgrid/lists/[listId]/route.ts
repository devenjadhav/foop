import { NextRequest, NextResponse } from "next/server";
import { SendGridClient, SendGridError } from "@/integrations/sendgrid";
import type { ContactList } from "@/integrations/sendgrid";

export interface ListResponse {
  success: boolean;
  list?: ContactList;
  error?: string;
}

export interface DeleteListResponse {
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
  { params }: { params: Promise<{ listId: string }> }
): Promise<NextResponse<ListResponse>> {
  try {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required in Authorization header" },
        { status: 401 }
      );
    }

    const { listId } = await params;
    const client = new SendGridClient({ apiKey });
    const list = await client.getList(listId);

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
        error: error instanceof Error ? error.message : "Failed to fetch list",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
): Promise<NextResponse<ListResponse>> {
  try {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required in Authorization header" },
        { status: 401 }
      );
    }

    const { listId } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "List name is required" },
        { status: 400 }
      );
    }

    const client = new SendGridClient({ apiKey });
    const list = await client.updateList(listId, { name });

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
        error: error instanceof Error ? error.message : "Failed to update list",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
): Promise<NextResponse<DeleteListResponse>> {
  try {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required in Authorization header" },
        { status: 401 }
      );
    }

    const { listId } = await params;
    const { searchParams } = new URL(request.url);
    const deleteContacts = searchParams.get("delete_contacts") === "true";

    const client = new SendGridClient({ apiKey });
    await client.deleteList(listId, deleteContacts);

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
        error: error instanceof Error ? error.message : "Failed to delete list",
      },
      { status: 500 }
    );
  }
}
