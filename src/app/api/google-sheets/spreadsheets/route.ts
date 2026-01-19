import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GoogleSheetsService } from '@/lib/google-sheets';
import type { GoogleOAuthTokens } from '@/types/google-sheets';

async function getTokens(): Promise<GoogleOAuthTokens | null> {
  const cookieStore = await cookies();
  const tokensStr = cookieStore.get('google_sheets_tokens')?.value;
  if (!tokensStr) return null;
  return JSON.parse(tokensStr);
}

export async function GET(request: Request) {
  try {
    const tokens = await getTokens();
    if (!tokens) {
      return NextResponse.json({ error: 'Not connected to Google Sheets' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageToken = searchParams.get('pageToken') || undefined;
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const service = new GoogleSheetsService(tokens);
    const result = await service.listSpreadsheets(pageSize, pageToken);

    return NextResponse.json(result);
  } catch (error) {
    console.error('List spreadsheets error:', error);
    return NextResponse.json(
      { error: 'Failed to list spreadsheets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const tokens = await getTokens();
    if (!tokens) {
      return NextResponse.json({ error: 'Not connected to Google Sheets' }, { status: 401 });
    }

    const { title } = await request.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const service = new GoogleSheetsService(tokens);
    const spreadsheet = await service.createSpreadsheet(title);

    return NextResponse.json(spreadsheet);
  } catch (error) {
    console.error('Create spreadsheet error:', error);
    return NextResponse.json(
      { error: 'Failed to create spreadsheet' },
      { status: 500 }
    );
  }
}
