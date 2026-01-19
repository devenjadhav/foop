import { google, sheets_v4 } from 'googleapis';
import { getAuthenticatedClient } from './google-oauth';
import { columnIndexToLetter } from './utils';
import type {
  GoogleOAuthTokens,
  GoogleSheet,
  GoogleSheetTab,
  SheetColumn,
  SpreadsheetListItem,
} from '@/types/google-sheets';

export class GoogleSheetsService {
  private sheets: sheets_v4.Sheets;
  private drive: ReturnType<typeof google.drive>;

  constructor(tokens: GoogleOAuthTokens) {
    const auth = getAuthenticatedClient(tokens);
    this.sheets = google.sheets({ version: 'v4', auth });
    this.drive = google.drive({ version: 'v3', auth });
  }

  async listSpreadsheets(pageSize = 20, pageToken?: string): Promise<{
    spreadsheets: SpreadsheetListItem[];
    nextPageToken?: string;
  }> {
    const response = await this.drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      pageSize,
      pageToken,
      fields: 'nextPageToken, files(id, name, modifiedTime, webViewLink)',
      orderBy: 'modifiedTime desc',
    });

    const spreadsheets: SpreadsheetListItem[] = (response.data.files || []).map((file) => ({
      id: file.id!,
      name: file.name!,
      modifiedTime: file.modifiedTime!,
      webViewLink: file.webViewLink!,
    }));

    return {
      spreadsheets,
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  async getSpreadsheet(spreadsheetId: string): Promise<GoogleSheet> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    const spreadsheet = response.data;

    const sheets: GoogleSheetTab[] = (spreadsheet.sheets || []).map((sheet) => ({
      sheetId: sheet.properties?.sheetId || 0,
      title: sheet.properties?.title || 'Untitled',
      index: sheet.properties?.index || 0,
      rowCount: sheet.properties?.gridProperties?.rowCount || 0,
      columnCount: sheet.properties?.gridProperties?.columnCount || 0,
    }));

    return {
      spreadsheetId,
      title: spreadsheet.properties?.title || 'Untitled',
      locale: spreadsheet.properties?.locale || 'en_US',
      timeZone: spreadsheet.properties?.timeZone || 'UTC',
      sheets,
    };
  }

  async getSheetColumns(
    spreadsheetId: string,
    sheetTitle: string
  ): Promise<SheetColumn[]> {
    const range = `'${sheetTitle}'!1:1`;

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const headers = response.data.values?.[0] || [];

    return headers.map((header, index) => ({
      index,
      letter: columnIndexToLetter(index),
      header: String(header || `Column ${columnIndexToLetter(index)}`),
    }));
  }

  async readRange(
    spreadsheetId: string,
    range: string
  ): Promise<unknown[][]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING',
    });

    return response.data.values || [];
  }

  async readSheet(
    spreadsheetId: string,
    sheetTitle: string,
    options?: { startRow?: number; endRow?: number; columns?: string[] }
  ): Promise<{ headers: string[]; rows: Record<string, unknown>[] }> {
    let range = `'${sheetTitle}'`;
    if (options?.startRow || options?.endRow) {
      const start = options.startRow || 1;
      const end = options.endRow || '';
      range = `'${sheetTitle}'!A${start}:ZZ${end}`;
    }

    const values = await this.readRange(spreadsheetId, range);

    if (values.length === 0) {
      return { headers: [], rows: [] };
    }

    const headers = values[0].map((h, i) => String(h || `Column${i + 1}`));
    const dataRows = values.slice(1);

    const rows = dataRows.map((row) => {
      const record: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        if (!options?.columns || options.columns.includes(header)) {
          record[header] = row[index] ?? null;
        }
      });
      return record;
    });

    return { headers, rows };
  }

  async writeRange(
    spreadsheetId: string,
    range: string,
    values: unknown[][],
    inputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ): Promise<{ updatedCells: number; updatedRows: number; updatedColumns: number }> {
    const response = await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: inputOption,
      requestBody: { values },
    });

    return {
      updatedCells: response.data.updatedCells || 0,
      updatedRows: response.data.updatedRows || 0,
      updatedColumns: response.data.updatedColumns || 0,
    };
  }

  async appendRows(
    spreadsheetId: string,
    sheetTitle: string,
    values: unknown[][],
    inputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ): Promise<{ updatedCells: number; updatedRows: number }> {
    const range = `'${sheetTitle}'!A:ZZ`;

    const response = await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: inputOption,
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });

    return {
      updatedCells: response.data.updates?.updatedCells || 0,
      updatedRows: response.data.updates?.updatedRows || 0,
    };
  }

  async clearRange(spreadsheetId: string, range: string): Promise<void> {
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
  }

  async createSpreadsheet(title: string): Promise<GoogleSheet> {
    const response = await this.sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
      },
    });

    const spreadsheetId = response.data.spreadsheetId!;
    return this.getSpreadsheet(spreadsheetId);
  }

  async addSheet(spreadsheetId: string, title: string): Promise<GoogleSheetTab> {
    const response = await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title },
            },
          },
        ],
      },
    });

    const addedSheet = response.data.replies?.[0]?.addSheet?.properties;

    return {
      sheetId: addedSheet?.sheetId || 0,
      title: addedSheet?.title || title,
      index: addedSheet?.index || 0,
      rowCount: addedSheet?.gridProperties?.rowCount || 1000,
      columnCount: addedSheet?.gridProperties?.columnCount || 26,
    };
  }

  async deleteSheet(spreadsheetId: string, sheetId: number): Promise<void> {
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteSheet: { sheetId },
          },
        ],
      },
    });
  }
}
