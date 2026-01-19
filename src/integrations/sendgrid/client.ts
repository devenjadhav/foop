import { SENDGRID_CONFIG } from "./config";
import { SendGridAuth } from "./auth";
import type {
  SendGridCredentials,
  SendEmailRequest,
  SendEmailResponse,
  Template,
  TemplateVersion,
  CreateTemplateRequest,
  UpdateTemplateVersionRequest,
  Contact,
  ContactList,
  CreateContactListRequest,
  AddContactsRequest,
  AddContactsResponse,
  RemoveContactsResponse,
  EmailAddress,
  PaginatedResponse,
} from "./types";

export class SendGridClient {
  private auth: SendGridAuth;
  private baseUrl: string;

  constructor(credentials: SendGridCredentials) {
    this.auth = new SendGridAuth(credentials);
    this.baseUrl = SENDGRID_CONFIG.apiBaseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.auth.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new SendGridError(
        error.errors?.[0]?.message || `HTTP ${response.status}`,
        response.status,
        error.errors
      );
    }

    // Handle 202 Accepted (no content) responses
    if (response.status === 202 || response.status === 204) {
      const messageId = response.headers.get("X-Message-Id");
      return { messageId, status: "accepted" } as T;
    }

    return response.json();
  }

  async validate(): Promise<boolean> {
    return this.auth.validate();
  }

  async testConnection() {
    return this.auth.testConnection();
  }

  // ============================================
  // Email Operations
  // ============================================

  async sendEmail(options: {
    to: string | string[] | EmailAddress | EmailAddress[];
    from: string | EmailAddress;
    subject: string;
    html?: string;
    text?: string;
    templateId?: string;
    dynamicTemplateData?: Record<string, unknown>;
    attachments?: SendEmailRequest["attachments"];
    categories?: string[];
    replyTo?: string | EmailAddress;
    sendAt?: number;
    sandboxMode?: boolean;
  }): Promise<SendEmailResponse> {
    const toAddresses = this.normalizeEmailAddresses(options.to);
    const fromAddress = this.normalizeEmailAddress(options.from);

    const request: SendEmailRequest = {
      personalizations: [
        {
          to: toAddresses,
          ...(options.dynamicTemplateData && {
            dynamicTemplateData: options.dynamicTemplateData,
          }),
        },
      ],
      from: fromAddress,
      ...(options.subject && { subject: options.subject }),
      ...(options.templateId && { templateId: options.templateId }),
      ...(options.replyTo && {
        replyTo: this.normalizeEmailAddress(options.replyTo),
      }),
      ...(options.attachments && { attachments: options.attachments }),
      ...(options.categories && { categories: options.categories }),
      ...(options.sendAt && { sendAt: options.sendAt }),
    };

    // Add content if not using a template
    if (!options.templateId) {
      request.content = [];
      if (options.text) {
        request.content.push({ type: "text/plain", value: options.text });
      }
      if (options.html) {
        request.content.push({ type: "text/html", value: options.html });
      }
    }

    // Enable sandbox mode if requested
    if (options.sandboxMode) {
      request.mailSettings = {
        sandboxMode: { enable: true },
      };
    }

    return this.request<SendEmailResponse>("/mail/send", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async sendTemplateEmail(options: {
    to: string | string[] | EmailAddress | EmailAddress[];
    from: string | EmailAddress;
    templateId: string;
    dynamicTemplateData?: Record<string, unknown>;
    categories?: string[];
    replyTo?: string | EmailAddress;
  }): Promise<SendEmailResponse> {
    return this.sendEmail({
      ...options,
      subject: "", // Subject comes from template
    });
  }

  // ============================================
  // Template Operations
  // ============================================

  async getTemplates(options?: {
    generations?: ("legacy" | "dynamic")[];
    pageSize?: number;
    pageToken?: string;
  }): Promise<{ result: Template[]; metadata?: { next?: string } }> {
    const params = new URLSearchParams();
    if (options?.generations) {
      params.set("generations", options.generations.join(","));
    }
    if (options?.pageSize) {
      params.set("page_size", options.pageSize.toString());
    }
    if (options?.pageToken) {
      params.set("page_token", options.pageToken);
    }

    const query = params.toString();
    return this.request<{ result: Template[]; metadata?: { next?: string } }>(
      `/templates${query ? `?${query}` : ""}`
    );
  }

  async getTemplate(templateId: string): Promise<Template> {
    return this.request<Template>(`/templates/${templateId}`);
  }

  async createTemplate(data: CreateTemplateRequest): Promise<Template> {
    return this.request<Template>("/templates", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        generation: data.generation || "dynamic",
      }),
    });
  }

  async updateTemplate(
    templateId: string,
    data: { name: string }
  ): Promise<Template> {
    return this.request<Template>(`/templates/${templateId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(templateId: string): Promise<void> {
    await this.request<void>(`/templates/${templateId}`, {
      method: "DELETE",
    });
  }

  async createTemplateVersion(
    templateId: string,
    data: UpdateTemplateVersionRequest
  ): Promise<TemplateVersion> {
    return this.request<TemplateVersion>(
      `/templates/${templateId}/versions`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async updateTemplateVersion(
    templateId: string,
    versionId: string,
    data: UpdateTemplateVersionRequest
  ): Promise<TemplateVersion> {
    return this.request<TemplateVersion>(
      `/templates/${templateId}/versions/${versionId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  }

  async activateTemplateVersion(
    templateId: string,
    versionId: string
  ): Promise<TemplateVersion> {
    return this.request<TemplateVersion>(
      `/templates/${templateId}/versions/${versionId}/activate`,
      {
        method: "POST",
      }
    );
  }

  async syncTemplates(): Promise<Template[]> {
    const allTemplates: Template[] = [];
    let pageToken: string | undefined;

    do {
      const response = await this.getTemplates({
        generations: ["dynamic", "legacy"],
        pageSize: 50,
        pageToken,
      });

      allTemplates.push(...response.result);

      // Extract next page token from metadata
      pageToken = response.metadata?.next
        ? new URL(response.metadata.next).searchParams.get("page_token") ||
          undefined
        : undefined;
    } while (pageToken);

    return allTemplates;
  }

  // ============================================
  // Contact List Operations
  // ============================================

  async getLists(): Promise<PaginatedResponse<ContactList>> {
    return this.request<PaginatedResponse<ContactList>>(
      "/marketing/lists"
    );
  }

  async getList(listId: string): Promise<ContactList> {
    return this.request<ContactList>(`/marketing/lists/${listId}`);
  }

  async createList(data: CreateContactListRequest): Promise<ContactList> {
    return this.request<ContactList>("/marketing/lists", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateList(
    listId: string,
    data: { name: string }
  ): Promise<ContactList> {
    return this.request<ContactList>(`/marketing/lists/${listId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteList(
    listId: string,
    deleteContacts: boolean = false
  ): Promise<void> {
    const params = new URLSearchParams();
    params.set("delete_contacts", deleteContacts.toString());
    await this.request<void>(
      `/marketing/lists/${listId}?${params.toString()}`,
      {
        method: "DELETE",
      }
    );
  }

  // ============================================
  // Contact Operations
  // ============================================

  async addContacts(data: AddContactsRequest): Promise<AddContactsResponse> {
    return this.request<AddContactsResponse>("/marketing/contacts", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async addContactsToList(
    listId: string,
    contacts: Contact[]
  ): Promise<AddContactsResponse> {
    return this.addContacts({
      listIds: [listId],
      contacts,
    });
  }

  async removeContactsFromList(
    listId: string,
    contactIds: string[]
  ): Promise<RemoveContactsResponse> {
    const params = new URLSearchParams();
    params.set("contact_ids", contactIds.join(","));
    return this.request<RemoveContactsResponse>(
      `/marketing/lists/${listId}/contacts?${params.toString()}`,
      {
        method: "DELETE",
      }
    );
  }

  async getContacts(options?: {
    pageSize?: number;
    pageToken?: string;
  }): Promise<PaginatedResponse<Contact>> {
    const params = new URLSearchParams();
    if (options?.pageSize) {
      params.set("page_size", options.pageSize.toString());
    }
    if (options?.pageToken) {
      params.set("page_token", options.pageToken);
    }

    const query = params.toString();
    return this.request<PaginatedResponse<Contact>>(
      `/marketing/contacts${query ? `?${query}` : ""}`
    );
  }

  async getContact(contactId: string): Promise<Contact> {
    return this.request<Contact>(`/marketing/contacts/${contactId}`);
  }

  async searchContacts(query: string): Promise<{ result: Contact[] }> {
    return this.request<{ result: Contact[] }>("/marketing/contacts/search", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  }

  async deleteContacts(
    contactIds: string[] | "all"
  ): Promise<{ jobId: string }> {
    if (contactIds === "all") {
      return this.request<{ jobId: string }>(
        "/marketing/contacts?delete_all_contacts=true",
        {
          method: "DELETE",
        }
      );
    }

    const params = new URLSearchParams();
    params.set("ids", contactIds.join(","));
    return this.request<{ jobId: string }>(
      `/marketing/contacts?${params.toString()}`,
      {
        method: "DELETE",
      }
    );
  }

  async getContactsByEmails(
    emails: string[]
  ): Promise<{ result: Record<string, Contact> }> {
    return this.request<{ result: Record<string, Contact> }>(
      "/marketing/contacts/search/emails",
      {
        method: "POST",
        body: JSON.stringify({ emails }),
      }
    );
  }

  // ============================================
  // Helper Methods
  // ============================================

  private normalizeEmailAddress(
    email: string | EmailAddress
  ): EmailAddress {
    if (typeof email === "string") {
      return { email };
    }
    return email;
  }

  private normalizeEmailAddresses(
    emails: string | string[] | EmailAddress | EmailAddress[]
  ): EmailAddress[] {
    if (typeof emails === "string") {
      return [{ email: emails }];
    }
    if (Array.isArray(emails)) {
      return emails.map((e) => this.normalizeEmailAddress(e));
    }
    return [this.normalizeEmailAddress(emails)];
  }
}

export class SendGridError extends Error {
  statusCode: number;
  errors?: Array<{ message: string; field?: string }>;

  constructor(
    message: string,
    statusCode: number,
    errors?: Array<{ message: string; field?: string }>
  ) {
    super(message);
    this.name = "SendGridError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
