/**
 * CRM Create Deal Node
 * Creates a new deal/opportunity in the connected CRM system
 */

import type { NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../../types';
import type { CreateDealInput, CRMDeal } from '../../types/crm';

export const createDealNode: NodeDefinition = {
  type: 'crm.create-deal',
  name: 'Create Deal',
  description: 'Creates a new deal or opportunity in the CRM system',
  category: 'CRM',

  inputs: [
    {
      name: 'name',
      label: 'Deal Name',
      type: 'string',
      required: true,
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
      defaultValue: 'USD',
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
      description: 'The ID of the created deal',
    },
    {
      name: 'deal',
      type: 'object',
      description: 'The full deal object',
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
      const input: CreateDealInput = {
        name: resolvedInputs.name as string,
        amount: resolvedInputs.amount as number | undefined,
        currency: (resolvedInputs.currency as string) || 'USD',
        stage: resolvedInputs.stage as string | undefined,
        pipeline: resolvedInputs.pipeline as string | undefined,
        probability: resolvedInputs.probability as number | undefined,
        expectedCloseDate: resolvedInputs.expectedCloseDate as string | undefined,
        contactId: resolvedInputs.contactId as string | undefined,
        companyId: resolvedInputs.companyId as string | undefined,
        ownerId: resolvedInputs.ownerId as string | undefined,
      };

      // Validate required fields
      if (!input.name) {
        return {
          status: 'failure',
          error: 'Deal name is required to create a deal',
        };
      }

      // Validate probability range
      if (input.probability !== undefined && (input.probability < 0 || input.probability > 100)) {
        return {
          status: 'failure',
          error: 'Probability must be between 0 and 100',
        };
      }

      // Build deal object
      const deal: CRMDeal = {
        id: generateDealId(),
        name: input.name,
        amount: input.amount,
        currency: input.currency,
        stage: input.stage,
        pipeline: input.pipeline,
        probability: input.probability,
        expectedCloseDate: input.expectedCloseDate,
        contactId: input.contactId,
        companyId: input.companyId,
        ownerId: input.ownerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // In a real implementation, this would call the CRM API
      // Example: const createdDeal = await crmClient.createDeal(credentials, deal);

      return {
        status: 'success',
        data: {
          dealId: deal.id,
          deal,
          success: true,
        },
        metadata: {
          operation: 'create',
          objectType: 'deal',
        },
      };
    } catch (error) {
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Failed to create deal',
      };
    }
  },
};

function generateDealId(): string {
  return `deal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
