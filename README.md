# Foop - B2B Automation SaaS

## SendGrid Connector

Email sending and management integration via SendGrid API.

### Features

- **API Key Authentication** - Secure credential validation with connection testing
- **Send Email** - Send transactional emails with or without templates
- **Template Sync** - Fetch and manage SendGrid email templates
- **List Management** - Create, update, and delete contact lists
- **Contact Management** - Add, remove, and search contacts

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/integrations/sendgrid/auth` | POST | Validate API key credentials |
| `/api/integrations/sendgrid/send` | POST | Send an email |
| `/api/integrations/sendgrid/templates` | GET | List all templates (?sync=true for full sync) |
| `/api/integrations/sendgrid/templates` | POST | Create a new template |
| `/api/integrations/sendgrid/templates/[id]` | GET/PATCH/DELETE | Manage specific template |
| `/api/integrations/sendgrid/lists` | GET | List all contact lists |
| `/api/integrations/sendgrid/lists` | POST | Create a new contact list |
| `/api/integrations/sendgrid/lists/[id]` | GET/PATCH/DELETE | Manage specific list |
| `/api/integrations/sendgrid/lists/[id]/contacts` | POST/DELETE | Add/remove contacts from list |
| `/api/integrations/sendgrid/contacts` | GET/PUT/DELETE | Manage contacts |
| `/api/integrations/sendgrid/contacts/search` | POST | Search contacts by query or emails |

### Usage

```typescript
import { SendGridClient } from "@/integrations/sendgrid";

const client = new SendGridClient({ apiKey: "SG.xxx" });

// Send email
await client.sendEmail({
  to: "recipient@example.com",
  from: "sender@example.com",
  subject: "Hello",
  html: "<p>Hello World</p>",
});

// Send template email
await client.sendTemplateEmail({
  to: "recipient@example.com",
  from: "sender@example.com",
  templateId: "d-xxxxx",
  dynamicTemplateData: { name: "John" },
});

// Sync templates
const templates = await client.syncTemplates();

// Manage lists
const list = await client.createList({ name: "Newsletter" });
await client.addContactsToList(list.id, [{ email: "user@example.com" }]);
```
