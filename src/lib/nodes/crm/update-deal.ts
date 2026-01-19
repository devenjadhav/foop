/**
 * CRM Update Deal Node
 * Updates an existing deal/opportunity in the connected CRM system
 */

import type { NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../../types';
import type { UpdateDealInput, CRMDeal } from '../../types/crm';

export const updateDealNode: NodeDefinition = {
  type: 'crm.update-deal',
  name: 'Update Deal',
  description: 'Updates an existing deal or opportunity in the CRM system',
  category: 'CRM',

  inputs: [
    {
      name: 'dealId',
      label: 'Deal ID',
      type: 'string',
      required: true,
      description: 'The ID of the deal to update',
    },
    {
      name: 'name',
      label: 'Deal Name',
      type: 'string',
      required: false,
      description: 'Name of the deal',
    },
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      required: false,
      description: 'Deal value/amount',
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'string',
      required: false,
      description: 'Currency code (e.g., USD, EUR)',
    },
    {
      name: 'stage',
      label: 'Stage',
      type: 'string',
      required: false,
      description: 'Deal stage (e.g., Qualification, Proposal)',
    },
    {
      name: 'pipeline',
      label: 'Pipeline',
      type: 'string',
      required: false,
      description: 'Sales pipeline name or ID',
    },
    {
      name: 'probability',
      label: 'Probability (%)',
      type: 'number',
      required: false,
      description: 'Win probability percentage (0-100)',
    },
    {
      name: 'expectedCloseDate',
      label: 'Expected Close Date',
      type: 'string',
      required: false,
      description: 'Expected close date (ISO format)',
    },
    {
      name: 'contactId',
      label: 'Contact ID',
      type: 'string',
      required: false,
      description: 'Associated contact ID',
    },
    {
      name: 'companyId',
      label: 'Company ID',
      type: 'string',
      required: false,
      description: 'Associated company ID',
    },
    {
      name: 'ownerId',
      label: 'Owner ID',
      type: 'string',
      required: false,
      description: 'Deal owner user ID',
    },
  ],

  outputs: [
    {
      name: 'dealId',
      type: 'string',
      description: 'The ID of the updated deal',
    },
    {
      name: 'deal',
      type: 'object',
      description: 'The updated deal object',
    },
    {
      name: 'success',
      type: 'boolean',
      description: 'Whether the operation was successful',
    },
    {
      name: 'updatedFields',
      type: 'array',
      description: 'List of fields that were updated',
    },
  ],

  execute: async (context: NodeExecutionContext): Promise<NodeExecutionResult> => {
    const { resolvedInputs } = context;

    try {
      const input: UpdateDealInput = {
        dealId: resolvedInputs.dealId as string,
        name: resolvedInputs.name as string | undefined,
        amount: resolvedInputs.amount as number | undefined,
        currency: resolvedInputs.currency as string | undefined,
        stage: resolvedInputs.stage as string | undefined,
        pipeline: resolvedInputs.pipeline as string | undefined,
        probability: resolvedInputs.probability as number | undefined,
        expectedCloseDate: resolvedInputs.expectedCloseDate as string | undefined,
        contactId: resolvedInputs.contactId as string | undefined,
        companyId: resolvedInputs.companyId as string | undefined,
        ownerId: resolvedInputs.ownerId as string | undefined,
      };

      // Validate required fields
      if (!input.dealId) {
        return {
          status: 'failure',
          error: 'Deal ID is required to update a deal',
        };
      }

      // Validate probability range if provided
      if (input.probability !== undefined && (input.probability < 0 || input.probability > 100)) {
        return {
          status: 'failure',
          error: 'Probability must be between 0 and 100',
        };
      }

      // Track which fields are being updated
      const updatedFields: string[] = [];
      const updateData: Partial<CRMDeal> = {};

      const fieldsToCheck = [
        'name',
        'amount',
        'currency',
        'stage',
        'pipeline',
        'probability',
        'expectedCloseDate',
        'contactId',
        'companyId',
        'ownerId',
      ] as const;

      for (const field of fieldsToCheck) {
        if (input[field] !== undefined) {
          (updateData as Record<string, unknown>)[field] = input[field];
          updatedFields.push(field);
        }
      }

      updateData.updatedAt = new Date().toISOString();

      // In a real implementation, this would call the CRM API
      // Example: const updatedDeal = await crmClient.updateDeal(credentials, input.dealId, updateData);

      const deal: CRMDeal = {
        id: input.dealId,
        name: input.name || 'Unknown Deal',
        ...updateData,
      };

      return {
        status: 'success',
        data: {
          dealId: input.dealId,
          deal,
          success: true,
          updatedFields,
        },
        metadata: {
          operation: 'update',
          objectType: 'deal',
          fieldsUpdated: updatedFields.length,
        },
      };
    } catch (error) {
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Failed to update deal',
      };
    }
  },
};
