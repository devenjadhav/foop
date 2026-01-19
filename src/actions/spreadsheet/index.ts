/**
 * Spreadsheet Action Nodes
 *
 * Action nodes for working with spreadsheets (Google Sheets, Excel Online, Airtable)
 */

// Node instances
export { readRowsNode, ReadRowsActionNode } from './read-rows';
export { appendRowNode, AppendRowActionNode } from './append-row';
export { updateRowNode, UpdateRowActionNode } from './update-row';
export { createSheetNode, CreateSheetActionNode } from './create-sheet';
export { lookupNode, LookupActionNode } from './lookup';

// Types
export type {
  SpreadsheetCredentials,
  SpreadsheetReference,
  CellRange,
  RowData,
  ReadRowsConfig,
  ReadRowsInput,
  ReadRowsOutput,
  AppendRowConfig,
  AppendRowInput,
  AppendRowOutput,
  UpdateRowConfig,
  UpdateRowInput,
  UpdateRowOutput,
  CreateSheetConfig,
  CreateSheetInput,
  CreateSheetOutput,
  LookupConfig,
  LookupInput,
  LookupOutput,
} from './types';

// Registry of all spreadsheet action nodes
import { readRowsNode } from './read-rows';
import { appendRowNode } from './append-row';
import { updateRowNode } from './update-row';
import { createSheetNode } from './create-sheet';
import { lookupNode } from './lookup';

export const spreadsheetNodes = {
  [readRowsNode.type]: readRowsNode,
  [appendRowNode.type]: appendRowNode,
  [updateRowNode.type]: updateRowNode,
  [createSheetNode.type]: createSheetNode,
  [lookupNode.type]: lookupNode,
} as const;

export const spreadsheetNodeDefinitions = [
  readRowsNode.definition,
  appendRowNode.definition,
  updateRowNode.definition,
  createSheetNode.definition,
  lookupNode.definition,
];
