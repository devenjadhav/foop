/**
 * Remove from List Action Node
 * Removes a contact from an email list
 */

import type { NodeDefinition, ExecutionContext, ExecutionResult, ValidationError } from '../../../types/nodes'
import type { RemoveFromListConfig, ListOperationResult } from '../../../types/email-nodes'
import { EMAIL_NODE_TYPES } from '../../../types/email-nodes'
import {
  resolveTemplate,
  mergeInputWithContext,
  isValidEmail,
  successResult,
  failureResult,
  validationError,
  getIntegration,
  getNestedValue,
} from '../utils'

/**
 * Execute the remove from list action
 */
async function execute(
  node: { config: RemoveFromListConfig },
  input: Record<string, unknown>,
  context: ExecutionContext
): Promise<ExecutionResult> {
  const startTime = Date.now()
  const config = node.config

  // Get email integration credentials
  const emailCredentials = getIntegration(context, 'email')
  if (!emailCredentials) {
    return failureResult('Email integration not configured', startTime)
  }

  // Merge input with context for template resolution
  const templateData = mergeInputWithContext(input, context)

  // Get email from input
  const emailField = config.emailField || 'email'
  let email = getNestedValue(templateData, emailField) as string

  // If email field contains a template, resolve it
  if (typeof email === 'string' && email.includes('{{')) {
    email = resolveTemplate(email, templateData)
  }

  // Validate email
  if (!email || !isValidEmail(email)) {
    return failureResult(`Invalid email address: ${email || 'undefined'}`, startTime)
  }

  // Resolve list ID (might be templated) - not needed if removing from all lists
  let listId: string | undefined
  if (!config.removeFromAllLists) {
    listId = resolveTemplate(config.listId, templateData)
    if (!listId) {
      return failureResult('List ID is required when not removing from all lists', startTime)
    }
  }

  try {
    // Remove contact from list via integration
    const result = await removeContactFromList(
      {
        listId: listId || '',
        email,
        removeFromAllLists: config.removeFromAllLists ?? false,
        deleteContact: config.deleteContact ?? false,
      },
      emailCredentials
    )

    const output: ListOperationResult = {
      email,
      listId: listId || 'all',
      action: result.action,
      contactId: result.contactId,
    }

    return successResult(output as unknown as Record<string, unknown>, startTime)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove contact from list'
    return failureResult(errorMessage, startTime, { email, listId })
  }
}

/**
 * Remove a contact from an email list
 */
async function removeContactFromList(
  params: {
    listId: string
    email: string
    removeFromAllLists: boolean
    deleteContact: boolean
  },
  credentials: Record<string, unknown>
): Promise<{ action: 'removed' | 'deleted' | 'skipped'; contactId?: string }> {
  const provider = credentials.provider as string

  switch (provider) {
    case 'sendgrid':
      return removeFromSendGridList(params, credentials)
    case 'mailchimp':
      return removeFromMailchimpList(params, credentials)
    case 'convertkit':
      return removeFromConvertKitList(params, credentials)
    default:
      // Generic implementation
      return removeFromGenericList(params, credentials)
  }
}

// Provider-specific implementations (stubs)
async function removeFromSendGridList(
  params: {
    listId: string
    email: string
    removeFromAllLists: boolean
    deleteContact: boolean
  },
  credentials: Record<string, unknown>
): Promise<{ action: 'removed' | 'deleted' | 'skipped'; contactId?: string }> {
  // TODO: Implement SendGrid Contacts API
  void params
  void credentials
  const action = params.deleteContact ? 'deleted' : 'removed'
  return { action, contactId: `sg_contact_${Date.now()}` }
}

async function removeFromMailchimpList(
  params: {
    listId: string
    email: string
    removeFromAllLists: boolean
    deleteContact: boolean
  },
  credentials: Record<string, unknown>
): Promise<{ action: 'removed' | 'deleted' | 'skipped'; contactId?: string }> {
  // TODO: Implement Mailchimp API
  void params
  void credentials
  const action = params.deleteContact ? 'deleted' : 'removed'
  return { action, contactId: `mc_contact_${Date.now()}` }
}

async function removeFromConvertKitList(
  params: {
    listId: string
    email: string
    removeFromAllLists: boolean
    deleteContact: boolean
  },
  credentials: Record<string, unknown>
): Promise<{ action: 'removed' | 'deleted' | 'skipped'; contactId?: string }> {
  // TODO: Implement ConvertKit API
  void params
  void credentials
  const action = params.deleteContact ? 'deleted' : 'removed'
  return { action, contactId: `ck_contact_${Date.now()}` }
}

async function removeFromGenericList(
  params: {
    listId: string
    email: string
    removeFromAllLists: boolean
    deleteContact: boolean
  },
  credentials: Record<string, unknown>
): Promise<{ action: 'removed' | 'deleted' | 'skipped'; contactId?: string }> {
  // Generic implementation - would update database
  void params
  void credentials
  const action = params.deleteContact ? 'deleted' : 'removed'
  return { action, contactId: `contact_${Date.now()}` }
}

/**
 * Validate remove from list configuration
 */
function validate(config: RemoveFromListConfig): ValidationError[] {
  const errors: ValidationError[] = []

  if (!config.removeFromAllLists && (!config.listId || config.listId.trim() === '')) {
    errors.push(validationError('listId', 'List ID is required when not removing from all lists'))
  }

  if (!config.emailField || config.emailField.trim() === '') {
    errors.push(validationError('emailField', 'Email field is required'))
  }

  return errors
}

/**
 * Remove from List Node Definition
 */
export const removeFromListNode: NodeDefinition<RemoveFromListConfig> = {
  type: EMAIL_NODE_TYPES.REMOVE_FROM_LIST,
  name: 'Remove from List',
  description: 'Remove a contact from an email list',
  category: 'action',
  icon: 'user-minus',
  configSchema: {
    fields: [
      {
        key: 'listId',
        label: 'List',
        type: 'select',
        required: false,
        description: 'The email list to remove the contact from',
      },
      {
        key: 'emailField',
        label: 'Email Field',
        type: 'text',
        required: true,
        defaultValue: 'email',
        placeholder: 'email',
        description: 'Field path containing the email address in input data',
      },
      {
        key: 'removeFromAllLists',
        label: 'Remove from All Lists',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Remove the contact from all lists instead of a specific one',
      },
      {
        key: 'deleteContact',
        label: 'Delete Contact',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Permanently delete the contact instead of just removing from the list',
      },
    ],
  },
  inputHandles: [{ id: 'input', name: 'Contact', type: 'default' }],
  outputHandles: [
    { id: 'success', name: 'Success', type: 'success' },
    { id: 'failure', name: 'Failure', type: 'failure' },
  ],
  execute,
  validate,
}
