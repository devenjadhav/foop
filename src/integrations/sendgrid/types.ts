export interface SendGridCredentials {
  apiKey: string;
}

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface Attachment {
  content: string;
  filename: string;
  type?: string;
  disposition?: "attachment" | "inline";
  contentId?: string;
}

export interface Personalization {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject?: string;
  headers?: Record<string, string>;
  substitutions?: Record<string, string>;
  dynamicTemplateData?: Record<string, unknown>;
  customArgs?: Record<string, string>;
  sendAt?: number;
}

export interface SendEmailRequest {
  personalizations: Personalization[];
  from: EmailAddress;
  replyTo?: EmailAddress;
  subject?: string;
  content?: Array<{
    type: string;
    value: string;
  }>;
  attachments?: Attachment[];
  templateId?: string;
  categories?: string[];
  sendAt?: number;
  batchId?: string;
  asm?: {
    groupId: number;
    groupsToDisplay?: number[];
  };
  mailSettings?: {
    bypassListManagement?: { enable: boolean };
    sandboxMode?: { enable: boolean };
  };
  trackingSettings?: {
    clickTracking?: { enable: boolean; enableText?: boolean };
    openTracking?: { enable: boolean; substitutionTag?: string };
    subscriptionTracking?: {
      enable: boolean;
      text?: string;
      html?: string;
      substitutionTag?: string;
    };
  };
}

export interface SendEmailResponse {
  messageId: string;
  status: "accepted" | "queued";
}

export interface Template {
  id: string;
  name: string;
  generation: "legacy" | "dynamic";
  updatedAt: string;
  versions?: TemplateVersion[];
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  active: number;
  name: string;
  htmlContent?: string;
  plainContent?: string;
  subject?: string;
  updatedAt: string;
  editor?: string;
  generatePlainContent?: boolean;
}

export interface CreateTemplateRequest {
  name: string;
  generation?: "legacy" | "dynamic";
}

export interface UpdateTemplateVersionRequest {
  name?: string;
  subject?: string;
  htmlContent?: string;
  plainContent?: string;
  active?: number;
  editor?: string;
  generatePlainContent?: boolean;
}

export interface Contact {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  alternateEmails?: string[];
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvinceRegion?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  whatsapp?: string;
  line?: string;
  facebook?: string;
  uniqueName?: string;
  customFields?: Record<string, string | number>;
}

export interface ContactList {
  id: string;
  name: string;
  contactCount: number;
  sampleContacts?: Contact[];
  metadata?: {
    selfLink?: string;
  };
}

export interface CreateContactListRequest {
  name: string;
}

export interface AddContactsRequest {
  listIds?: string[];
  contacts: Contact[];
}

export interface AddContactsResponse {
  jobId: string;
}

export interface RemoveContactsResponse {
  jobId: string;
}

export interface ApiError {
  message: string;
  field?: string;
  errorId?: string;
}

export interface SendGridApiResponse<T> {
  data?: T;
  errors?: ApiError[];
}

export interface PaginatedResponse<T> {
  result: T[];
  metadata?: {
    prev?: string;
    self?: string;
    next?: string;
    count?: number;
  };
}
