'use client';

import { useState, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc";
import { Copy, Eye, EyeOff, Key, Trash2 } from 'lucide-react';
import {
  PageSpinner,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from "@/components/ui";

export default function SettingsPage() {
  const { organization, isLoaded } = useOrganization();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  // Fetch API keys
  const { data: apiKeys, isLoading: isLoadingKeys, refetch: refetchKeys } = trpc.apiKey.getAll.useQuery(
    { orgId: organization?.id || '' },
    { enabled: !!organization?.id }
  );

  // Create API key mutation
  const createApiKeyMutation = trpc.apiKey.create.useMutation({
    onSuccess: (data) => {
      setNewApiKey(data.rawKey);
      refetchKeys();
      setSuccessMessage('API key created successfully! Copy it now - you won\'t see it again.');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error) => {
      setErrorMessage(`Error creating API key: ${error.message}`);
    },
  });

  // Delete API key mutation
  const deleteApiKeyMutation = trpc.apiKey.delete.useMutation({
    onSuccess: () => {
      refetchKeys();
      setKeyToDelete(null);
      setSuccessMessage('API key deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error) => {
      setErrorMessage(`Error deleting API key: ${error.message}`);
    },
  });

  // Fetch organization from backend
  const { data: backendOrg, isLoading: isLoadingOrg, refetch } = trpc.organization.get.useQuery(
    { id: organization?.id || '' },
    { enabled: !!organization?.id }
  );

  // Update webhook URL mutation
  const updateWebhookMutation = trpc.organization.updateWebhook.useMutation({
    onSuccess: () => {
      refetch();
      setSuccessMessage('Webhook URL updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error) => {
      setErrorMessage(`Error updating webhook URL: ${error.message}`);
    },
  });

  // Initialize form with organization data
  useEffect(() => {
    if (backendOrg?.webhookUrl) {
      setWebhookUrl(backendOrg.webhookUrl);
    }
  }, [backendOrg]);

  const handleSave = () => {
    if (!organization?.id) return;

    // Validate URL format if provided
    if (webhookUrl.trim() && !isValidUrl(webhookUrl.trim())) {
      setErrorMessage('Please enter a valid HTTP or HTTPS URL');
      return;
    }

    updateWebhookMutation.mutate({
      id: organization.id,
      webhookUrl: webhookUrl.trim() || null,
    });
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  if (!isLoaded || isLoadingOrg) {
    return <PageSpinner />;
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white">Manage your organization settings</p>
        </div>

        {/* Organization Settings */}
        <div className="bg-secondary-background opacity-100 rounded-2xl border border-gray-800 overflow-hidden mb-6">
          <div className="p-6 border-b border-primary-700/40">
            <h2 className="text-2xl font-bold text-white">Organization</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Organization Name (read-only) */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Organization Name
              </label>
              <div className="px-4 py-3 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white">
                {organization?.name || backendOrg?.name || 'N/A'}
              </div>
              <p className="text-secondary-50 text-xs mt-1">
                Your organization name
              </p>
            </div>

            {/* Webhook URL */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-domain.com/webhooks/third-eye"
                className="w-full px-4 py-3 bg-primary-800/90 border border-primary-700/30 rounded-lg text-white placeholder-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-secondary-50 text-xs mt-1">
                POST requests will be sent to this URL when movements are detected. Leave empty to disable webhooks.
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="px-4 py-3 bg-green-500/20 border border-green-500/40 rounded-lg text-green-400">
                {successMessage}
              </div>
            )}

            {/* Action Button */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={updateWebhookMutation.isPending}
                size="lg"
              >
                {updateWebhookMutation.isPending ? 'Saving...' : 'Save Webhook URL'}
              </Button>

              {webhookUrl && webhookUrl !== (backendOrg?.webhookUrl || '') && (
                <Button
                  onClick={() => setWebhookUrl(backendOrg?.webhookUrl || '')}
                  disabled={updateWebhookMutation.isPending}
                  variant="neutral"
                  size="lg"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-secondary-background opacity-100 rounded-2xl border border-gray-800 overflow-hidden mb-6">
          <div className="p-6 border-b border-primary-700/40 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">API Keys</h2>
              <p className="text-secondary-50 text-sm mt-1">
                Generate API keys to access Third Eye programmatically.{' '}
                <a href="/api-docs" target="_blank" className="text-primary-400 hover:text-primary-300 underline">
                  View API Documentation →
                </a>
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Create API Key Button */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white text-sm">
                  API keys allow external applications to interact with your Third Eye data.
                </p>
                <p className="text-secondary-50 text-xs mt-1">
                  Keep your API keys secure and never share them publicly.
                </p>
              </div>
              <Button
                onClick={() => {
                  if (!organization?.id) return;
                  createApiKeyMutation.mutate({ orgId: organization.id });
                }}
                disabled={createApiKeyMutation.isPending}
                size="lg"
              >
                <Key className="w-4 h-4 mr-2" />
                {createApiKeyMutation.isPending ? 'Creating...' : 'Create API Key'}
              </Button>
            </div>

            {/* New API Key Display */}
            {newApiKey && (
              <div className="bg-green-500/10 border border-green-500/40 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-green-400 font-semibold mb-1">New API Key Created!</p>
                    <p className="text-green-300/80 text-sm mb-3">
                      Copy this key now. For security, it won&apos;t be shown again.
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-primary-800/80 border border-primary-700/40 rounded px-3 py-2 text-sm text-white font-mono">
                        {newApiKey}
                      </code>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(newApiKey);
                          setSuccessMessage('API key copied to clipboard!');
                        }}
                        size="sm"
                        variant="neutral"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  <button
                    onClick={() => setNewApiKey(null)}
                    className="text-green-300/60 hover:text-green-300 ml-2"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Existing API Keys List */}
            <div>
              <h3 className="text-white font-semibold mb-3">Your API Keys</h3>
              {isLoadingKeys ? (
                <div className="text-secondary-50 text-sm py-4 text-center">
                  Loading API keys...
                </div>
              ) : !apiKeys || apiKeys.length === 0 ? (
                <div className="text-secondary-50 text-sm italic py-4 text-center border border-dashed border-primary-700/40 rounded-lg">
                  No API keys yet. Create one to get started.
                </div>
              ) : (
                <div className="space-y-2">
                  {apiKeys.map((key: any) => (
                    <div key={key.id} className="bg-primary-800/50 border border-primary-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Key className="w-4 h-4 text-primary-400" />
                            <code className="text-sm text-white font-mono">
                              {key.keyPrefix}••••••••••••••••
                            </code>
                            {key.name && (
                              <span className="text-xs text-secondary-300 ml-2">
                                ({key.name})
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4 text-xs text-secondary-50">
                            <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                            {key.lastUsedAt && (
                              <span>Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => setKeyToDelete(key.id)}
                          variant="reverse"
                          size="sm"
                          disabled={deleteApiKeyMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Webhook Info */}
        <div className="bg-secondary-background opacity-100 rounded-2xl border border-gray-800 overflow-hidden mb-6">
          <div className="p-6 border-b border-primary-700/40">
            <h2 className="text-2xl font-bold text-white">Webhook Details</h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-white font-semibold mb-2">How Webhooks Work</h3>
              <p className="text-secondary-50 text-sm mb-4">
                When a movement is detected in any of your people or company lists, Third Eye will send a POST request to your webhook URL with the movement details.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Payload Structure</h3>
              <pre className="bg-primary-800/50 border border-primary-700/30 rounded-lg p-4 text-xs text-secondary-50 overflow-x-auto">
{`{
  "eventId": "uuid",
  "timestamp": "2026-04-19T10:00:00Z",
  "orgId": "org_123",
  "orgName": "Your Organization",
  "list": {
    "id": "list_456",
    "name": "Target Accounts",
    "type": "people" | "company",
    "cadence": "DAILY" | "WEEKLY" | "MONTHLY" | "MANUAL",
    "enabled": true
  },
  "movement": {
    "id": "mov_789",
    "type": "JOB_CHANGED",
    "confidence": 95,
    "reasoning": "...",
    "evidence": [...],
    "detectedAt": "2026-04-19T10:00:00Z"
  },
  "entity": {
    "id": "profile_abc",
    "linkedinUrl": "https://linkedin.com/in/...",
    "type": "profile" | "company",
    "data": { /* Full enriched data */ }
  }
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Retry Policy</h3>
              <p className="text-secondary-50 text-sm">
                If webhook delivery fails, Third Eye will retry with exponential backoff:
              </p>
              <ul className="text-secondary-50 text-sm ml-4 mt-2 space-y-1">
                <li>• Attempt 1: 1 minute after initial failure</li>
                <li>• Attempt 2: 5 minutes after attempt 1</li>
                <li>• Attempt 3: 15 minutes after attempt 2</li>
                <li>• Attempt 4: 1 hour after attempt 3</li>
                <li>• Attempt 5: 6 hours after attempt 4</li>
                <li>• After 5 attempts: marked as FAILED</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Testing Your Webhook</h3>
              <p className="text-secondary-50 text-sm">
                Use services like <a href="https://webhook.site" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 underline">webhook.site</a> to test webhook delivery and inspect payloads.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Dialog */}
      <AlertDialog open={!!errorMessage} onOpenChange={() => setErrorMessage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorMessage(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete API Key Confirmation Dialog */}
      <AlertDialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this API key. Any applications using this key will stop working immediately.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setKeyToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!organization?.id || !keyToDelete) return;
                deleteApiKeyMutation.mutate({
                  orgId: organization.id,
                  keyId: keyToDelete,
                });
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteApiKeyMutation.isPending}
            >
              {deleteApiKeyMutation.isPending ? 'Deleting...' : 'Delete Key'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
