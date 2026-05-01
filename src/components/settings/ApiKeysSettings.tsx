import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Toggle } from '../ui/Toggle';
import type { ApiKey, ApiKeyScope } from '../../types/settings';

const allScopes: { value: ApiKeyScope; label: string; description: string }[] = [
  { value: 'read:automations', label: 'Read Automations', description: 'View automation configurations and status' },
  { value: 'write:automations', label: 'Write Automations', description: 'Create, update, and delete automations' },
  { value: 'read:data', label: 'Read Data', description: 'Access stored data and records' },
  { value: 'write:data', label: 'Write Data', description: 'Create and modify data records' },
  { value: 'read:analytics', label: 'Read Analytics', description: 'View usage metrics and analytics' },
  { value: 'admin', label: 'Admin', description: 'Full administrative access' },
];

const mockApiKeys: ApiKey[] = [
  {
    id: 'key_1',
    name: 'Production API Key',
    prefix: 'foop_live_abc123',
    createdAt: '2024-10-15T10:30:00Z',
    lastUsedAt: '2025-01-15T14:22:00Z',
    expiresAt: null,
    scopes: ['read:automations', 'write:automations', 'read:data', 'write:data'],
    status: 'active',
  },
  {
    id: 'key_2',
    name: 'Development Key',
    prefix: 'foop_test_xyz789',
    createdAt: '2024-11-20T08:00:00Z',
    lastUsedAt: '2025-01-10T09:15:00Z',
    expiresAt: '2025-06-01T00:00:00Z',
    scopes: ['read:automations', 'read:data', 'read:analytics'],
    status: 'active',
  },
  {
    id: 'key_3',
    name: 'Old Integration Key',
    prefix: 'foop_live_old456',
    createdAt: '2024-06-01T12:00:00Z',
    lastUsedAt: '2024-08-15T16:45:00Z',
    expiresAt: null,
    scopes: ['read:data'],
    status: 'revoked',
  },
];

export function ApiKeysSettings() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [newKeySecret, setNewKeySecret] = useState('');
  const [copied, setCopied] = useState(false);

  // Form state for new API key
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState<ApiKeyScope[]>([]);
  const [newKeyExpires, setNewKeyExpires] = useState(false);
  const [newKeyExpiryDate, setNewKeyExpiryDate] = useState('');

  const handleCreateKey = () => {
    // Simulate key creation
    const generatedSecret = `foop_live_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    setNewKeySecret(generatedSecret);
    setShowCreateModal(false);
    setShowSecretModal(true);
    // Reset form
    setNewKeyName('');
    setNewKeyScopes([]);
    setNewKeyExpires(false);
    setNewKeyExpiryDate('');
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(newKeySecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevokeKey = (key: ApiKey) => {
    setSelectedKey(key);
    setShowRevokeModal(true);
  };

  const toggleScope = (scope: ApiKeyScope) => {
    if (newKeyScopes.includes(scope)) {
      setNewKeyScopes(newKeyScopes.filter((s) => s !== scope));
    } else {
      setNewKeyScopes([...newKeyScopes, scope]);
    }
  };

  const getStatusBadge = (status: ApiKey['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'revoked':
        return <Badge variant="danger">Revoked</Badge>;
      case 'expired':
        return <Badge variant="warning">Expired</Badge>;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* API Keys Overview */}
      <Card>
        <CardHeader
          title="API Keys"
          description="Manage API keys for programmatic access to your account"
          action={
            <Button onClick={() => setShowCreateModal(true)}>
              Create API Key
            </Button>
          }
        />
        <CardContent className="p-0">
          {mockApiKeys.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {mockApiKeys.map((key) => (
                <div key={key.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900">{key.name}</h4>
                        {getStatusBadge(key.status)}
                      </div>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-gray-600">
                        {key.prefix}...
                      </code>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {key.scopes.map((scope) => (
                          <span
                            key={scope}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {key.status === 'active' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRevokeKey(key)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-6 text-sm text-gray-500">
                    <span>Created: {formatDate(key.createdAt)}</span>
                    <span>Last used: {formatDate(key.lastUsedAt)}</span>
                    {key.expiresAt && <span>Expires: {formatDate(key.expiresAt)}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No API keys</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new API key.
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowCreateModal(true)}>
                  Create API Key
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Documentation Link */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">API Documentation</h4>
              <p className="text-sm text-gray-500">
                Learn how to authenticate and use the Foop API
              </p>
            </div>
            <Button variant="secondary">View Docs</Button>
          </div>
        </CardContent>
      </Card>

      {/* Create API Key Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create API Key"
        size="lg"
      >
        <div className="space-y-6">
          <Input
            label="Key Name"
            placeholder="e.g., Production API Key"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            helperText="A descriptive name to identify this key"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions
            </label>
            <div className="space-y-3">
              {allScopes.map((scope) => (
                <div
                  key={scope.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    newKeyScopes.includes(scope.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleScope(scope.value)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{scope.label}</p>
                      <p className="text-sm text-gray-500">{scope.description}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={newKeyScopes.includes(scope.value)}
                      onChange={() => toggleScope(scope.value)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Toggle
              enabled={newKeyExpires}
              onChange={setNewKeyExpires}
              label="Set expiration date"
              description="Automatically revoke this key after a specific date"
            />
            {newKeyExpires && (
              <div className="mt-3">
                <Input
                  type="date"
                  value={newKeyExpiryDate}
                  onChange={(e) => setNewKeyExpiryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateKey}
            disabled={!newKeyName || newKeyScopes.length === 0}
          >
            Create Key
          </Button>
        </div>
      </Modal>

      {/* Secret Display Modal */}
      <Modal
        isOpen={showSecretModal}
        onClose={() => setShowSecretModal(false)}
        title="API Key Created"
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Save your API key
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  This is the only time you&apos;ll see this key. Copy it now and store it securely.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <code className="block w-full p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm break-all">
              {newKeySecret}
            </code>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleCopySecret}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => setShowSecretModal(false)}>Done</Button>
        </div>
      </Modal>

      {/* Revoke Confirmation Modal */}
      <Modal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        title="Revoke API Key"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to revoke <strong>{selectedKey?.name}</strong>? This action
            cannot be undone. Any applications using this key will immediately lose access.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowRevokeModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setShowRevokeModal(false);
              setSelectedKey(null);
            }}
          >
            Revoke Key
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}
