export const SENDGRID_CONFIG = {
  type: "sendgrid",
  displayName: "SendGrid",
  description: "Email sending and management platform by Twilio",
  authType: "api_key" as const,
  requiredFields: ["apiKey"],
  apiBaseUrl: "https://api.sendgrid.com/v3",
  webhookEvents: [
    "processed",
    "dropped",
    "delivered",
    "deferred",
    "bounce",
    "open",
    "click",
    "spam_report",
    "unsubscribe",
    "group_unsubscribe",
    "group_resubscribe",
  ],
} as const;

export const SENDGRID_ACTIONS = {
  SEND_EMAIL: "send_email",
  SEND_TEMPLATE_EMAIL: "send_template_email",
  GET_TEMPLATES: "get_templates",
  CREATE_TEMPLATE: "create_template",
  UPDATE_TEMPLATE: "update_template",
  DELETE_TEMPLATE: "delete_template",
  SYNC_TEMPLATES: "sync_templates",
  GET_LISTS: "get_lists",
  CREATE_LIST: "create_list",
  DELETE_LIST: "delete_list",
  ADD_CONTACTS: "add_contacts",
  REMOVE_CONTACTS: "remove_contacts",
  GET_CONTACTS: "get_contacts",
} as const;

export const SENDGRID_TRIGGERS = {
  EMAIL_DELIVERED: "email_delivered",
  EMAIL_OPENED: "email_opened",
  EMAIL_CLICKED: "email_clicked",
  EMAIL_BOUNCED: "email_bounced",
  EMAIL_DROPPED: "email_dropped",
  UNSUBSCRIBE: "unsubscribe",
  SPAM_REPORT: "spam_report",
} as const;

export type SendGridAction = (typeof SENDGRID_ACTIONS)[keyof typeof SENDGRID_ACTIONS];
export type SendGridTrigger = (typeof SENDGRID_TRIGGERS)[keyof typeof SENDGRID_TRIGGERS];
