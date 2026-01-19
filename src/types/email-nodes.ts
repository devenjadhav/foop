/**
 * Email action node type definitions
 */

import type { BaseNodeConfig, BaseWorkflowNode } from './nodes'

// Email node type identifiers
export const EMAIL_NODE_TYPES = {
  SEND_EMAIL: 'email.send',
  BULK_SEND: 'email.bulk_send',
  ADD_TO_LIST: 'email.list_add',
  REMOVE_FROM_LIST: 'email.list_remove',
} as const

export type EmailNodeType = (typeof EMAIL_NODE_TYPES)[keyof typeof EMAIL_NODE_TYPES]

// Send Email Configuration
export interface SendEmailConfig extends BaseNodeConfig {
  to: string // Single email or variable reference like {{contact.email}}
  subject: string
  body: string
  bodyType: 'text' | 'html'
  templateId?: string // Optional: use a saved template
  replyTo?: string
  cc?: string
  bcc?: string
  attachments?: EmailAttachment[]
  trackOpens?: boolean
  trackClicks?: boolean
}

export interface EmailAttachment {
  filename: string
  url?: string // URL to fetch attachment from
  variablePath?: string // Path to attachment data in context variables
}

// Bulk Send Configuration
export interface BulkSendConfig extends BaseNodeConfig {
  recipientSource: 'input' | 'list' | 'query'
  recipientListId?: string // If source is 'list'
  recipientField?: string // Field containing email in input data (default: 'email')
  subject: string
  body: string
  bodyType: 'text' | 'html'
  templateId?: string
  personalizationFields?: string[] // Fields to include for personalization
  batchSize?: number // Number of emails per batch (default: 100)
  batchDelayMs?: number // Delay between batches in ms (default: 1000)
  trackOpens?: boolean
  trackClicks?: boolean
  skipDuplicates?: boolean // Skip if email was already sent in this execution
}

// Add to List Configuration
export interface AddToListConfig extends BaseNodeConfig {
  listId: string
  emailField: string // Field path to extract email from input (default: 'email')
  additionalFields?: ListFieldMapping[] // Map input fields to list fields
  updateIfExists?: boolean // Update existing contact or skip
  tags?: string[] // Tags to add to the contact
}

export interface ListFieldMapping {
  sourceField: string // Field path in input data
  targetField: string // Field name in the list
}

// Remove from List Configuration
export interface RemoveFromListConfig extends BaseNodeConfig {
  listId: string
  emailField: string // Field path to extract email from input (default: 'email')
  removeFromAllLists?: boolean // If true, ignore listId and remove from all lists
  deleteContact?: boolean // Permanently delete vs just remove from list
}

// Node type definitions with their configs
export type SendEmailNode = BaseWorkflowNode<SendEmailConfig>
export type BulkSendNode = BaseWorkflowNode<BulkSendConfig>
export type AddToListNode = BaseWorkflowNode<AddToListConfig>
export type RemoveFromListNode = BaseWorkflowNode<RemoveFromListConfig>

// Union type for all email nodes
export type EmailNode = SendEmailNode | BulkSendNode | AddToListNode | RemoveFromListNode

// Email execution results
export interface SendEmailResult {
  messageId: string
  to: string
  status: 'sent' | 'queued' | 'failed'
  error?: string
}

export interface BulkSendResult {
  totalRecipients: number
  sent: number
  failed: number
  skipped: number
  messageIds: string[]
  errors: Array<{ email: string; error: string }>
}

export interface ListOperationResult {
  email: string
  listId: string
  action: 'added' | 'updated' | 'removed' | 'deleted' | 'skipped'
  contactId?: string
}
