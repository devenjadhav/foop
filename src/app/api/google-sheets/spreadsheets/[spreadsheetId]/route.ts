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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ spreadsheetId: string }> }
) {
  try {
    const tokens = await getTokens();
    if (!tokens) {
      return NextResponse.json({ error: 'Not connected to Google Sheets' }, { status: 401 });
    }

    const { spreadsheetId } = await params;
    const service = new GoogleSheetsService(tokens);
    const spreadsheet = await service.getSpreadsheet(spreadsheetId);

    return NextResponse.json(spreadsheet);
  } catch (error) {
    console.error('Get spreadsheet error:', error);
    return NextResponse.json(
      { error: 'Failed to get spreadsheet' },
      { status: 500 }
    );
  }
}
