/**
 * CRM Update Contact Node
 * Updates an existing contact in the connected CRM system
 */

import type { NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../../types';
import type { UpdateContactInput, CRMContact } from '../../types/crm';

export const updateContactNode: NodeDefinition = {
  type: 'crm.update-contact',
  name: 'Update Contact',
  description: 'Updates an existing contact in the CRM system',
  category: 'CRM',

  inputs: [
    {
      name: 'contactId',
      label: 'Contact ID',
      type: 'string',
      required: true,
      description: 'The ID of the contact to update',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: false,
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
      description: 'The ID of the updated contact',
    },
    {
      name: 'contact',
      type: 'object',
      description: 'The updated contact object',
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
      const input: UpdateContactInput = {
        contactId: resolvedInputs.contactId as string,
        email: resolvedInputs.email as string | undefined,
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
      if (!input.contactId) {
        return {
          status: 'failure',
          error: 'Contact ID is required to update a contact',
        };
      }

      // Track which fields are being updated
      const updatedFields: string[] = [];
      const updateData: Partial<CRMContact> = {};

      if (input.email !== undefined) {
        updateData.email = input.email;
        updatedFields.push('email');
      }
      if (input.firstName !== undefined) {
        updateData.firstName = input.firstName;
        updatedFields.push('firstName');
      }
      if (input.lastName !== undefined) {
        updateData.lastName = input.lastName;
        updatedFields.push('lastName');
      }
      if (input.phone !== undefined) {
        updateData.phone = input.phone;
        updatedFields.push('phone');
      }
      if (input.company !== undefined) {
        updateData.company = input.company;
        updatedFields.push('company');
      }
      if (input.title !== undefined) {
        updateData.title = input.title;
        updatedFields.push('title');
      }

      // Handle address fields
      const addressFields = ['street', 'city', 'state', 'postalCode', 'country'] as const;
      const addressUpdates: Record<string, string | undefined> = {};
      for (const field of addressFields) {
        if (input[field] !== undefined) {
          addressUpdates[field] = input[field];
          updatedFields.push(`address.${field}`);
        }
      }
      if (Object.keys(addressUpdates).length > 0) {
        updateData.address = addressUpdates as CRMContact['address'];
      }

      updateData.updatedAt = new Date().toISOString();

      // In a real implementation, this would call the CRM API
      // Example: const updatedContact = await crmClient.updateContact(credentials, input.contactId, updateData);

      const contact: CRMContact = {
        id: input.contactId,
        ...updateData,
      };

      return {
        status: 'success',
        data: {
          contactId: input.contactId,
          contact,
          success: true,
          updatedFields,
        },
        metadata: {
          operation: 'update',
          objectType: 'contact',
          fieldsUpdated: updatedFields.length,
        },
      };
    } catch (error) {
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Failed to update contact',
      };
    }
  },
};
