/**
 * Add to List Action Node
 * Adds a contact to an email list
 */

import type { NodeDefinition, ExecutionContext, ExecutionResult, ValidationError } from '../../../types/nodes'
import type { AddToListConfig, ListOperationResult } from '../../../types/email-nodes'
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
 * Execute the add to list action
 */
async function execute(
  node: { config: AddToListConfig },
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

  // Resolve list ID (might be templated)
  const listId = resolveTemplate(config.listId, templateData)
  if (!listId) {
    return failureResult('List ID is required', startTime)
  }

  // Build contact data from additional fields
  const contactData: Record<string, unknown> = { email }
  if (config.additionalFields) {
    for (const mapping of config.additionalFields) {
      const value = getNestedValue(input, mapping.sourceField)
      if (value !== undefined) {
        contactData[mapping.targetField] = value
      }
    }
  }

  try {
    // Add contact to list via integration
    const result = await addContactToList(
      {
        listId,
        email,
        contactData,
        updateIfExists: config.updateIfExists ?? true,
        tags: config.tags,
      },
      emailCredentials
    )

    const output: ListOperationResult = {
      email,
      listId,
      action: result.action,
      contactId: result.contactId,
    }

    return successResult(output as unknown as Record<string, unknown>, startTime)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add contact to list'
    return failureResult(errorMessage, startTime, { email, listId })
  }
}

/**
 * Add a contact to an email list
 */
async function addContactToList(
  params: {
    listId: string
    email: string
    contactData: Record<string, unknown>
    updateIfExists: boolean
    tags?: string[]
  },
  credentials: Record<string, unknown>
): Promise<{ action: 'added' | 'updated' | 'skipped'; contactId: string }> {
  const provider = credentials.provider as string

  switch (provider) {
    case 'sendgrid':
      return addToSendGridList(params, credentials)
    case 'mailchimp':
      return addToMailchimpList(params, credentials)
    case 'convertkit':
      return addToConvertKitList(params, credentials)
    default:
      // Generic implementation
      return addToGenericList(params, credentials)
  }
}

// Provider-specific implementations (stubs)
async function addToSendGridList(
  params: {
    listId: string
    email: string
    contactData: Record<string, unknown>
    updateIfExists: boolean
    tags?: string[]
  },
  credentials: Record<string, unknown>
): Promise<{ action: 'added' | 'updated' | 'skipped'; contactId: string }> {
  // TODO: Implement SendGrid Contacts API
  void params
  void credentials
  return { action: 'added', contactId: `sg_contact_${Date.now()}` }
}

async function addToMailchimpList(
  params: {
    listId: string
    email: string
    contactData: Record<string, unknown>
    updateIfExists: boolean
    tags?: string[]
  },
  credentials: Record<string, unknown>
): Promise<{ action: 'added' | 'updated' | 'skipped'; contactId: string }> {
  // TODO: Implement Mailchimp API
  void params
  void credentials
  return { action: 'added', contactId: `mc_contact_${Date.now()}` }
}

async function addToConvertKitList(
  params: {
    listId: string
    email: string
    contactData: Record<string, unknown>
    updateIfExists: boolean
    tags?: string[]
  },
  credentials: Record<string, unknown>
): Promise<{ action: 'added' | 'updated' | 'skipped'; contactId: string }> {
  // TODO: Implement ConvertKit API
  void params
  void credentials
  return { action: 'added', contactId: `ck_contact_${Date.now()}` }
}

async function addToGenericList(
  params: {
    listId: string
    email: string
    contactData: Record<string, unknown>
    updateIfExists: boolean
    tags?: string[]
  },
  credentials: Record<string, unknown>
): Promise<{ action: 'added' | 'updated' | 'skipped'; contactId: string }> {
  // Generic implementation - would store in database
  void params
  void credentials
  return { action: 'added', contactId: `contact_${Date.now()}` }
}

/**
 * Validate add to list configuration
 */
function validate(config: AddToListConfig): ValidationError[] {
  const errors: ValidationError[] = []

  if (!config.listId || config.listId.trim() === '') {
    errors.push(validationError('listId', 'List ID is required'))
  }

  if (!config.emailField || config.emailField.trim() === '') {
    errors.push(validationError('emailField', 'Email field is required'))
  }

  if (config.additionalFields) {
    for (let i = 0; i < config.additionalFields.length; i++) {
      const mapping = config.additionalFields[i]
      if (!mapping.sourceField) {
        errors.push(validationError(`additionalFields[${i}].sourceField`, 'Source field is required'))
      }
      if (!mapping.targetField) {
        errors.push(validationError(`additionalFields[${i}].targetField`, 'Target field is required'))
      }
    }
  }

  return errors
}

/**
 * Add to List Node Definition
 */
export const addToListNode: NodeDefinition<AddToListConfig> = {
  type: EMAIL_NODE_TYPES.ADD_TO_LIST,
  name: 'Add to List',
  description: 'Add a contact to an email list',
  category: 'action',
  icon: 'user-plus',
  configSchema: {
    fields: [
      {
        key: 'listId',
        label: 'List',
        type: 'select',
        required: true,
        description: 'The email list to add the contact to',
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
        key: 'additionalFields',
        label: 'Additional Fields',
        type: 'json',
        required: false,
        description: 'Map input fields to list contact fields',
      },
      {
        key: 'updateIfExists',
        label: 'Update if Exists',
        type: 'boolean',
        required: false,
        defaultValue: true,
        description: 'Update existing contact data if the email already exists',
      },
      {
        key: 'tags',
        label: 'Tags',
        type: 'multiselect',
        required: false,
        description: 'Tags to add to the contact',
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
