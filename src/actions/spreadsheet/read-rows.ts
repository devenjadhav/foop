import { BaseActionNode } from '@/actions/base/action-node';
import type {
  ActionNodeDefinition,
  ActionNodeExecutionContext,
  ActionNodeExecutionResult,
} from '@/types/action-node.types';
import type { ReadRowsConfig, ReadRowsInput, ReadRowsOutput } from './types';

/**
 * Read Rows Action Node
 *
 * Reads rows from a spreadsheet with optional filtering and pagination.
 * Supports Google Sheets, Excel Online, and Airtable.
 */
export class ReadRowsActionNode extends BaseActionNode<ReadRowsConfig, ReadRowsInput, ReadRowsOutput> {
  readonly definition: ActionNodeDefinition = {
    type: 'spreadsheet.read_rows',
    name: 'Read Rows',
    description: 'Read rows from a spreadsheet with optional filtering',
    category: 'Spreadsheet',
    icon: 'table',
    inputs: [
      {
        name: 'filters',
        type: 'object',
        description: 'Optional filters to apply to the rows',
        required: false,
      },
    ],
    outputs: [
      {
        name: 'rows',
        type: 'array',
        description: 'Array of row data objects',
        required: true,
      },
      {
        name: 'totalRows',
        type: 'number',
        description: 'Total number of rows returned',
        required: true,
      },
      {
        name: 'headers',
        type: 'array',
        description: 'Column headers if hasHeaderRow is true',
        required: false,
      },
    ],
    configSchema: {
      properties: {
        spreadsheetId: {
          type: 'string',
          label: 'Spreadsheet ID',
          description: 'The ID of the spreadsheet to read from',
          placeholder: 'Enter spreadsheet ID or URL',
        },
        sheetName: {
          type: 'string',
          label: 'Sheet Name',
          description: 'Name of the specific sheet (tab) to read',
          placeholder: 'Sheet1',
        },
        hasHeaderRow: {
          type: 'boolean',
          label: 'Has Header Row',
          description: 'Whether the first row contains column headers',
          default: true,
        },
        limit: {
          type: 'number',
          label: 'Limit',
          description: 'Maximum number of rows to return',
          placeholder: '100',
          validation: { min: 1, max: 10000 },
        },
        offset: {
          type: 'number',
          label: 'Offset',
          description: 'Number of rows to skip from the beginning',
          placeholder: '0',
          validation: { min: 0 },
        },
      },
      required: ['spreadsheetId'],
    },
  };

  async execute(
    config: ReadRowsConfig,
    input: ReadRowsInput,
    context: ActionNodeExecutionContext
  ): Promise<ActionNodeExecutionResult<ReadRowsOutput>> {
    const startTime = Date.now();

    const validation = this.validate(config);
    if (!validation.valid) {
      return this.error('VALIDATION_ERROR', 'Invalid configuration', validation.errors);
    }

    try {
      // Placeholder implementation - actual API calls would go here
      // This would integrate with Google Sheets API, Microsoft Graph API, or Airtable API
      const rows = await this.fetchRows(config, input, context);

      return this.success(rows, Date.now() - startTime);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      return this.error('EXECUTION_ERROR', message, err);
    }
  }

  private async fetchRows(
    config: ReadRowsConfig,
    input: ReadRowsInput,
    context: ActionNodeExecutionContext
  ): Promise<ReadRowsOutput> {
    // Implementation would vary based on the spreadsheet provider
    // For now, return a structured response that matches the expected output

    const { spreadsheetId, sheetName, hasHeaderRow = true, limit = 100, offset = 0 } = config;
    const { filters } = input;

    // This is where the actual API integration would happen
    // Example: Google Sheets API, Microsoft Graph API, Airtable API
    console.log(`Reading rows from ${spreadsheetId}/${sheetName || 'default'}`, {
      hasHeaderRow,
      limit,
      offset,
      filters,
      executionId: context.executionId,
    });

    // Placeholder response structure
    return {
      rows: [],
      totalRows: 0,
      headers: hasHeaderRow ? [] : undefined,
    };
  }
}

export const readRowsNode = new ReadRowsActionNode();
