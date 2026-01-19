/**
 * CRM Add Note Node
 * Adds a note to a contact, deal, or company in the connected CRM system
 */

import type { NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../../types';
import type { AddNoteInput, CRMNote } from '../../types/crm';

export const addNoteNode: NodeDefinition = {
  type: 'crm.add-note',
  name: 'Add Note',
  description: 'Adds a note to a contact, deal, or company in the CRM system',
  category: 'CRM',

  inputs: [
    {
      name: 'content',
      label: 'Note Content',
      type: 'text',
      required: true,
      description: 'The content of the note',
    },
    {
      name: 'associatedObjectType',
      label: 'Associated Object Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Contact', value: 'contact' },
        { label: 'Deal', value: 'deal' },
        { label: 'Company', value: 'company' },
      ],
      description: 'The type of object to attach the note to',
    },
    {
      name: 'associatedObjectId',
      label: 'Associated Object ID',
      type: 'string',
      required: true,
      description: 'The ID of the object to attach the note to',
    },
  ],

  outputs: [
    {
      name: 'noteId',
      type: 'string',
      description: 'The ID of the created note',
    },
    {
      name: 'note',
      type: 'object',
      description: 'The full note object',
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
      const input: AddNoteInput = {
        content: resolvedInputs.content as string,
        associatedObjectType: resolvedInputs.associatedObjectType as 'contact' | 'deal' | 'company',
        associatedObjectId: resolvedInputs.associatedObjectId as string,
      };

      // Validate required fields
      if (!input.content) {
        return {
          status: 'failure',
          error: 'Note content is required',
        };
      }

      if (!input.associatedObjectType) {
        return {
          status: 'failure',
          error: 'Associated object type is required',
        };
      }

      if (!input.associatedObjectId) {
        return {
          status: 'failure',
          error: 'Associated object ID is required',
        };
      }

      // Validate object type
      const validObjectTypes = ['contact', 'deal', 'company'];
      if (!validObjectTypes.includes(input.associatedObjectType)) {
        return {
          status: 'failure',
          error: `Invalid associated object type. Must be one of: ${validObjectTypes.join(', ')}`,
        };
      }

      // Build note object
      const note: CRMNote = {
        id: generateNoteId(),
        content: input.content,
        associatedObjectType: input.associatedObjectType,
        associatedObjectId: input.associatedObjectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // In a real implementation, this would call the CRM API
      // Example: const createdNote = await crmClient.addNote(credentials, note);

      return {
        status: 'success',
        data: {
          noteId: note.id,
          note,
          success: true,
        },
        metadata: {
          operation: 'create',
          objectType: 'note',
          associatedWith: {
            type: input.associatedObjectType,
            id: input.associatedObjectId,
          },
        },
      };
    } catch (error) {
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Failed to add note',
      };
    }
  },
};

function generateNoteId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
