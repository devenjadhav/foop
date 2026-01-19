"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Copy,
  Check,
  RefreshCw,
  Play,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Webhook, WebhookPayload } from "@/lib/webhooks";

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWebhook, setExpandedWebhook] = useState<string | null>(null);
  const [selectedPayload, setSelectedPayload] = useState<WebhookPayload | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [regeneratingSecret, setRegeneratingSecret] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await fetch("/api/webhooks");
      const data = await res.json();
      setWebhooks(data);
    } catch (error) {
      console.error("Failed to fetch webhooks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSecret = (id: string) => {
    setShowSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const testWebhook = async (id: string) => {
    setTestingWebhook(id);
    try {
      const res = await fetch(`/api/webhooks/${id}/test`, { method: "POST" });
      if (res.ok) {
        await fetchWebhooks();
      }
    } catch (error) {
      console.error("Failed to test webhook:", error);
    } finally {
      setTestingWebhook(null);
    }
  };

  const regenerateSecret = async (id: string) => {
    setRegeneratingSecret(id);
    try {
      const res = await fetch(`/api/webhooks/${id}/regenerate`, { method: "POST" });
      if (res.ok) {
        await fetchWebhooks();
      }
    } catch (error) {
      console.error("Failed to regenerate secret:", error);
    } finally {
      setRegeneratingSecret(null);
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;
    try {
      const res = await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setWebhooks((prev) => prev.filter((w) => w.id !== id));
        if (expandedWebhook === id) setExpandedWebhook(null);
      }
    } catch (error) {
      console.error("Failed to delete webhook:", error);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/webhooks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchWebhooks();
      }
    } catch (error) {
      console.error("Failed to update webhook status:", error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const getWebhookUrl = (webhook: Webhook) => {
    return `${typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/incoming/${webhook.id}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Manage your webhook endpoints and view delivery history
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Webhook
        </button>
      </div>

      {webhooks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <ExternalLink className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No webhooks yet</h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Create your first webhook to start receiving events
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Create Webhook
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              {/* Webhook Header */}
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold truncate">{webhook.name}</h3>
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full",
                          webhook.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        )}
                      >
                        {webhook.status}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                      {webhook.url}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(webhook.id, webhook.status)}
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                        webhook.status === "active"
                          ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                          : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                      )}
                    >
                      {webhook.status === "active" ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => deleteWebhook(webhook.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                      title="Delete webhook"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Webhook URL Section */}
                <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      WEBHOOK URL
                    </span>
                    <button
                      onClick={() => copyToClipboard(getWebhookUrl(webhook), `url-${webhook.id}`)}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      {copiedId === `url-${webhook.id}` ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <code className="text-sm text-zinc-700 dark:text-zinc-300 break-all">
                    {getWebhookUrl(webhook)}
                  </code>
                </div>

                {/* Secret Section */}
                <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      SIGNING SECRET
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSecret(webhook.id)}
                        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                      >
                        {showSecrets[webhook.id] ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(webhook.secret, `secret-${webhook.id}`)
                        }
                        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                      >
                        {copiedId === `secret-${webhook.id}` ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => regenerateSecret(webhook.id)}
                        disabled={regeneratingSecret === webhook.id}
                        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 disabled:opacity-50"
                        title="Regenerate secret"
                      >
                        <RefreshCw
                          className={cn(
                            "w-3 h-3",
                            regeneratingSecret === webhook.id && "animate-spin"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                  <code className="text-sm text-zinc-700 dark:text-zinc-300 font-mono">
                    {showSecrets[webhook.id]
                      ? webhook.secret
                      : webhook.secret.substring(0, 7) + "..." + "*".repeat(20)}
                  </code>
                </div>

                {/* Actions Row */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                    <span>Created: {formatDate(webhook.createdAt)}</span>
                    <span>Last triggered: {formatDate(webhook.lastTriggeredAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => testWebhook(webhook.id)}
                      disabled={testingWebhook === webhook.id}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {testingWebhook === webhook.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Test Endpoint
                    </button>
                    <button
                      onClick={() =>
                        setExpandedWebhook(expandedWebhook === webhook.id ? null : webhook.id)
                      }
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      {expandedWebhook === webhook.id ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide Payloads
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          View Payloads ({webhook.payloads.length})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Payloads Section */}
              {expandedWebhook === webhook.id && (
                <div className="border-t border-zinc-200 dark:border-zinc-800">
                  {webhook.payloads.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
                      No payloads delivered yet
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {webhook.payloads.map((payload) => (
                        <div
                          key={payload.id}
                          className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedPayload(payload)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {payload.status === "success" ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : payload.status === "failed" ? (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                              ) : (
                                <Clock className="w-5 h-5 text-yellow-500" />
                              )}
                              <div>
                                <span className="font-medium">{payload.event}</span>
                                <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                                  {formatDate(payload.timestamp)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              {payload.responseCode && (
                                <span
                                  className={cn(
                                    "font-mono",
                                    payload.responseCode >= 200 && payload.responseCode < 300
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  )}
                                >
                                  {payload.responseCode}
                                </span>
                              )}
                              {payload.responseTime && (
                                <span className="text-zinc-500 dark:text-zinc-400">
                                  {payload.responseTime}ms
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Payload Detail Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="font-semibold">{selectedPayload.event}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDate(selectedPayload.timestamp)}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayload(null)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[60vh]">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Status:</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded-full",
                      selectedPayload.status === "success"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : selectedPayload.status === "failed"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    )}
                  >
                    {selectedPayload.status}
                  </span>
                </div>
                {selectedPayload.responseCode && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Response:</span>
                    <span className="font-mono text-sm">{selectedPayload.responseCode}</span>
                  </div>
                )}
                {selectedPayload.responseTime && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Time:</span>
                    <span className="font-mono text-sm">{selectedPayload.responseTime}ms</span>
                  </div>
                )}
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    PAYLOAD DATA
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(selectedPayload.data, null, 2),
                        `payload-${selectedPayload.id}`
                      )
                    }
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    {copiedId === `payload-${selectedPayload.id}` ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-auto text-sm font-mono">
                  {JSON.stringify(selectedPayload.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Webhook Modal */}
      {showCreateModal && (
        <CreateWebhookModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchWebhooks();
          }}
        />
      )}
    </div>
  );
}

function CreateWebhookModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const availableEvents = [
    "order.created",
    "order.updated",
    "order.completed",
    "user.created",
    "user.updated",
    "payment.succeeded",
    "payment.failed",
  ];

  const toggleEvent = (event: string) => {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, events }),
      });
      if (res.ok) {
        onCreated();
      }
    } catch (error) {
      console.error("Failed to create webhook:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold">Create Webhook</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Webhook"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Endpoint URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/webhooks"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Events to subscribe</label>
            <div className="flex flex-wrap gap-2">
              {availableEvents.map((event) => (
                <button
                  key={event}
                  type="button"
                  onClick={() => toggleEvent(event)}
                  className={cn(
                    "px-3 py-1 text-sm rounded-full border transition-colors",
                    events.includes(event)
                      ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400"
                      : "bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  )}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Webhook"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
