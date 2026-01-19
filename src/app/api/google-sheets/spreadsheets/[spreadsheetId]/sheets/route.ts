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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ spreadsheetId: string }> }
) {
  try {
    const tokens = await getTokens();
    if (!tokens) {
      return NextResponse.json({ error: 'Not connected to Google Sheets' }, { status: 401 });
    }

    const { spreadsheetId } = await params;
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Sheet title is required' }, { status: 400 });
    }

    const service = new GoogleSheetsService(tokens);
    const sheet = await service.addSheet(spreadsheetId, title);

    return NextResponse.json(sheet);
  } catch (error) {
    console.error('Add sheet error:', error);
    return NextResponse.json(
      { error: 'Failed to add sheet' },
      { status: 500 }
    );
  }
}
