/**
 * Workflow Action Nodes
 *
 * This module exports all action nodes available for use in workflows.
 */

// Base classes
export { BaseActionNode } from './base';

// Spreadsheet actions
export {
  spreadsheetNodes,
  spreadsheetNodeDefinitions,
  readRowsNode,
  appendRowNode,
  updateRowNode,
  createSheetNode,
  lookupNode,
  ReadRowsActionNode,
  AppendRowActionNode,
  UpdateRowActionNode,
  CreateSheetActionNode,
  LookupActionNode,
} from './spreadsheet';

// Re-export spreadsheet types
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
} from './spreadsheet';

// Node registry - all available action nodes
import { spreadsheetNodes } from './spreadsheet';

export const actionNodeRegistry = {
  ...spreadsheetNodes,
} as const;

// Get all node definitions for UI rendering
import { spreadsheetNodeDefinitions } from './spreadsheet';

export const allNodeDefinitions = [...spreadsheetNodeDefinitions];
