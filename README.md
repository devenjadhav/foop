# Foop - B2B Automation SaaS

## Webhook Backend

A robust webhook backend with dynamic URL generation, payload parsing, signature verification, retry logic, and event logging.

### Features

- **Dynamic URL Generation**: Generate unique webhook endpoints with secure secrets
- **Payload Parsing**: Parse and validate incoming webhook payloads
- **Signature Verification**: HMAC-SHA256 signature verification with timestamp validation
- **Retry Logic**: Exponential backoff with configurable retry attempts
- **Event Logging**: Comprehensive logging for debugging and monitoring

### API Endpoints

#### Webhook Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/webhooks/organization/:orgId` | List webhooks for an organization |
| POST | `/api/webhooks` | Create a new webhook |
| GET | `/api/webhooks/:id` | Get a specific webhook |
| PATCH | `/api/webhooks/:id` | Update a webhook |
| DELETE | `/api/webhooks/:id` | Delete a webhook |
| POST | `/api/webhooks/:id/regenerate-secret` | Regenerate webhook secret |
| POST | `/api/webhooks/:id/test` | Test webhook delivery |
| GET | `/api/webhooks/:id/logs` | Get webhook logs |
| GET | `/api/webhooks/stats/overview` | Get webhook statistics |

#### Webhook Receiver

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/receive/:webhookId` | Receive inbound webhook |
| POST | `/api/webhooks/inbound/:orgId/:webhookId` | Receive inbound webhook (org-scoped) |
| GET | `/api/webhooks/health` | Health check |

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `WEBHOOK_BASE_URL` | Base URL for webhook endpoints | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` |

### Creating a Webhook

```bash
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org_123",
    "name": "My Webhook",
    "url": "https://example.com/webhook",
    "events": ["workflow.executed", "integration.connected"]
  }'
```

### Sending to a Webhook

Include the signature header for verification:

```bash
curl -X POST http://localhost:3000/api/webhooks/receive/wh_abc123 \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: t=1234567890,v1=signature_here" \
  -d '{
    "event": "workflow.executed",
    "data": { "workflowId": "wf_123" }
  }'
```

### Signature Verification

Webhooks are signed using HMAC-SHA256. The signature header format is:

```
X-Webhook-Signature: t=<timestamp>,v1=<signature>
```

The signature is computed as:

```
HMAC-SHA256(timestamp + "." + payload, secret)
```
