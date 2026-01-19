/**
 * CRM Create Contact Node
 * Creates a new contact in the connected CRM system
 */

import type { NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../../types';
import type { CreateContactInput, CRMContact } from '../../types/crm';

export const createContactNode: NodeDefinition = {
  type: 'crm.create-contact',
  name: 'Create Contact',
  description: 'Creates a new contact in the CRM system',
  category: 'CRM',

  inputs: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      description: 'Contact email address',
    },
    {
      name: 'firstName',
      label: 'First Name',
      type: 'string',
      required: false,
      description: 'Contact first name',
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'string',
      required: false,
      description: 'Contact last name',
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'phone',
      required: false,
      description: 'Contact phone number',
    },
    {
      name: 'company',
      label: 'Company',
      type: 'string',
      required: false,
      description: 'Company name',
    },
    {
      name: 'title',
      label: 'Job Title',
      type: 'string',
      required: false,
      description: 'Contact job title',
    },
    {
      name: 'street',
      label: 'Street Address',
      type: 'string',
      required: false,
      description: 'Street address',
    },
    {
      name: 'city',
      label: 'City',
      type: 'string',
      required: false,
      description: 'City',
    },
    {
      name: 'state',
      label: 'State/Province',
      type: 'string',
      required: false,
      description: 'State or province',
    },
    {
      name: 'postalCode',
      label: 'Postal Code',
      type: 'string',
      required: false,
      description: 'Postal or ZIP code',
    },
    {
      name: 'country',
      label: 'Country',
      type: 'string',
      required: false,
      description: 'Country',
    },
  ],

  outputs: [
    {
      name: 'contactId',
      type: 'string',
      description: 'The ID of the created contact',
    },
    {
      name: 'contact',
      type: 'object',
      description: 'The full contact object',
    },
    {
      name: 'success',
      type: 'boolean',
      description: 'Whether the operation was successful',
    },
  ],

  execute: async (context: NodeExecutionContext): Promise<NodeExecutionResult> => {
    const { resolvedInputs, credentials } = context;

    try {
      const input: CreateContactInput = {
        email: resolvedInputs.email as string,
        firstName: resolvedInputs.firstName as string | undefined,
        lastName: resolvedInputs.lastName as string | undefined,
        phone: resolvedInputs.phone as string | undefined,
        company: resolvedInputs.company as string | undefined,
        title: resolvedInputs.title as string | undefined,
        street: resolvedInputs.street as string | undefined,
        city: resolvedInputs.city as string | undefined,
        state: resolvedInputs.state as string | undefined,
        postalCode: resolvedInputs.postalCode as string | undefined,
        country: resolvedInputs.country as string | undefined,
      };

      // Validate required fields
      if (!input.email) {
        return {
          status: 'failure',
          error: 'Email is required to create a contact',
        };
      }

      // Build contact object
      const contact: CRMContact = {
        id: generateContactId(),
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        company: input.company,
        title: input.title,
        address: {
          street: input.street,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // In a real implementation, this would call the CRM API
      // using the credentials from context.credentials
      // Example: await crmClient.createContact(credentials, contact);

      return {
        status: 'success',
        data: {
          contactId: contact.id,
          contact,
          success: true,
        },
        metadata: {
          operation: 'create',
          objectType: 'contact',
        },
      };
    } catch (error) {
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Failed to create contact',
      };
    }
  },
};

function generateContactId(): string {
  return `contact_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
