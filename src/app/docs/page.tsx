import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation | Foop",
  description: "REST API reference, authentication guide, webhook setup, and code examples for Foop",
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono">
      <code>{children}</code>
    </pre>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-border">{title}</h2>
      {children}
    </section>
  );
}

function Endpoint({
  method,
  path,
  description,
  children,
}: {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  children?: React.ReactNode;
}) {
  const methodColors = {
    GET: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    POST: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    PATCH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="border border-border rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <span className={`px-2 py-1 rounded text-xs font-bold ${methodColors[method]}`}>
          {method}
        </span>
        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{path}</code>
      </div>
      <p className="text-muted-foreground mb-3">{description}</p>
      {children}
    </div>
  );
}

function TableOfContents() {
  const sections = [
    { id: "authentication", title: "Authentication" },
    { id: "api-reference", title: "API Reference" },
    { id: "webhooks", title: "Webhooks" },
    { id: "code-examples", title: "Code Examples" },
    { id: "rate-limits", title: "Rate Limits" },
    { id: "errors", title: "Error Handling" },
  ];

  return (
    <nav className="hidden lg:block sticky top-24 w-56 shrink-0">
      <h3 className="font-semibold mb-3 text-sm">On this page</h3>
      <ul className="space-y-2 text-sm">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="font-bold text-xl">Foop</a>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">API Documentation</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">v1.0</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 flex gap-12">
        {/* Main Content */}
        <main className="flex-1 max-w-3xl space-y-12">
          {/* Introduction */}
          <div>
            <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Welcome to the Foop API. This documentation covers authentication, available endpoints,
              webhook configuration, and code examples to help you integrate with our platform.
            </p>
            <div className="flex gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm">
                Base URL: https://api.foop.io/v1
              </span>
            </div>
          </div>

          {/* Authentication */}
          <Section id="authentication" title="Authentication">
            <p className="text-muted-foreground mb-4">
              All API requests require authentication using an API key. Include your API key in the
              <code className="mx-1 px-1.5 py-0.5 bg-muted rounded text-sm">Authorization</code> header.
            </p>

            <h3 className="font-semibold mt-6 mb-3">Getting Your API Key</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-6">
              <li>Log in to your Foop dashboard at <code className="px-1.5 py-0.5 bg-muted rounded text-sm">https://app.foop.io</code></li>
              <li>Navigate to <strong>Settings → API Keys</strong></li>
              <li>Click <strong>Generate New Key</strong></li>
              <li>Copy and securely store your API key</li>
            </ol>

            <h3 className="font-semibold mt-6 mb-3">Authentication Header</h3>
            <CodeBlock>{`curl -X GET "https://api.foop.io/v1/automations" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</CodeBlock>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Security Note:</strong> Never expose your API key in client-side code or public repositories.
                Use environment variables and server-side requests.
              </p>
            </div>
          </Section>

          {/* API Reference */}
          <Section id="api-reference" title="API Reference">
            <p className="text-muted-foreground mb-6">
              The Foop API follows REST conventions. All endpoints return JSON responses
              and accept JSON request bodies where applicable.
            </p>

            <h3 className="font-semibold mt-6 mb-4">Automations</h3>

            <Endpoint method="GET" path="/automations" description="List all automations in your workspace.">
              <h4 className="text-sm font-medium mb-2">Query Parameters</h4>
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Parameter</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="py-2"><code>limit</code></td>
                    <td className="py-2">integer</td>
                    <td className="py-2">Max results (default: 20, max: 100)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2"><code>offset</code></td>
                    <td className="py-2">integer</td>
                    <td className="py-2">Pagination offset</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2"><code>status</code></td>
                    <td className="py-2">string</td>
                    <td className="py-2">Filter by status: active, paused, draft</td>
                  </tr>
                </tbody>
              </table>
            </Endpoint>

            <Endpoint method="POST" path="/automations" description="Create a new automation.">
              <h4 className="text-sm font-medium mb-2">Request Body</h4>
              <CodeBlock>{`{
  "name": "Welcome Email Sequence",
  "trigger": {
    "type": "user_signup",
    "conditions": { "plan": "pro" }
  },
  "actions": [
    {
      "type": "send_email",
      "template_id": "welcome_pro",
      "delay": "0m"
    },
    {
      "type": "send_email",
      "template_id": "onboarding_tips",
      "delay": "24h"
    }
  ]
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="GET" path="/automations/:id" description="Retrieve a specific automation by ID." />

            <Endpoint method="PATCH" path="/automations/:id" description="Update an existing automation.">
              <h4 className="text-sm font-medium mb-2">Request Body</h4>
              <CodeBlock>{`{
  "name": "Updated Automation Name",
  "status": "active"
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="DELETE" path="/automations/:id" description="Delete an automation. This action cannot be undone." />

            <h3 className="font-semibold mt-8 mb-4">Executions</h3>

            <Endpoint method="GET" path="/automations/:id/executions" description="List execution history for an automation.">
              <h4 className="text-sm font-medium mb-2">Response</h4>
              <CodeBlock>{`{
  "data": [
    {
      "id": "exec_abc123",
      "automation_id": "auto_xyz789",
      "status": "completed",
      "started_at": "2025-01-15T10:30:00Z",
      "completed_at": "2025-01-15T10:30:05Z",
      "steps_completed": 3,
      "steps_total": 3
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}`}</CodeBlock>
            </Endpoint>

            <Endpoint method="POST" path="/automations/:id/trigger" description="Manually trigger an automation execution.">
              <h4 className="text-sm font-medium mb-2">Request Body</h4>
              <CodeBlock>{`{
  "context": {
    "user_id": "user_12345",
    "custom_data": { "source": "manual" }
  }
}`}</CodeBlock>
            </Endpoint>

            <h3 className="font-semibold mt-8 mb-4">Users</h3>

            <Endpoint method="GET" path="/users" description="List users in your workspace." />
            <Endpoint method="GET" path="/users/:id" description="Retrieve a specific user." />
            <Endpoint method="POST" path="/users" description="Create a new user record." />
            <Endpoint method="PATCH" path="/users/:id" description="Update user properties." />
          </Section>

          {/* Webhooks */}
          <Section id="webhooks" title="Webhooks">
            <p className="text-muted-foreground mb-6">
              Webhooks allow you to receive real-time notifications when events occur in your Foop workspace.
              Configure webhook endpoints to receive HTTP POST requests with event data.
            </p>

            <h3 className="font-semibold mt-6 mb-3">Setting Up Webhooks</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-6">
              <li>Go to <strong>Settings → Webhooks</strong> in your dashboard</li>
              <li>Click <strong>Add Webhook Endpoint</strong></li>
              <li>Enter your endpoint URL (must be HTTPS)</li>
              <li>Select the events you want to subscribe to</li>
              <li>Copy the signing secret for verification</li>
            </ol>

            <h3 className="font-semibold mt-6 mb-3">Available Events</h3>
            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2">Event</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-2"><code>automation.created</code></td>
                  <td className="py-2">A new automation was created</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>automation.updated</code></td>
                  <td className="py-2">An automation was modified</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>automation.deleted</code></td>
                  <td className="py-2">An automation was deleted</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>execution.started</code></td>
                  <td className="py-2">An automation execution began</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>execution.completed</code></td>
                  <td className="py-2">An automation execution finished successfully</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>execution.failed</code></td>
                  <td className="py-2">An automation execution encountered an error</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>user.created</code></td>
                  <td className="py-2">A new user was added</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>user.updated</code></td>
                  <td className="py-2">User properties were modified</td>
                </tr>
              </tbody>
            </table>

            <h3 className="font-semibold mt-6 mb-3">Webhook Payload</h3>
            <CodeBlock>{`{
  "id": "evt_abc123xyz",
  "type": "execution.completed",
  "created_at": "2025-01-15T10:30:05Z",
  "data": {
    "execution_id": "exec_abc123",
    "automation_id": "auto_xyz789",
    "automation_name": "Welcome Email Sequence",
    "status": "completed",
    "duration_ms": 5230
  }
}`}</CodeBlock>

            <h3 className="font-semibold mt-6 mb-3">Verifying Webhook Signatures</h3>
            <p className="text-muted-foreground mb-4">
              All webhook requests include a signature in the <code className="px-1.5 py-0.5 bg-muted rounded text-sm">X-Foop-Signature</code> header.
              Verify this signature to ensure requests are authentic.
            </p>
            <CodeBlock>{`import crypto from 'crypto';

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}`}</CodeBlock>
          </Section>

          {/* Code Examples */}
          <Section id="code-examples" title="Code Examples">
            <p className="text-muted-foreground mb-6">
              Here are complete examples showing how to integrate with the Foop API in various languages.
            </p>

            <h3 className="font-semibold mt-6 mb-3">JavaScript / TypeScript</h3>
            <CodeBlock>{`// Using fetch API
const FOOP_API_KEY = process.env.FOOP_API_KEY;
const BASE_URL = 'https://api.foop.io/v1';

async function listAutomations() {
  const response = await fetch(\`\${BASE_URL}/automations\`, {
    headers: {
      'Authorization': \`Bearer \${FOOP_API_KEY}\`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(\`API error: \${response.status}\`);
  }

  return response.json();
}

async function createAutomation(data) {
  const response = await fetch(\`\${BASE_URL}/automations\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${FOOP_API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

// Example usage
const automations = await listAutomations();
console.log('Found', automations.data.length, 'automations');`}</CodeBlock>

            <h3 className="font-semibold mt-6 mb-3">Python</h3>
            <CodeBlock>{`import os
import requests

FOOP_API_KEY = os.environ.get('FOOP_API_KEY')
BASE_URL = 'https://api.foop.io/v1'

headers = {
    'Authorization': f'Bearer {FOOP_API_KEY}',
    'Content-Type': 'application/json',
}

def list_automations(limit=20, status=None):
    params = {'limit': limit}
    if status:
        params['status'] = status

    response = requests.get(
        f'{BASE_URL}/automations',
        headers=headers,
        params=params
    )
    response.raise_for_status()
    return response.json()

def create_automation(name, trigger, actions):
    data = {
        'name': name,
        'trigger': trigger,
        'actions': actions,
    }

    response = requests.post(
        f'{BASE_URL}/automations',
        headers=headers,
        json=data
    )
    response.raise_for_status()
    return response.json()

# Example usage
automations = list_automations(status='active')
print(f"Found {len(automations['data'])} active automations")`}</CodeBlock>

            <h3 className="font-semibold mt-6 mb-3">cURL</h3>
            <CodeBlock>{`# List automations
curl -X GET "https://api.foop.io/v1/automations?limit=10" \\
  -H "Authorization: Bearer $FOOP_API_KEY"

# Create an automation
curl -X POST "https://api.foop.io/v1/automations" \\
  -H "Authorization: Bearer $FOOP_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "New User Onboarding",
    "trigger": {
      "type": "user_signup"
    },
    "actions": [
      {
        "type": "send_email",
        "template_id": "welcome"
      }
    ]
  }'

# Trigger an automation manually
curl -X POST "https://api.foop.io/v1/automations/auto_xyz789/trigger" \\
  -H "Authorization: Bearer $FOOP_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"context": {"user_id": "user_123"}}'`}</CodeBlock>

            <h3 className="font-semibold mt-6 mb-3">Webhook Handler (Node.js / Express)</h3>
            <CodeBlock>{`import express from 'express';
import crypto from 'crypto';

const app = express();
const WEBHOOK_SECRET = process.env.FOOP_WEBHOOK_SECRET;

// Use raw body for signature verification
app.post('/webhooks/foop',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const signature = req.headers['x-foop-signature'];
    const payload = req.body.toString();

    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    if (!crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSig)
    )) {
      return res.status(401).send('Invalid signature');
    }

    // Process the event
    const event = JSON.parse(payload);

    switch (event.type) {
      case 'execution.completed':
        console.log('Automation completed:', event.data.automation_name);
        break;
      case 'execution.failed':
        console.error('Automation failed:', event.data);
        break;
      default:
        console.log('Received event:', event.type);
    }

    res.status(200).send('OK');
  }
);

app.listen(3000);`}</CodeBlock>
          </Section>

          {/* Rate Limits */}
          <Section id="rate-limits" title="Rate Limits">
            <p className="text-muted-foreground mb-4">
              API requests are rate limited to ensure fair usage and platform stability.
            </p>

            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2">Plan</th>
                  <th className="text-left py-2">Requests/minute</th>
                  <th className="text-left py-2">Requests/day</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-2">Free</td>
                  <td className="py-2">60</td>
                  <td className="py-2">1,000</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2">Pro</td>
                  <td className="py-2">300</td>
                  <td className="py-2">10,000</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2">Enterprise</td>
                  <td className="py-2">1,000</td>
                  <td className="py-2">Unlimited</td>
                </tr>
              </tbody>
            </table>

            <p className="text-muted-foreground mb-4">
              Rate limit information is included in response headers:
            </p>
            <CodeBlock>{`X-RateLimit-Limit: 300
X-RateLimit-Remaining: 295
X-RateLimit-Reset: 1705320000`}</CodeBlock>
          </Section>

          {/* Errors */}
          <Section id="errors" title="Error Handling">
            <p className="text-muted-foreground mb-4">
              The API uses standard HTTP status codes and returns JSON error responses.
            </p>

            <h3 className="font-semibold mt-6 mb-3">HTTP Status Codes</h3>
            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2">Code</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-2"><code>200</code></td>
                  <td className="py-2">Success</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>201</code></td>
                  <td className="py-2">Created</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>400</code></td>
                  <td className="py-2">Bad Request - Invalid parameters</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>401</code></td>
                  <td className="py-2">Unauthorized - Invalid or missing API key</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>403</code></td>
                  <td className="py-2">Forbidden - Insufficient permissions</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>404</code></td>
                  <td className="py-2">Not Found - Resource does not exist</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>429</code></td>
                  <td className="py-2">Too Many Requests - Rate limit exceeded</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>500</code></td>
                  <td className="py-2">Internal Server Error</td>
                </tr>
              </tbody>
            </table>

            <h3 className="font-semibold mt-6 mb-3">Error Response Format</h3>
            <CodeBlock>{`{
  "error": {
    "code": "invalid_request",
    "message": "The 'name' field is required",
    "details": {
      "field": "name",
      "reason": "missing_required_field"
    }
  }
}`}</CodeBlock>

            <h3 className="font-semibold mt-6 mb-3">Common Error Codes</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2">Code</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-2"><code>invalid_request</code></td>
                  <td className="py-2">Request body or parameters are invalid</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>authentication_failed</code></td>
                  <td className="py-2">API key is invalid or expired</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>resource_not_found</code></td>
                  <td className="py-2">The requested resource does not exist</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>rate_limit_exceeded</code></td>
                  <td className="py-2">Too many requests, slow down</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2"><code>internal_error</code></td>
                  <td className="py-2">Something went wrong on our end</td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Footer */}
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Need help? Contact us at{" "}
              <a href="mailto:support@foop.io" className="text-foreground underline">
                support@foop.io
              </a>
            </p>
          </div>
        </main>

        {/* Table of Contents */}
        <TableOfContents />
      </div>
    </div>
  );
}
