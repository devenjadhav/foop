/**
 * Send Email Action Node
 * Sends a single email to a specified recipient
 */

import type { NodeDefinition, ExecutionContext, ExecutionResult, ValidationError } from '../../../types/nodes'
import type { SendEmailConfig, SendEmailResult } from '../../../types/email-nodes'
import { EMAIL_NODE_TYPES } from '../../../types/email-nodes'
import {
  resolveTemplate,
  mergeInputWithContext,
  isValidEmail,
  successResult,
  failureResult,
  validationError,
  getIntegration,
} from '../utils'

/**
 * Execute the send email action
 */
async function execute(
  node: { config: SendEmailConfig },
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

  // Resolve template variables in email fields
  const to = resolveTemplate(config.to, templateData)
  const subject = resolveTemplate(config.subject, templateData)
  const body = resolveTemplate(config.body, templateData)
  const replyTo = config.replyTo ? resolveTemplate(config.replyTo, templateData) : undefined
  const cc = config.cc ? resolveTemplate(config.cc, templateData) : undefined
  const bcc = config.bcc ? resolveTemplate(config.bcc, templateData) : undefined

  // Validate resolved email
  if (!isValidEmail(to)) {
    return failureResult(`Invalid recipient email address: ${to}`, startTime)
  }

  // Build email payload
  const emailPayload = {
    to,
    subject,
    body,
    bodyType: config.bodyType || 'html',
    replyTo,
    cc,
    bcc,
    templateId: config.templateId,
    attachments: config.attachments,
    tracking: {
      opens: config.trackOpens ?? true,
      clicks: config.trackClicks ?? true,
    },
  }

  try {
    // Send email via integration
    // This would call the actual email service (SendGrid, Mailgun, etc.)
    const result = await sendViaIntegration(emailPayload, emailCredentials)

    const output: SendEmailResult = {
      messageId: result.messageId,
      to,
      status: result.status,
    }

    return successResult(output as unknown as Record<string, unknown>, startTime)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error sending email'
    return failureResult(errorMessage, startTime, { to })
  }
}

/**
 * Validate send email configuration
 */
function validate(config: SendEmailConfig): ValidationError[] {
  const errors: ValidationError[] = []

  if (!config.to || config.to.trim() === '') {
    errors.push(validationError('to', 'Recipient email is required'))
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

  // Validate static emails (non-template)
  if (config.to && !config.to.includes('{{') && !isValidEmail(config.to)) {
    errors.push(validationError('to', 'Invalid email address format'))
  }

  if (config.cc && !config.cc.includes('{{') && !isValidEmail(config.cc)) {
    errors.push(validationError('cc', 'Invalid CC email address format'))
  }

  if (config.bcc && !config.bcc.includes('{{') && !isValidEmail(config.bcc)) {
    errors.push(validationError('bcc', 'Invalid BCC email address format'))
  }

  return errors
}

/**
 * Send email via the configured integration
 * This is a placeholder that would be replaced with actual integration logic
 */
async function sendViaIntegration(
  payload: {
    to: string
    subject: string
    body: string
    bodyType: string
    replyTo?: string
    cc?: string
    bcc?: string
    templateId?: string
    attachments?: unknown[]
    tracking: { opens: boolean; clicks: boolean }
  },
  credentials: Record<string, unknown>
): Promise<{ messageId: string; status: 'sent' | 'queued' }> {
  // Determine which email provider to use based on credentials
  const provider = credentials.provider as string

  switch (provider) {
    case 'sendgrid':
      return sendViaSendGrid(payload, credentials)
    case 'mailgun':
      return sendViaMailgun(payload, credentials)
    case 'ses':
      return sendViaSES(payload, credentials)
    case 'smtp':
      return sendViaSMTP(payload, credentials)
    default:
      throw new Error(`Unsupported email provider: ${provider}`)
  }
}

// Provider-specific implementations (stubs for now)
async function sendViaSendGrid(
  payload: unknown,
  credentials: Record<string, unknown>
): Promise<{ messageId: string; status: 'sent' | 'queued' }> {
  // TODO: Implement SendGrid integration
  // Would use @sendgrid/mail package
  void payload
  void credentials
  return { messageId: `sg_${Date.now()}`, status: 'sent' }
}

async function sendViaMailgun(
  payload: unknown,
  credentials: Record<string, unknown>
): Promise<{ messageId: string; status: 'sent' | 'queued' }> {
  // TODO: Implement Mailgun integration
  // Would use mailgun.js package
  void payload
  void credentials
  return { messageId: `mg_${Date.now()}`, status: 'sent' }
}

async function sendViaSES(
  payload: unknown,
  credentials: Record<string, unknown>
): Promise<{ messageId: string; status: 'sent' | 'queued' }> {
  // TODO: Implement AWS SES integration
  // Would use @aws-sdk/client-ses package
  void payload
  void credentials
  return { messageId: `ses_${Date.now()}`, status: 'sent' }
}

async function sendViaSMTP(
  payload: unknown,
  credentials: Record<string, unknown>
): Promise<{ messageId: string; status: 'sent' | 'queued' }> {
  // TODO: Implement SMTP integration
  // Would use nodemailer package
  void payload
  void credentials
  return { messageId: `smtp_${Date.now()}`, status: 'sent' }
}

/**
 * Send Email Node Definition
 */
export const sendEmailNode: NodeDefinition<SendEmailConfig> = {
  type: EMAIL_NODE_TYPES.SEND_EMAIL,
  name: 'Send Email',
  description: 'Send an email to a single recipient',
  category: 'action',
  icon: 'mail',
  configSchema: {
    fields: [
      {
        key: 'to',
        label: 'To',
        type: 'text',
        required: true,
        placeholder: '{{contact.email}} or email@example.com',
        description: 'Recipient email address. Supports template variables.',
      },
      {
        key: 'subject',
        label: 'Subject',
        type: 'text',
        required: true,
        placeholder: 'Hello {{contact.firstName}}!',
        description: 'Email subject line. Supports template variables.',
      },
      {
        key: 'body',
        label: 'Body',
        type: 'template',
        required: true,
        description: 'Email body content. Supports template variables and HTML.',
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
        key: 'replyTo',
        label: 'Reply-To',
        type: 'text',
        required: false,
        placeholder: 'reply@example.com',
      },
      {
        key: 'cc',
        label: 'CC',
        type: 'text',
        required: false,
        placeholder: 'cc@example.com',
      },
      {
        key: 'bcc',
        label: 'BCC',
        type: 'text',
        required: false,
        placeholder: 'bcc@example.com',
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
  inputHandles: [{ id: 'input', name: 'Input', type: 'default' }],
  outputHandles: [
    { id: 'success', name: 'Success', type: 'success' },
    { id: 'failure', name: 'Failure', type: 'failure' },
  ],
  execute,
  validate,
}
