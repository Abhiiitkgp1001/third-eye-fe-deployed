'use client';

import { useState, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc";
import {
  PageSpinner,
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";

export default function SettingsPage() {
  const { organization, isLoaded } = useOrganization();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        <div className="backdrop-blur-xl bg-primary-900/95 rounded-2xl border border-primary-700/40 overflow-hidden mb-6">
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
              <button
                onClick={handleSave}
                disabled={updateWebhookMutation.isPending}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  !updateWebhookMutation.isPending
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white'
                    : 'bg-primary-800/90 text-secondary-400 cursor-not-allowed'
                }`}
              >
                {updateWebhookMutation.isPending ? 'Saving...' : 'Save Webhook URL'}
              </button>

              {webhookUrl && webhookUrl !== (backendOrg?.webhookUrl || '') && (
                <button
                  onClick={() => setWebhookUrl(backendOrg?.webhookUrl || '')}
                  disabled={updateWebhookMutation.isPending}
                  className="px-6 py-3 bg-primary-800/90 hover:bg-primary-700/90 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Webhook Info */}
        <div className="backdrop-blur-xl bg-primary-900/95 rounded-2xl border border-primary-700/40 overflow-hidden">
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
    </div>
  );
}
