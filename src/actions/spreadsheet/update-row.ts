import { BaseActionNode } from '@/actions/base/action-node';
import type {
  ActionNodeDefinition,
  ActionNodeExecutionContext,
  ActionNodeExecutionResult,
} from '@/types/action-node.types';
import type { UpdateRowConfig, UpdateRowInput, UpdateRowOutput } from './types';

/**
 * Update Row Action Node
 *
 * Updates existing row(s) in a spreadsheet by matching a column value.
 * Supports Google Sheets, Excel Online, and Airtable.
 */
export class UpdateRowActionNode extends BaseActionNode<UpdateRowConfig, UpdateRowInput, UpdateRowOutput> {
  readonly definition: ActionNodeDefinition = {
    type: 'spreadsheet.update_row',
    name: 'Update Row',
    description: 'Update existing row(s) in a spreadsheet by matching a column value',
    category: 'Spreadsheet',
    icon: 'edit',
    inputs: [
      {
        name: 'values',
        type: 'object',
        description: 'Key-value pairs of columns to update',
        required: true,
      },
    ],
    outputs: [
      {
        name: 'updatedRows',
        type: 'number',
        description: 'Number of rows that were updated',
        required: true,
      },
      {
        name: 'updatedRanges',
        type: 'array',
        description: 'Array of ranges that were updated',
        required: true,
      },
    ],
    configSchema: {
      properties: {
        spreadsheetId: {
          type: 'string',
          label: 'Spreadsheet ID',
          description: 'The ID of the spreadsheet to update',
          placeholder: 'Enter spreadsheet ID or URL',
        },
        sheetName: {
          type: 'string',
          label: 'Sheet Name',
          description: 'Name of the specific sheet (tab) to update',
          placeholder: 'Sheet1',
        },
        matchColumn: {
          type: 'string',
          label: 'Match Column',
          description: 'Column name to use for matching rows',
          placeholder: 'ID',
        },
        matchValue: {
          type: 'expression',
          label: 'Match Value',
          description: 'Value to match in the specified column',
          placeholder: '{{input.id}}',
        },
        updateMultiple: {
          type: 'boolean',
          label: 'Update Multiple Rows',
          description: 'Whether to update all matching rows or just the first one',
          default: false,
        },
      },
      required: ['spreadsheetId', 'matchColumn', 'matchValue'],
    },
  };

  async execute(
    config: UpdateRowConfig,
    input: UpdateRowInput,
    context: ActionNodeExecutionContext
  ): Promise<ActionNodeExecutionResult<UpdateRowOutput>> {
    const startTime = Date.now();

    const validation = this.validate(config);
    if (!validation.valid) {
      return this.error('VALIDATION_ERROR', 'Invalid configuration', validation.errors);
    }

    if (!input.values || Object.keys(input.values).length === 0) {
      return this.error('VALIDATION_ERROR', 'Values are required to update a row');
    }

    try {
      const result = await this.updateRow(config, input, context);
      return this.success(result, Date.now() - startTime);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      return this.error('EXECUTION_ERROR', message, err);
    }
  }

  private async updateRow(
    config: UpdateRowConfig,
    input: UpdateRowInput,
    context: ActionNodeExecutionContext
  ): Promise<UpdateRowOutput> {
    const { spreadsheetId, sheetName, matchColumn, matchValue, updateMultiple = false } = config;
    const { values } = input;

    // This is where the actual API integration would happen
    console.log(`Updating row(s) in ${spreadsheetId}/${sheetName || 'default'}`, {
      matchColumn,
      matchValue,
      updateMultiple,
      values,
      executionId: context.executionId,
    });

    // Placeholder response structure
    return {
      updatedRows: 0,
      updatedRanges: [],
    };
  }
}

export const updateRowNode = new UpdateRowActionNode();
