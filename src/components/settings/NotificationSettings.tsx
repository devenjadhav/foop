import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Toggle } from '../ui/Toggle';
import { Select } from '../ui/Select';
import type {
  NotificationPreference,
  NotificationCategory,
  NotificationChannel,
  SlackIntegration,
  WebhookEndpoint,
} from '../../types/settings';

const notificationCategories: { category: NotificationCategory; label: string; description: string }[] = [
  { category: 'automation_success', label: 'Automation Success', description: 'When an automation completes successfully' },
  { category: 'automation_failure', label: 'Automation Failure', description: 'When an automation fails or encounters an error' },
  { category: 'automation_warning', label: 'Automation Warning', description: 'When an automation has warnings or issues' },
  { category: 'team_activity', label: 'Team Activity', description: 'When team members join, leave, or change roles' },
  { category: 'billing_alerts', label: 'Billing Alerts', description: 'Payment reminders, invoice updates, and usage alerts' },
  { category: 'security_alerts', label: 'Security Alerts', description: 'Suspicious activity, login attempts, and API key usage' },
  { category: 'product_updates', label: 'Product Updates', description: 'New features, improvements, and announcements' },
  { category: 'weekly_digest', label: 'Weekly Digest', description: 'Summary of automation activity and metrics' },
];

const channels: NotificationChannel[] = ['email', 'slack', 'webhook', 'in_app'];

const mockPreferences: NotificationPreference[] = notificationCategories.map((cat) => ({
  category: cat.category,
  channels: {
    email: ['automation_failure', 'billing_alerts', 'security_alerts'].includes(cat.category),
    slack: ['automation_failure', 'automation_warning'].includes(cat.category),
    webhook: false,
    in_app: true,
  },
}));

const mockSlackIntegration: SlackIntegration = {
  enabled: true,
  workspaceName: 'Acme Corp',
  channelId: 'C1234567890',
  channelName: '#alerts',
  connectedAt: '2024-10-15T10:30:00Z',
};

const mockWebhooks: WebhookEndpoint[] = [
  {
    id: 'webhook_1',
    url: 'https://api.example.com/webhooks/foop',
    events: ['automation_failure', 'automation_warning'],
    secret: 'whsec_abc123...',
    enabled: true,
    createdAt: '2024-11-01T00:00:00Z',
    lastTriggeredAt: '2025-01-15T14:22:00Z',
  },
];

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
];

