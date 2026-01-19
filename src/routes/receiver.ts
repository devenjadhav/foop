import { Router, Request, Response } from 'express';
import { WebhookStore } from '../services/webhook-store';
import { WebhookDeliveryService, createWebhookPayload } from '../services/webhook-delivery';
import { EventLogger } from '../services/event-logger';
import { verifySignature } from '../utils/signature';
import { parsePayload, validatePayloadSize, extractPayloadString } from '../utils/payload-parser';

export function createReceiverRoutes(
  webhookStore: WebhookStore,
  deliveryService: WebhookDeliveryService,
  eventLogger: EventLogger
): Router {
  const router = Router();

  // Receive inbound webhook
  router.post('/receive/:webhookId', async (req: Request, res: Response) => {
    const { webhookId } = req.params;
    const signatureHeader = req.headers['x-webhook-signature'] as string;

    try {
      // Get webhook configuration
      const webhook = await webhookStore.get(webhookId);

      if (!webhook) {
        res.status(404).json({ error: 'Webhook not found' });
        return;
      }

      if (webhook.status !== 'active') {
        res.status(403).json({ error: 'Webhook is not active' });
        return;
      }

      // Get raw body for signature verification
      const rawBody = extractPayloadString({ body: req.body });

      // Validate payload size
      const sizeCheck = validatePayloadSize(rawBody);
      if (!sizeCheck.valid) {
        res.status(413).json({ error: sizeCheck.error });
        return;
      }

      // Verify signature if provided
      if (signatureHeader) {
        const verification = verifySignature(rawBody, webhook.secret, signatureHeader);

        await eventLogger.logSignatureVerification(webhookId, verification.valid, verification.error);

        if (!verification.valid) {
          res.status(401).json({ error: `Signature verification failed: ${verification.error}` });
          return;
        }
      }

      // Parse payload
      const parseResult = parsePayload({ body: req.body });

      if (!parseResult.success || !parseResult.data) {
        res.status(400).json({ error: parseResult.error || 'Invalid payload' });
        return;
      }

      const payload = parseResult.data;

      // Log inbound event
      await eventLogger.logInboundReceived(
        webhookId,
        webhook.organizationId,
        payload.event,
        sizeCheck.size
      );

      // Update last triggered timestamp
      await webhookStore.updateLastTriggered(webhookId);

      // Find all webhooks that should receive this event
      const targetWebhooks = await webhookStore.getActiveWebhooksForEvent(
        webhook.organizationId,
        payload.event
      );

      // Deliver to all target webhooks (excluding the inbound one)
      const deliveryPromises = targetWebhooks
        .filter((w) => w.id !== webhookId)
        .map(async (targetWebhook) => {
          const webhookPayload = createWebhookPayload(
            targetWebhook.id,
            payload.event as any,
            payload.data,
            { ...payload.metadata, source_webhook_id: webhookId }
          );

          return deliveryService.deliver(targetWebhook, webhookPayload);
        });

      // Don't wait for deliveries to complete (async)
      Promise.all(deliveryPromises).catch(async (error) => {
        await eventLogger.logError('delivery', 'batch.delivery.error', error as Error);
      });

      res.status(200).json({
        received: true,
        webhookId,
        event: payload.event,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      await eventLogger.logError('receiver', 'receive.error', error as Error, webhookId);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Inbound webhook for organization (alternative endpoint)
  router.post('/inbound/:organizationId/:webhookId', async (req: Request, res: Response) => {
    const { organizationId, webhookId } = req.params;
    const signatureHeader = req.headers['x-webhook-signature'] as string;

    try {
      const webhook = await webhookStore.get(webhookId);

      if (!webhook) {
        res.status(404).json({ error: 'Webhook not found' });
        return;
      }

      if (webhook.organizationId !== organizationId) {
        res.status(403).json({ error: 'Webhook does not belong to this organization' });
        return;
      }

      if (webhook.status !== 'active') {
        res.status(403).json({ error: 'Webhook is not active' });
        return;
      }

      const rawBody = extractPayloadString({ body: req.body });

      // Validate payload size
      const sizeCheck = validatePayloadSize(rawBody);
      if (!sizeCheck.valid) {
        res.status(413).json({ error: sizeCheck.error });
        return;
      }

      // Verify signature
      if (signatureHeader) {
        const verification = verifySignature(rawBody, webhook.secret, signatureHeader);

        await eventLogger.logSignatureVerification(webhookId, verification.valid, verification.error);

        if (!verification.valid) {
          res.status(401).json({ error: `Signature verification failed: ${verification.error}` });
          return;
        }
      }

      // Parse payload
      const parseResult = parsePayload({ body: req.body });

      if (!parseResult.success || !parseResult.data) {
        res.status(400).json({ error: parseResult.error || 'Invalid payload' });
        return;
      }

      const payload = parseResult.data;

      await eventLogger.logInboundReceived(
        webhookId,
        organizationId,
        payload.event,
        sizeCheck.size
      );

      await webhookStore.updateLastTriggered(webhookId);

      res.status(200).json({
        received: true,
        webhookId,
        organizationId,
        event: payload.event,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      await eventLogger.logError('receiver', 'inbound.error', error as Error, webhookId, organizationId);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Health check for webhook receiver
  router.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
