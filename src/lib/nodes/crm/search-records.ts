/**
 * CRM Search Records Node
 * Searches for records (contacts, deals, companies, notes) in the connected CRM system
 */

import type { NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../../types';
import type { SearchRecordsInput, CRMSearchFilter } from '../../types/crm';

export const searchRecordsNode: NodeDefinition = {
  type: 'crm.search-records',
  name: 'Search Records',
  description: 'Searches for records in the CRM system based on specified criteria',
  category: 'CRM',

  inputs: [
    {
      name: 'objectType',
      label: 'Object Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Contact', value: 'contact' },
        { label: 'Deal', value: 'deal' },
        { label: 'Company', value: 'company' },
        { label: 'Note', value: 'note' },
      ],
      description: 'The type of object to search for',
    },
    {
      name: 'searchField',
      label: 'Search Field',
      type: 'string',
      required: true,
      description: 'The field to search on (e.g., email, name, amount)',
    },
    {
      name: 'operator',
      label: 'Operator',
      type: 'select',
      required: true,
      options: [
        { label: 'Equals', value: 'eq' },
        { label: 'Not Equals', value: 'neq' },
        { label: 'Contains', value: 'contains' },
        { label: 'Starts With', value: 'starts_with' },
        { label: 'Ends With', value: 'ends_with' },
        { label: 'Greater Than', value: 'gt' },
        { label: 'Greater Than or Equal', value: 'gte' },
        { label: 'Less Than', value: 'lt' },
        { label: 'Less Than or Equal', value: 'lte' },
      ],
      description: 'The comparison operator to use',
    },
    {
      name: 'searchValue',
      label: 'Search Value',
      type: 'string',
      required: true,
      description: 'The value to search for',
    },
    {
      name: 'limit',
      label: 'Limit',
      type: 'number',
      required: false,
      defaultValue: 10,
      description: 'Maximum number of results to return',
    },
  ],

  outputs: [
    {
      name: 'results',
      type: 'array',
      description: 'Array of matching records',
    },
    {
      name: 'total',
      type: 'number',
      description: 'Total number of matching records',
    },
    {
      name: 'hasMore',
      type: 'boolean',
      description: 'Whether there are more results available',
    },
    {
      name: 'success',
      type: 'boolean',
      description: 'Whether the operation was successful',
    },
  ],

  execute: async (context: NodeExecutionContext): Promise<NodeExecutionResult> => {
    const { resolvedInputs } = context;

    try {
      const input: SearchRecordsInput = {
        objectType: resolvedInputs.objectType as 'contact' | 'deal' | 'company' | 'note',
        searchField: resolvedInputs.searchField as string,
        operator: resolvedInputs.operator as CRMSearchFilter['operator'],
        searchValue: resolvedInputs.searchValue as string,
        limit: (resolvedInputs.limit as number) || 10,
      };

      // Validate required fields
      if (!input.objectType) {
        return {
          status: 'failure',
          error: 'Object type is required',
        };
      }

      if (!input.searchField) {
        return {
          status: 'failure',
          error: 'Search field is required',
        };
      }

      if (!input.operator) {
        return {
          status: 'failure',
          error: 'Operator is required',
        };
      }

      if (input.searchValue === undefined || input.searchValue === null) {
        return {
          status: 'failure',
          error: 'Search value is required',
        };
      }

      // Validate object type
      const validObjectTypes = ['contact', 'deal', 'company', 'note'];
      if (!validObjectTypes.includes(input.objectType)) {
        return {
          status: 'failure',
          error: `Invalid object type. Must be one of: ${validObjectTypes.join(', ')}`,
        };
      }

      // Validate operator
      const validOperators = ['eq', 'neq', 'contains', 'starts_with', 'ends_with', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in'];
      if (!validOperators.includes(input.operator)) {
        return {
          status: 'failure',
          error: `Invalid operator. Must be one of: ${validOperators.join(', ')}`,
        };
      }

      // Validate limit
      const limit = Math.min(Math.max(1, input.limit || 10), 100);

      // In a real implementation, this would call the CRM API
      // Example:
      // const searchResult = await crmClient.search(credentials, {
      //   objectType: input.objectType,
      //   filters: [{
      //     field: input.searchField,
      //     operator: input.operator,
      //     value: input.searchValue,
      //   }],
      //   limit,
      // });

      // Mock response - in production, this would be actual search results
      const mockResults: unknown[] = [];
      const total = 0;
      const hasMore = false;

      return {
        status: 'success',
        data: {
          results: mockResults,
          total,
          hasMore,
          success: true,
        },
        metadata: {
          operation: 'search',
          objectType: input.objectType,
          query: {
            field: input.searchField,
            operator: input.operator,
            value: input.searchValue,
          },
          limit,
        },
      };
    } catch (error) {
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Failed to search records',
      };
    }
  },
};
