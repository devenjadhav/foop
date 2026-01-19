/**
 * Bulk Send Email Action Node
 * Sends emails to multiple recipients with batching and rate limiting
 */

import type { NodeDefinition, ExecutionContext, ExecutionResult, ValidationError } from '../../../types/nodes'
import type { BulkSendConfig, BulkSendResult } from '../../../types/email-nodes'
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
  batchArray,
  sleep,
} from '../utils'

const DEFAULT_BATCH_SIZE = 100
const DEFAULT_BATCH_DELAY_MS = 1000

/**
 * Execute the bulk send email action
 */
async function execute(
  node: { config: BulkSendConfig },
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

  // Get recipients based on source
  let recipients: Record<string, unknown>[]
  try {
    recipients = await getRecipients(config, input, context)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get recipients'
    return failureResult(errorMessage, startTime)
  }

  if (recipients.length === 0) {
    return successResult(
      {
        totalRecipients: 0,
        sent: 0,
        failed: 0,
        skipped: 0,
        messageIds: [],
        errors: [],
      } as unknown as Record<string, unknown>,
      startTime
    )
  }

  // Track results
  const result: BulkSendResult = {
    totalRecipients: recipients.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    messageIds: [],
    errors: [],
  }

  // Track sent emails to skip duplicates if configured
  const sentEmails = new Set<string>()

  // Process in batches
  const batchSize = config.batchSize || DEFAULT_BATCH_SIZE
  const batchDelay = config.batchDelayMs || DEFAULT_BATCH_DELAY_MS
  const batches = batchArray(recipients, batchSize)

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex]

    // Process batch
    const batchPromises = batch.map(async (recipient) => {
      const emailField = config.recipientField || 'email'
      const email = getNestedValue(recipient, emailField) as string

      // Validate email
      if (!email || !isValidEmail(email)) {
        result.failed++
        result.errors.push({ email: email || 'unknown', error: 'Invalid email address' })
        return
      }

      // Skip duplicates if configured
      if (config.skipDuplicates && sentEmails.has(email.toLowerCase())) {
        result.skipped++
        return
      }

      // Build personalization data
      const personalizationData: Record<string, unknown> = { ...recipient }
      if (config.personalizationFields) {
        for (const field of config.personalizationFields) {
          personalizationData[field] = getNestedValue(recipient, field)
        }
      }

      // Merge with context for template resolution
      const templateData = mergeInputWithContext(personalizationData, context)

      // Resolve templates
      const subject = resolveTemplate(config.subject, templateData)
      const body = resolveTemplate(config.body, templateData)

      try {
        const sendResult = await sendSingleEmail(
          {
            to: email,
            subject,
            body,
            bodyType: config.bodyType || 'html',
            templateId: config.templateId,
            tracking: {
              opens: config.trackOpens ?? true,
              clicks: config.trackClicks ?? true,
            },
          },
          emailCredentials
        )

        result.sent++
        result.messageIds.push(sendResult.messageId)
        sentEmails.add(email.toLowerCase())
      } catch (error) {
        result.failed++
        result.errors.push({
          email,
          error: error instanceof Error ? error.message : 'Send failed',
        })
      }
    })

    await Promise.all(batchPromises)

    // Delay between batches (except for last batch)
    if (batchIndex < batches.length - 1) {
      await sleep(batchDelay)
    }
  }

  return successResult(result as unknown as Record<string, unknown>, startTime)
}

/**
 * Get recipients based on configuration
 */
async function getRecipients(
  config: BulkSendConfig,
  input: Record<string, unknown>,
  context: ExecutionContext
): Promise<Record<string, unknown>[]> {
  switch (config.recipientSource) {
    case 'input':
      // Recipients from workflow input
      if (Array.isArray(input)) {
        return input as Record<string, unknown>[]
      }
      if (Array.isArray(input.recipients)) {
        return input.recipients as Record<string, unknown>[]
      }
      if (Array.isArray(input.contacts)) {
        return input.contacts as Record<string, unknown>[]
      }
      if (Array.isArray(input.data)) {
        return input.data as Record<string, unknown>[]
      }
      throw new Error('Input does not contain a valid recipients array')

    case 'list':
      // Recipients from an email list
      if (!config.recipientListId) {
        throw new Error('List ID is required when source is "list"')
      }
      return await fetchListRecipients(config.recipientListId, context)

    case 'query':
      // Recipients from a database query (would be implemented based on data source)
      throw new Error('Query-based recipients not yet implemented')

    default:
      throw new Error(`Unknown recipient source: ${config.recipientSource}`)
  }
}

/**
 * Fetch recipients from an email list
 */
