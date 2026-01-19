import { BaseActionNode } from '@/actions/base/action-node';
import type {
  ActionNodeDefinition,
  ActionNodeExecutionContext,
  ActionNodeExecutionResult,
} from '@/types/action-node.types';
import type { LookupConfig, LookupInput, LookupOutput } from './types';

/**
 * Lookup Action Node
 *
 * Searches for rows in a spreadsheet matching a value in a specified column.
 * Similar to VLOOKUP/XLOOKUP in spreadsheet applications.
 * Supports Google Sheets, Excel Online, and Airtable.
 */
export class LookupActionNode extends BaseActionNode<LookupConfig, LookupInput, LookupOutput> {
  readonly definition: ActionNodeDefinition = {
    type: 'spreadsheet.lookup',
    name: 'Lookup',
    description: 'Search for rows matching a value in a specified column',
    category: 'Spreadsheet',
    icon: 'search',
    inputs: [
      {
        name: 'lookupValue',
        type: 'string',
        description: 'The value to search for in the lookup column',
        required: true,
      },
    ],
    outputs: [
      {
        name: 'found',
        type: 'boolean',
        description: 'Whether any matching rows were found',
        required: true,
      },
      {
        name: 'matches',
        type: 'array',
        description: 'Array of matching row data',
        required: true,
      },
      {
        name: 'matchCount',
        type: 'number',
        description: 'Number of matching rows found',
        required: true,
      },
    ],
    configSchema: {
      properties: {
        spreadsheetId: {
          type: 'string',
          label: 'Spreadsheet ID',
          description: 'The ID of the spreadsheet to search',
          placeholder: 'Enter spreadsheet ID or URL',
        },
        sheetName: {
          type: 'string',
          label: 'Sheet Name',
          description: 'Name of the specific sheet (tab) to search',
          placeholder: 'Sheet1',
        },
        lookupColumn: {
          type: 'string',
          label: 'Lookup Column',
          description: 'Column name to search in',
          placeholder: 'Email',
        },
        returnColumns: {
          type: 'string',
          label: 'Return Columns',
          description: 'Comma-separated list of columns to return (empty for all)',
          placeholder: 'Name, Status, Created',
        },
        matchType: {
          type: 'select',
          label: 'Match Type',
          description: 'How to match the lookup value',
          default: 'exact',
          options: [
            { label: 'Exact Match', value: 'exact' },
            { label: 'Contains', value: 'contains' },
            { label: 'Regular Expression', value: 'regex' },
          ],
        },
        returnFirst: {
          type: 'boolean',
          label: 'Return First Match Only',
          description: 'Return only the first matching row instead of all matches',
          default: true,
        },
      },
      required: ['spreadsheetId', 'lookupColumn'],
    },
  };

  async execute(
    config: LookupConfig,
    input: LookupInput,
    context: ActionNodeExecutionContext
  ): Promise<ActionNodeExecutionResult<LookupOutput>> {
    const startTime = Date.now();

    const validation = this.validate(config);
    if (!validation.valid) {
      return this.error('VALIDATION_ERROR', 'Invalid configuration', validation.errors);
    }

    if (!input.lookupValue) {
      return this.error('VALIDATION_ERROR', 'Lookup value is required');
    }

    try {
      const result = await this.performLookup(config, input, context);
      return this.success(result, Date.now() - startTime);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      return this.error('EXECUTION_ERROR', message, err);
    }
  }

  private async performLookup(
    config: LookupConfig,
    input: LookupInput,
    context: ActionNodeExecutionContext
  ): Promise<LookupOutput> {
    const {
      spreadsheetId,
      sheetName,
      lookupColumn,
      returnColumns,
      matchType = 'exact',
      returnFirst = true,
    } = config;
    const { lookupValue } = input;

    // Parse return columns if provided
    const columnsToReturn = returnColumns ? returnColumns.split(',').map((c) => c.trim()) : undefined;

    // This is where the actual API integration would happen
    console.log(`Performing lookup in ${spreadsheetId}/${sheetName || 'default'}`, {
      lookupColumn,
      lookupValue,
      matchType,
      returnFirst,
      returnColumns: columnsToReturn,
      executionId: context.executionId,
    });

    // Placeholder response structure
    return {
      found: false,
      matches: [],
      matchCount: 0,
    };
  }
}

export const lookupNode = new LookupActionNode();
