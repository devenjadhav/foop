import { generateId, generateSecret } from "./utils";

export type WebhookStatus = "active" | "inactive";

export interface WebhookPayload {
  id: string;
  timestamp: string;
  event: string;
  data: Record<string, unknown>;
  status: "success" | "failed" | "pending";
  responseCode?: number;
  responseTime?: number;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string;
  status: WebhookStatus;
  events: string[];
  createdAt: string;
  lastTriggeredAt: string | null;
  payloads: WebhookPayload[];
}

// In-memory store for demo purposes
let webhooks: Webhook[] = [
  {
    id: "wh_1",
    name: "Order Notifications",
    url: "https://api.example.com/webhooks/orders",
    secret: generateSecret(),
    status: "active",
    events: ["order.created", "order.updated", "order.completed"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    payloads: [
      {
        id: "pl_1",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        event: "order.created",
        data: { orderId: "ord_123", amount: 99.99, customer: "john@example.com" },
        status: "success",
        responseCode: 200,
        responseTime: 145,
      },
      {
        id: "pl_2",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        event: "order.updated",
        data: { orderId: "ord_122", status: "shipped" },
        status: "success",
        responseCode: 200,
        responseTime: 89,
      },
    ],
  },
  {
    id: "wh_2",
    name: "User Events",
    url: "https://api.example.com/webhooks/users",
    secret: generateSecret(),
    status: "active",
    events: ["user.created", "user.updated"],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    payloads: [
      {
        id: "pl_3",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        event: "user.created",
        data: { userId: "usr_456", email: "jane@example.com" },
        status: "success",
        responseCode: 200,
        responseTime: 112,
      },
    ],
  },
  {
    id: "wh_3",
    name: "Payment Webhooks",
    url: "https://api.example.com/webhooks/payments",
    secret: generateSecret(),
    status: "inactive",
    events: ["payment.succeeded", "payment.failed"],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggeredAt: null,
    payloads: [],
  },
];

export function getWebhooks(): Webhook[] {
  return webhooks;
}

export function getWebhook(id: string): Webhook | undefined {
  return webhooks.find((w) => w.id === id);
}

export function createWebhook(data: { name: string; url: string; events: string[] }): Webhook {
  const webhook: Webhook = {
    id: `wh_${generateId()}`,
    name: data.name,
    url: data.url,
    secret: generateSecret(),
    status: "active",
    events: data.events,
    createdAt: new Date().toISOString(),
    lastTriggeredAt: null,
    payloads: [],
  };
  webhooks.push(webhook);
  return webhook;
}

export function updateWebhook(id: string, data: Partial<Webhook>): Webhook | undefined {
  const index = webhooks.findIndex((w) => w.id === id);
  if (index === -1) return undefined;
  webhooks[index] = { ...webhooks[index], ...data };
  return webhooks[index];
}

export function deleteWebhook(id: string): boolean {
  const index = webhooks.findIndex((w) => w.id === id);
  if (index === -1) return false;
  webhooks.splice(index, 1);
  return true;
}

export function regenerateSecret(id: string): Webhook | undefined {
  const webhook = webhooks.find((w) => w.id === id);
  if (!webhook) return undefined;
  webhook.secret = generateSecret();
  return webhook;
}

export function testWebhook(id: string): WebhookPayload {
  const webhook = webhooks.find((w) => w.id === id);
  if (!webhook) throw new Error("Webhook not found");

  const payload: WebhookPayload = {
    id: `pl_${generateId()}`,
    timestamp: new Date().toISOString(),
    event: "test.ping",
    data: { message: "Test webhook payload", webhookId: id },
    status: Math.random() > 0.2 ? "success" : "failed",
    responseCode: Math.random() > 0.2 ? 200 : 500,
    responseTime: Math.floor(Math.random() * 200) + 50,
  };

  webhook.payloads.unshift(payload);
  webhook.lastTriggeredAt = payload.timestamp;

  return payload;
}
