/**
 * Types for spreadsheet action nodes
 */

export interface SpreadsheetCredentials {
  provider: 'google_sheets' | 'excel_online' | 'airtable';
  accessToken: string;
  refreshToken?: string;
}

export interface SpreadsheetReference {
  spreadsheetId: string;
  sheetName?: string;
  sheetId?: string;
}

export interface CellRange {
  startRow?: number;
  endRow?: number;
  startColumn?: string;
  endColumn?: string;
}

export interface RowData {
  rowIndex: number;
  values: Record<string, unknown>;
}

// Read Rows types
export interface ReadRowsConfig extends SpreadsheetReference {
  range?: CellRange;
  hasHeaderRow?: boolean;
  limit?: number;
  offset?: number;
}

export interface ReadRowsInput {
  filters?: Record<string, unknown>;
}

export interface ReadRowsOutput {
  rows: RowData[];
  totalRows: number;
  headers?: string[];
}

// Append Row types
export interface AppendRowConfig extends SpreadsheetReference {
  insertPosition?: 'end' | 'beginning';
}

export interface AppendRowInput {
  values: Record<string, unknown>;
}

export interface AppendRowOutput {
  rowIndex: number;
  updatedRange: string;
}

// Update Row types
export interface UpdateRowConfig extends SpreadsheetReference {
  matchColumn: string;
  matchValue: string;
  updateMultiple?: boolean;
}

export interface UpdateRowInput {
  values: Record<string, unknown>;
}

export interface UpdateRowOutput {
  updatedRows: number;
  updatedRanges: string[];
}

// Create Sheet types
export interface CreateSheetConfig {
  spreadsheetId?: string;
  title: string;
  headers?: string[];
  createNewSpreadsheet?: boolean;
  spreadsheetTitle?: string;
}

export interface CreateSheetInput {
  initialData?: Record<string, unknown>[];
}

export interface CreateSheetOutput {
  spreadsheetId: string;
  sheetId: string;
  sheetName: string;
  spreadsheetUrl: string;
}

// Lookup types
export interface LookupConfig extends SpreadsheetReference {
  lookupColumn: string;
  returnColumns?: string[];
  matchType?: 'exact' | 'contains' | 'regex';
  returnFirst?: boolean;
}

export interface LookupInput {
  lookupValue: string;
}

export interface LookupOutput {
  found: boolean;
  matches: RowData[];
  matchCount: number;
}
