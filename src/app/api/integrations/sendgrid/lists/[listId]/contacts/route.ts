import { NextRequest, NextResponse } from "next/server";
import { SendGridClient, SendGridError } from "@/integrations/sendgrid";
import type { Contact } from "@/integrations/sendgrid";

export interface AddContactsRequestBody {
  contacts: Contact[];
}

export interface AddContactsResponseBody {
  success: boolean;
  jobId?: string;
  error?: string;
}

export interface RemoveContactsResponseBody {
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
): Promise<NextResponse<AddContactsResponseBody>> {
  try {
    const apiKey = getApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required in Authorization header" },
        { status: 401 }
      );
    }

    const { listId } = await params;
    const body: AddContactsRequestBody = await request.json();
    const { contacts } = body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one contact is required" },
        { status: 400 }
      );
    }

    const client = new SendGridClient({ apiKey });
    const result = await client.addContactsToList(listId, contacts);

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
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
): Promise<NextResponse<RemoveContactsResponseBody>> {
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
    const contactIds = searchParams.get("contact_ids");

    if (!contactIds) {
      return NextResponse.json(
        { success: false, error: "contact_ids query parameter is required" },
        { status: 400 }
      );
    }

    const client = new SendGridClient({ apiKey });
    const result = await client.removeContactsFromList(
      listId,
      contactIds.split(",")
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
        error: error instanceof Error ? error.message : "Failed to remove contacts",
      },
      { status: 500 }
    );
  }
}
