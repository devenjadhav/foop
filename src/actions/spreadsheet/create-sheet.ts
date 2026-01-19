import { BaseActionNode } from '@/actions/base/action-node';
import type {
  ActionNodeDefinition,
  ActionNodeExecutionContext,
  ActionNodeExecutionResult,
} from '@/types/action-node.types';
import type { CreateSheetConfig, CreateSheetInput, CreateSheetOutput } from './types';

/**
 * Create Sheet Action Node
 *
 * Creates a new sheet (tab) in an existing spreadsheet or creates a new spreadsheet.
 * Supports Google Sheets, Excel Online, and Airtable.
 */
export class CreateSheetActionNode extends BaseActionNode<CreateSheetConfig, CreateSheetInput, CreateSheetOutput> {
  readonly definition: ActionNodeDefinition = {
    type: 'spreadsheet.create_sheet',
    name: 'Create Sheet',
    description: 'Create a new sheet in an existing spreadsheet or create a new spreadsheet',
    category: 'Spreadsheet',
    icon: 'file-plus',
    inputs: [
      {
        name: 'initialData',
        type: 'array',
        description: 'Optional initial data to populate the sheet with',
        required: false,
      },
    ],
    outputs: [
      {
        name: 'spreadsheetId',
        type: 'string',
        description: 'ID of the spreadsheet',
        required: true,
      },
      {
        name: 'sheetId',
        type: 'string',
        description: 'ID of the newly created sheet',
        required: true,
      },
      {
        name: 'sheetName',
        type: 'string',
        description: 'Name of the newly created sheet',
        required: true,
      },
      {
        name: 'spreadsheetUrl',
        type: 'string',
        description: 'URL to access the spreadsheet',
        required: true,
      },
    ],
    configSchema: {
      properties: {
        spreadsheetId: {
          type: 'string',
          label: 'Spreadsheet ID',
          description: 'ID of existing spreadsheet to add sheet to (leave empty to create new)',
          placeholder: 'Enter spreadsheet ID or leave empty',
        },
        title: {
          type: 'string',
          label: 'Sheet Title',
          description: 'Name for the new sheet/tab',
          placeholder: 'Sheet1',
        },
        headers: {
          type: 'string',
          label: 'Column Headers',
          description: 'Comma-separated list of column headers',
          placeholder: 'Name, Email, Status',
        },
        createNewSpreadsheet: {
          type: 'boolean',
          label: 'Create New Spreadsheet',
          description: 'Create a new spreadsheet instead of adding to existing',
          default: false,
        },
        spreadsheetTitle: {
          type: 'string',
          label: 'Spreadsheet Title',
          description: 'Title for the new spreadsheet (if creating new)',
          placeholder: 'My New Spreadsheet',
        },
      },
      required: ['title'],
    },
  };

  async execute(
    config: CreateSheetConfig,
    input: CreateSheetInput,
    context: ActionNodeExecutionContext
  ): Promise<ActionNodeExecutionResult<CreateSheetOutput>> {
    const startTime = Date.now();

    const validation = this.validate(config);
    if (!validation.valid) {
      return this.error('VALIDATION_ERROR', 'Invalid configuration', validation.errors);
    }

    // Validate that either spreadsheetId or createNewSpreadsheet is provided
    if (!config.spreadsheetId && !config.createNewSpreadsheet) {
      return this.error(
        'VALIDATION_ERROR',
        'Either provide a spreadsheetId or enable createNewSpreadsheet'
      );
    }

    try {
      const result = await this.createSheet(config, input, context);
      return this.success(result, Date.now() - startTime);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      return this.error('EXECUTION_ERROR', message, err);
    }
  }

  private async createSheet(
    config: CreateSheetConfig,
    input: CreateSheetInput,
    context: ActionNodeExecutionContext
  ): Promise<CreateSheetOutput> {
    const { spreadsheetId, title, headers, createNewSpreadsheet, spreadsheetTitle } = config;
    const { initialData } = input;

    // Use headers array directly
    const headersList = headers ?? [];

    // This is where the actual API integration would happen
    console.log('Creating sheet', {
      spreadsheetId,
      title,
      headers: headersList,
      createNewSpreadsheet,
      spreadsheetTitle,
      initialData,
      executionId: context.executionId,
    });

    // Placeholder response structure
    return {
      spreadsheetId: spreadsheetId || '',
      sheetId: '',
      sheetName: title,
      spreadsheetUrl: '',
    };
  }
}

export const createSheetNode = new CreateSheetActionNode();
