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
  { params }: { params: Promise<{ spreadsheetId: string; sheetTitle: string }> }
) {
  try {
    const tokens = await getTokens();
    if (!tokens) {
      return NextResponse.json({ error: 'Not connected to Google Sheets' }, { status: 401 });
    }

    const { spreadsheetId, sheetTitle } = await params;
    const decodedSheetTitle = decodeURIComponent(sheetTitle);

    const { searchParams } = new URL(request.url);
    const startRow = searchParams.get('startRow') ? parseInt(searchParams.get('startRow')!, 10) : undefined;
    const endRow = searchParams.get('endRow') ? parseInt(searchParams.get('endRow')!, 10) : undefined;
    const columns = searchParams.get('columns')?.split(',').filter(Boolean);

    const service = new GoogleSheetsService(tokens);
    const data = await service.readSheet(spreadsheetId, decodedSheetTitle, {
      startRow,
      endRow,
      columns,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Read sheet error:', error);
    return NextResponse.json(
      { error: 'Failed to read sheet data' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ spreadsheetId: string; sheetTitle: string }> }
) {
  try {
    const tokens = await getTokens();
    if (!tokens) {
      return NextResponse.json({ error: 'Not connected to Google Sheets' }, { status: 401 });
    }

    const { spreadsheetId, sheetTitle } = await params;
    const decodedSheetTitle = decodeURIComponent(sheetTitle);
    const { rows, inputOption } = await request.json();

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'Rows array is required' }, { status: 400 });
    }

    const service = new GoogleSheetsService(tokens);
    const result = await service.appendRows(spreadsheetId, decodedSheetTitle, rows, inputOption);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Append rows error:', error);
    return NextResponse.json(
      { error: 'Failed to append rows' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ spreadsheetId: string; sheetTitle: string }> }
) {
  try {
    const tokens = await getTokens();
    if (!tokens) {
      return NextResponse.json({ error: 'Not connected to Google Sheets' }, { status: 401 });
    }

    const { spreadsheetId, sheetTitle } = await params;
    const decodedSheetTitle = decodeURIComponent(sheetTitle);
    const { range, values, inputOption } = await request.json();

    if (!values || !Array.isArray(values)) {
      return NextResponse.json({ error: 'Values array is required' }, { status: 400 });
    }

    const fullRange = range
      ? `'${decodedSheetTitle}'!${range}`
      : `'${decodedSheetTitle}'!A1`;

    const service = new GoogleSheetsService(tokens);
    const result = await service.writeRange(spreadsheetId, fullRange, values, inputOption);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Write range error:', error);
    return NextResponse.json(
      { error: 'Failed to write data' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ spreadsheetId: string; sheetTitle: string }> }
) {
  try {
    const tokens = await getTokens();
    if (!tokens) {
      return NextResponse.json({ error: 'Not connected to Google Sheets' }, { status: 401 });
    }

    const { spreadsheetId, sheetTitle } = await params;
    const decodedSheetTitle = decodeURIComponent(sheetTitle);

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range');

    const fullRange = range
      ? `'${decodedSheetTitle}'!${range}`
      : `'${decodedSheetTitle}'`;

    const service = new GoogleSheetsService(tokens);
    await service.clearRange(spreadsheetId, fullRange);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear range error:', error);
    return NextResponse.json(
      { error: 'Failed to clear data' },
      { status: 500 }
    );
  }
}
