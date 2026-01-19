export interface GoogleOAuthTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export interface GoogleSheet {
  spreadsheetId: string;
  title: string;
  locale: string;
  timeZone: string;
  sheets: GoogleSheetTab[];
}

export interface GoogleSheetTab {
  sheetId: number;
  title: string;
  index: number;
  rowCount: number;
  columnCount: number;
}

export interface SheetColumn {
  index: number;
  letter: string;
  header: string;
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  transform?: 'none' | 'uppercase' | 'lowercase' | 'trim' | 'number' | 'date';
}

export interface SheetSelection {
  spreadsheetId: string;
  spreadsheetTitle: string;
  sheetId: number;
  sheetTitle: string;
}

export interface SheetReadOptions {
  spreadsheetId: string;
  range: string;
  includeHeaders?: boolean;
}

export interface SheetWriteOptions {
  spreadsheetId: string;
  range: string;
  values: unknown[][];
  inputOption?: 'RAW' | 'USER_ENTERED';
}

export interface SheetAppendOptions {
  spreadsheetId: string;
  range: string;
  values: unknown[][];
  inputOption?: 'RAW' | 'USER_ENTERED';
}

export interface GoogleSheetsConnection {
  id: string;
  userId: string;
  tokens: GoogleOAuthTokens;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpreadsheetListItem {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink: string;
}
