import { Router, Request, Response } from 'express';
import { WebhookStore } from '../services/webhook-store';
import { WebhookDeliveryService, createWebhookPayload } from '../services/webhook-delivery';
import { EventLogger } from '../services/event-logger';
import { CreateWebhookRequest, UpdateWebhookRequest, WebhookEventType } from '../types/webhook';
import { generateWebhookUrl } from '../utils/url-generator';

export function createWebhookRoutes(
  webhookStore: WebhookStore,
  deliveryService: WebhookDeliveryService,
  eventLogger: EventLogger
): Router {
  const router = Router();

  // List webhooks for an organization
  router.get('/organization/:organizationId', async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.params;
      const webhooks = await webhookStore.getByOrganization(organizationId);

      // Don't expose secrets in list response
      const sanitized = webhooks.map(({ secret, ...rest }) => ({
        ...rest,
        endpointUrl: generateWebhookUrl(rest.id),
      }));

      res.json({ webhooks: sanitized });
    } catch (error) {
      await eventLogger.logError('api', 'webhooks.list.error', error as Error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create a new webhook
  router.post('/', async (req: Request, res: Response) => {
    try {
      const body = req.body as CreateWebhookRequest;

      if (!body.organizationId || !body.name || !body.url || !body.events) {
        res.status(400).json({
          error: 'Missing required fields: organizationId, name, url, events',
        });
        return;
      }

      if (!Array.isArray(body.events) || body.events.length === 0) {
        res.status(400).json({ error: 'Events must be a non-empty array' });
        return;
      }

      try {
        new URL(body.url);
      } catch {
        res.status(400).json({ error: 'Invalid URL format' });
        return;
      }

      const webhook = await webhookStore.create(body);

      res.status(201).json({
        webhook: {
          id: webhook.id,
          organizationId: webhook.organizationId,
          name: webhook.name,
          url: webhook.url,
          secret: webhook.secret, // Only expose secret on creation
          status: webhook.status,
          events: webhook.events,
          endpointUrl: generateWebhookUrl(webhook.id),
          retryConfig: webhook.retryConfig,
          createdAt: webhook.createdAt,
        },
      });
    } catch (error) {
      await eventLogger.logError('api', 'webhooks.create.error', error as Error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get a specific webhook
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const webhook = await webhookStore.get(id);

      if (!webhook) {
        res.status(404).json({ error: 'Webhook not found' });
        return;
      }

      // Don't expose secret in get response
      const { secret, ...sanitized } = webhook;

      res.json({
        webhook: {
          ...sanitized,
          endpointUrl: generateWebhookUrl(webhook.id),
        },
      });
    } catch (error) {
      await eventLogger.logError('api', 'webhooks.get.error', error as Error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update a webhook
  router.patch('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = req.body as UpdateWebhookRequest;

      if (body.url) {
        try {
          new URL(body.url);
        } catch {
          res.status(400).json({ error: 'Invalid URL format' });
          return;
        }
      }

      const webhook = await webhookStore.update(id, body);

      if (!webhook) {
        res.status(404).json({ error: 'Webhook not found' });
        return;
      }

      const { secret, ...sanitized } = webhook;

      res.json({
        webhook: {
          ...sanitized,
          endpointUrl: generateWebhookUrl(webhook.id),
        },
      });
    } catch (error) {
      await eventLogger.logError('api', 'webhooks.update.error', error as Error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete a webhook
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await webhookStore.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Webhook not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      await eventLogger.logError('api', 'webhooks.delete.error', error as Error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Regenerate webhook secret
  router.post('/:id/regenerate-secret', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const webhook = await webhookStore.get(id);

      if (!webhook) {
        res.status(404).json({ error: 'Webhook not found' });
        return;
      }

      // Generate new secret using the url-generator utility
      const { generateWebhookSecret } = await import('../utils/url-generator');
      const newSecret = generateWebhookSecret();

      // Update webhook with new secret (we need to update the store directly)
      (webhook as any).secret = newSecret;
      webhook.updatedAt = new Date();

      res.json({
        webhook: {
          id: webhook.id,
          secret: newSecret,
        },
      });
    } catch (error) {
      await eventLogger.logError('api', 'webhooks.regenerate-secret.error', error as Error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Trigger a webhook manually (for testing)
  router.post('/:id/test', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const webhook = await webhookStore.get(id);

      if (!webhook) {
        res.status(404).json({ error: 'Webhook not found' });
        return;
      }

      const testPayload = createWebhookPayload(
        webhook.id,
        'custom',
        { test: true, message: 'This is a test webhook delivery' },
        { triggered_by: 'manual_test' }
      );

      const result = await deliveryService.deliver(webhook, testPayload);

      await webhookStore.updateLastTriggered(webhook.id);

      res.json({
        success: result.success,
        attempts: result.attempts,
        statusCode: result.finalStatusCode,
        duration: result.duration,
        errorMessage: result.errorMessage,
      });
    } catch (error) {
      await eventLogger.logError('api', 'webhooks.test.error', error as Error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get webhook delivery logs
  router.get('/:id/logs', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { limit = '50', since } = req.query;

      const webhook = await webhookStore.get(id);

      if (!webhook) {
        res.status(404).json({ error: 'Webhook not found' });
        return;
      }

      const logs = eventLogger.getLogs({
        webhookId: id,
        limit: parseInt(limit as string, 10),
        since: since ? new Date(since as string) : undefined,
      });

      res.json({ logs });
    } catch (error) {
      await eventLogger.logError('api', 'webhooks.logs.error', error as Error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get webhook stats
  router.get('/stats/overview', async (_req: Request, res: Response) => {
    try {
      const webhookStats = webhookStore.getStats();
      const loggerStats = eventLogger.getStats();

      res.json({
        webhooks: webhookStats,
        logs: loggerStats,
      });
    } catch (error) {
      await eventLogger.logError('api', 'webhooks.stats.error', error as Error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
