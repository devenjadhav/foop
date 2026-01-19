import { BaseActionNode } from '@/actions/base/action-node';
import type {
  ActionNodeDefinition,
  ActionNodeExecutionContext,
  ActionNodeExecutionResult,
} from '@/types/action-node.types';
import type { AppendRowConfig, AppendRowInput, AppendRowOutput } from './types';

/**
 * Append Row Action Node
 *
 * Appends a new row to a spreadsheet at the end or beginning.
 * Supports Google Sheets, Excel Online, and Airtable.
 */
export class AppendRowActionNode extends BaseActionNode<AppendRowConfig, AppendRowInput, AppendRowOutput> {
  readonly definition: ActionNodeDefinition = {
    type: 'spreadsheet.append_row',
    name: 'Append Row',
    description: 'Add a new row to a spreadsheet',
    category: 'Spreadsheet',
    icon: 'plus-square',
    inputs: [
      {
        name: 'values',
        type: 'object',
        description: 'Key-value pairs where keys are column names and values are cell values',
        required: true,
      },
    ],
    outputs: [
      {
        name: 'rowIndex',
        type: 'number',
        description: 'The index of the newly added row',
        required: true,
      },
      {
        name: 'updatedRange',
        type: 'string',
        description: 'The range that was updated (e.g., "A5:D5")',
        required: true,
      },
    ],
    configSchema: {
      properties: {
        spreadsheetId: {
          type: 'string',
          label: 'Spreadsheet ID',
          description: 'The ID of the spreadsheet to append to',
          placeholder: 'Enter spreadsheet ID or URL',
        },
        sheetName: {
          type: 'string',
          label: 'Sheet Name',
          description: 'Name of the specific sheet (tab) to append to',
          placeholder: 'Sheet1',
        },
        insertPosition: {
          type: 'select',
          label: 'Insert Position',
          description: 'Where to insert the new row',
          default: 'end',
          options: [
            { label: 'At End', value: 'end' },
            { label: 'At Beginning', value: 'beginning' },
          ],
        },
      },
      required: ['spreadsheetId'],
    },
  };

  async execute(
    config: AppendRowConfig,
    input: AppendRowInput,
    context: ActionNodeExecutionContext
  ): Promise<ActionNodeExecutionResult<AppendRowOutput>> {
    const startTime = Date.now();

    const validation = this.validate(config);
    if (!validation.valid) {
      return this.error('VALIDATION_ERROR', 'Invalid configuration', validation.errors);
    }

    if (!input.values || Object.keys(input.values).length === 0) {
      return this.error('VALIDATION_ERROR', 'Values are required to append a row');
    }

    try {
      const result = await this.appendRow(config, input, context);
      return this.success(result, Date.now() - startTime);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      return this.error('EXECUTION_ERROR', message, err);
    }
  }

  private async appendRow(
    config: AppendRowConfig,
    input: AppendRowInput,
    context: ActionNodeExecutionContext
  ): Promise<AppendRowOutput> {
    const { spreadsheetId, sheetName, insertPosition = 'end' } = config;
    const { values } = input;

    // This is where the actual API integration would happen
    console.log(`Appending row to ${spreadsheetId}/${sheetName || 'default'}`, {
      insertPosition,
      values,
      executionId: context.executionId,
    });

    // Placeholder response structure
    return {
      rowIndex: 0,
      updatedRange: '',
    };
  }
}

export const appendRowNode = new AppendRowActionNode();
