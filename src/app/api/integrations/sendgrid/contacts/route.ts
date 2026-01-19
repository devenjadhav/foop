import { NextRequest, NextResponse } from "next/server";
import { SendGridClient, SendGridError } from "@/integrations/sendgrid";
import type { Contact } from "@/integrations/sendgrid";

export interface ContactsResponse {
  success: boolean;
  contacts?: Contact[];
  error?: string;
}

export interface AddContactsResponseBody {
  success: boolean;
  jobId?: string;
  error?: string;
}

export interface DeleteContactsResponseBody {
  success: boolean;
  jobId?: string;
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
): Promise<NextResponse<ContactsResponse>> {
  try {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required in Authorization header" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pageSize = searchParams.get("page_size");
    const pageToken = searchParams.get("page_token");

    const client = new SendGridClient({ apiKey });
    const response = await client.getContacts({
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      pageToken: pageToken || undefined,
    });

    return NextResponse.json({
      success: true,
      contacts: response.result,
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
        error: error instanceof Error ? error.message : "Failed to fetch contacts",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest
): Promise<NextResponse<AddContactsResponseBody>> {
  try {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required in Authorization header" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contacts, listIds } = body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one contact is required" },
        { status: 400 }
      );
    }

    const client = new SendGridClient({ apiKey });
    const result = await client.addContacts({ contacts, listIds });

    return NextResponse.json({
      success: true,
      jobId: result.jobId,
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
        error: error instanceof Error ? error.message : "Failed to add contacts",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest
): Promise<NextResponse<DeleteContactsResponseBody>> {
  try {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required in Authorization header" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");
    const deleteAll = searchParams.get("delete_all") === "true";

    if (!ids && !deleteAll) {
      return NextResponse.json(
        { success: false, error: "Either 'ids' or 'delete_all=true' query parameter is required" },
        { status: 400 }
      );
    }

    const client = new SendGridClient({ apiKey });
    const result = await client.deleteContacts(
      deleteAll ? "all" : ids!.split(",")
    );

    return NextResponse.json({
      success: true,
      jobId: result.jobId,
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
        error: error instanceof Error ? error.message : "Failed to delete contacts",
      },
      { status: 500 }
    );
  }
}