export function NotificationSettings() {
  const [preferences, setPreferences] = useState(mockPreferences);
  const [slackIntegration, setSlackIntegration] = useState(mockSlackIntegration);
  const [webhooks, setWebhooks] = useState(mockWebhooks);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showDisconnectSlackModal, setShowDisconnectSlackModal] = useState(false);

  // Quiet hours state
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [quietHoursTimezone, setQuietHoursTimezone] = useState('America/New_York');

  // New webhook form state
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<NotificationCategory[]>([]);

  const togglePreference = (category: NotificationCategory, channel: NotificationChannel) => {
    setPreferences(
      preferences.map((pref) =>
        pref.category === category
          ? {
              ...pref,
              channels: {
                ...pref.channels,
                [channel]: !pref.channels[channel],
              },
            }
          : pref
      )
    );
  };

  const handleConnectSlack = () => {
    // Simulate OAuth flow
    alert('This would redirect to Slack OAuth');
  };

  const handleDisconnectSlack = () => {
    setSlackIntegration({ enabled: false });
    setShowDisconnectSlackModal(false);
  };

  const handleAddWebhook = () => {
    if (newWebhookUrl && newWebhookEvents.length > 0) {
      const newWebhook: WebhookEndpoint = {
        id: `webhook_${Date.now()}`,
        url: newWebhookUrl,
        events: newWebhookEvents,
        secret: `whsec_${Math.random().toString(36).substring(2, 15)}`,
        enabled: true,
        createdAt: new Date().toISOString(),
      };
      setWebhooks([...webhooks, newWebhook]);
      setNewWebhookUrl('');
      setNewWebhookEvents([]);
      setShowWebhookModal(false);
    }
  };

  const toggleWebhook = (webhookId: string) => {
    setWebhooks(
      webhooks.map((wh) =>
        wh.id === webhookId ? { ...wh, enabled: !wh.enabled } : wh
      )
    );
  };

  const deleteWebhook = (webhookId: string) => {
    setWebhooks(webhooks.filter((wh) => wh.id !== webhookId));
  };

  const toggleWebhookEvent = (event: NotificationCategory) => {
    if (newWebhookEvents.includes(event)) {
      setNewWebhookEvents(newWebhookEvents.filter((e) => e !== event));
    } else {
      setNewWebhookEvents([...newWebhookEvents, event]);
    }
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'email':
        return <EmailIcon className="h-4 w-4" />;
      case 'slack':
        return <SlackIcon className="h-4 w-4" />;
      case 'webhook':
        return <WebhookIcon className="h-4 w-4" />;
      case 'in_app':
        return <BellIcon className="h-4 w-4" />;
    }
  };

  const getChannelLabel = (channel: NotificationChannel) => {
    switch (channel) {
      case 'email':
        return 'Email';
      case 'slack':
        return 'Slack';
      case 'webhook':
        return 'Webhook';
      case 'in_app':
        return 'In-App';
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <Card>
        <CardHeader
          title="Notification Preferences"
          description="Choose how you want to be notified for different events"
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  {channels.map((channel) => (
                    <th
                      key={channel}
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center justify-center gap-1">
                        {getChannelIcon(channel)}
                        {getChannelLabel(channel)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notificationCategories.map((cat) => {
                  const pref = preferences.find((p) => p.category === cat.category);
                  return (
                    <tr key={cat.category}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{cat.label}</p>
                          <p className="text-sm text-gray-500">{cat.description}</p>
                        </div>
                      </td>
                      {channels.map((channel) => (
                        <td key={channel} className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={pref?.channels[channel] || false}
                            onChange={() => togglePreference(cat.category, channel)}
                            disabled={channel === 'slack' && !slackIntegration.enabled}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Save Preferences</Button>
        </CardFooter>
      </Card>

      {/* Slack Integration */}
      <Card>
        <CardHeader
          title="Slack Integration"
          description="Connect Slack to receive notifications in your workspace"
        />
        <CardContent>
          {slackIntegration.enabled ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-[#4A154B] rounded-lg flex items-center justify-center">
                  <SlackIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{slackIntegration.workspaceName}</p>
                    <Badge variant="success">Connected</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Notifications sent to {slackIntegration.channelName}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  Change Channel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDisconnectSlackModal(true)}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 bg-[#4A154B] rounded-lg flex items-center justify-center mb-4">
                <SlackIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Connect to Slack</h3>
              <p className="mt-1 text-sm text-gray-500">
                Receive real-time notifications in your Slack workspace
              </p>
              <div className="mt-4">
                <Button onClick={handleConnectSlack}>Connect Slack</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader
          title="Webhooks"
          description="Send notifications to custom HTTP endpoints"
          action={
            <Button onClick={() => setShowWebhookModal(true)}>Add Webhook</Button>
          }
        />
        <CardContent>
          {webhooks.length > 0 ? (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 truncate max-w-md">
                          {webhook.url}
                        </code>
                        <Badge variant={webhook.enabled ? 'success' : 'default'}>
                          {webhook.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {webhook.events.map((event) => (
                          <span
                            key={event}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {event.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                      {webhook.lastTriggeredAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Last triggered: {new Date(webhook.lastTriggeredAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Toggle
                        enabled={webhook.enabled}
                        onChange={() => toggleWebhook(webhook.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWebhook(webhook.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <WebhookIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No webhooks configured</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add a webhook to receive notifications at a custom endpoint
              </p>
              <div className="mt-4">
                <Button onClick={() => setShowWebhookModal(true)}>Add Webhook</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader
          title="Quiet Hours"
          description="Pause non-critical notifications during specific hours"
        />
        <CardContent className="space-y-4">
          <Toggle
            enabled={quietHoursEnabled}
            onChange={setQuietHoursEnabled}
            label="Enable quiet hours"
            description="Only critical notifications (failures, security) will be sent during quiet hours"
          />
          {quietHoursEnabled && (
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <Input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                />
              </div>
              <Select
                label="Timezone"
                options={timezones}
                value={quietHoursTimezone}
                onChange={setQuietHoursTimezone}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Save Settings</Button>
        </CardFooter>
      </Card>

      {/* Add Webhook Modal */}
      <Modal
        isOpen={showWebhookModal}
        onClose={() => setShowWebhookModal(false)}
        title="Add Webhook"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Webhook URL"
            type="url"
            placeholder="https://api.example.com/webhooks"
            value={newWebhookUrl}
            onChange={(e) => setNewWebhookUrl(e.target.value)}
            helperText="We'll send POST requests to this URL"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Events to send
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notificationCategories.map((cat) => (
                <div
                  key={cat.category}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    newWebhookEvents.includes(cat.category)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleWebhookEvent(cat.category)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cat.label}</p>
                      <p className="text-xs text-gray-500">{cat.description}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={newWebhookEvents.includes(cat.category)}
                      onChange={() => toggleWebhookEvent(cat.category)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowWebhookModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddWebhook}
            disabled={!newWebhookUrl || newWebhookEvents.length === 0}
          >
            Add Webhook
          </Button>
        </div>
      </Modal>

      {/* Disconnect Slack Modal */}
      <Modal
        isOpen={showDisconnectSlackModal}
        onClose={() => setShowDisconnectSlackModal(false)}
        title="Disconnect Slack"
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to disconnect Slack? You will no longer receive notifications
          in your Slack workspace.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDisconnectSlackModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDisconnectSlack}>
            Disconnect
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// Icon Components
function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function SlackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  );
}

function WebhookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}