async function fetchListRecipients(
  listId: string,
  context: ExecutionContext
): Promise<Record<string, unknown>[]> {
  // TODO: Implement list fetching from database/integration
  // This would query the email list service or database
  void listId
  void context
  return []
}

/**
 * Send a single email
 */
async function sendSingleEmail(
  payload: {
    to: string
    subject: string
    body: string
    bodyType: string
    templateId?: string
    tracking: { opens: boolean; clicks: boolean }
  },
  credentials: Record<string, unknown>
): Promise<{ messageId: string }> {
  // TODO: Implement actual email sending
  // This would use the same provider logic as send-email.ts
  void credentials
  return { messageId: `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }
}

/**
 * Validate bulk send configuration
 */
function validate(config: BulkSendConfig): ValidationError[] {
  const errors: ValidationError[] = []

  if (!config.recipientSource) {
    errors.push(validationError('recipientSource', 'Recipient source is required'))
  }

  if (config.recipientSource === 'list' && !config.recipientListId) {
    errors.push(validationError('recipientListId', 'List ID is required when source is "list"'))
  }

  if (!config.subject || config.subject.trim() === '') {
    errors.push(validationError('subject', 'Subject is required'))
  }

  if (!config.body || config.body.trim() === '') {
    errors.push(validationError('body', 'Email body is required'))
  }

  if (config.bodyType && !['text', 'html'].includes(config.bodyType)) {
    errors.push(validationError('bodyType', 'Body type must be "text" or "html"'))
  }

  if (config.batchSize !== undefined && (config.batchSize < 1 || config.batchSize > 1000)) {
    errors.push(validationError('batchSize', 'Batch size must be between 1 and 1000'))
  }

  if (config.batchDelayMs !== undefined && config.batchDelayMs < 0) {
    errors.push(validationError('batchDelayMs', 'Batch delay cannot be negative'))
  }

  return errors
}

/**
 * Bulk Send Email Node Definition
 */
export const bulkSendNode: NodeDefinition<BulkSendConfig> = {
  type: EMAIL_NODE_TYPES.BULK_SEND,
  name: 'Bulk Send Email',
  description: 'Send emails to multiple recipients with batching and rate limiting',
  category: 'action',
  icon: 'mails',
  configSchema: {
    fields: [
      {
        key: 'recipientSource',
        label: 'Recipient Source',
        type: 'select',
        required: true,
        options: [
          { label: 'From Input', value: 'input' },
          { label: 'From List', value: 'list' },
          { label: 'From Query', value: 'query' },
        ],
        description: 'Where to get the list of recipients',
      },
      {
        key: 'recipientListId',
        label: 'List ID',
        type: 'text',
        required: false,
        description: 'ID of the email list (required if source is "list")',
      },
      {
        key: 'recipientField',
        label: 'Email Field',
        type: 'text',
        required: false,
        defaultValue: 'email',
        placeholder: 'email',
        description: 'Field name containing the email address in recipient data',
      },
      {
        key: 'subject',
        label: 'Subject',
        type: 'text',
        required: true,
        placeholder: 'Hello {{firstName}}!',
        description: 'Email subject line. Supports personalization variables.',
      },
      {
        key: 'body',
        label: 'Body',
        type: 'template',
        required: true,
        description: 'Email body content. Supports personalization variables and HTML.',
      },
      {
        key: 'bodyType',
        label: 'Body Type',
        type: 'select',
        required: false,
        defaultValue: 'html',
        options: [
          { label: 'HTML', value: 'html' },
          { label: 'Plain Text', value: 'text' },
        ],
      },
      {
        key: 'personalizationFields',
        label: 'Personalization Fields',
        type: 'multiselect',
        required: false,
        description: 'Fields to include for email personalization',
      },
      {
        key: 'batchSize',
        label: 'Batch Size',
        type: 'number',
        required: false,
        defaultValue: 100,
        description: 'Number of emails to send per batch',
        validation: { min: 1, max: 1000 },
      },
      {
        key: 'batchDelayMs',
        label: 'Batch Delay (ms)',
        type: 'number',
        required: false,
        defaultValue: 1000,
        description: 'Delay between batches in milliseconds',
        validation: { min: 0 },
      },
      {
        key: 'skipDuplicates',
        label: 'Skip Duplicates',
        type: 'boolean',
        required: false,
        defaultValue: true,
        description: 'Skip sending to the same email twice in this execution',
      },
      {
        key: 'trackOpens',
        label: 'Track Opens',
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
      {
        key: 'trackClicks',
        label: 'Track Clicks',
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
    ],
  },
  inputHandles: [{ id: 'input', name: 'Recipients', type: 'default' }],
  outputHandles: [
    { id: 'success', name: 'Success', type: 'success' },
    { id: 'failure', name: 'Failure', type: 'failure' },
  ],
  execute,
  validate,
}
