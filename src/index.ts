import express from 'express';
import { EventLogger } from './services/event-logger';
import { WebhookStore } from './services/webhook-store';
import { WebhookDeliveryService } from './services/webhook-delivery';
import { createWebhookRoutes } from './routes/webhooks';
import { createReceiverRoutes } from './routes/receiver';

// Initialize services
const eventLogger = new EventLogger({
  minLevel: process.env.LOG_LEVEL as any || 'info',
  maxEntries: 10000,
});

const webhookStore = new WebhookStore(eventLogger);
const deliveryService = new WebhookDeliveryService(eventLogger);

// Create Express app
const app = express();

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/webhooks', createWebhookRoutes(webhookStore, deliveryService, eventLogger));
app.use('/api/webhooks', createReceiverRoutes(webhookStore, deliveryService, eventLogger));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Foop Webhook Backend',
    version: '1.0.0',
    endpoints: {
      webhooks: '/api/webhooks',
      health: '/health',
    },
  });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  eventLogger.logError('server', 'unhandled.error', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Foop Webhook Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Export for testing
export { app, eventLogger, webhookStore, deliveryService };
