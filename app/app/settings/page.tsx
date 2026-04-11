'use client';

import { useState, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc";
import { PageSpinner } from "@/components/ui";

export default function SettingsPage() {
  const { organization, isLoaded } = useOrganization();
  const [orgName, setOrgName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Fetch organization from backend
  const { data: backendOrg, isLoading: isLoadingOrg, refetch } = trpc.organization.get.useQuery(
    { id: organization?.id || '' },
    { enabled: !!organization?.id }
  );

  // Update organization mutation
  const updateOrgMutation = trpc.organization.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditing(false);
    },
    onError: (error) => {
      alert(`Error updating organization: ${error.message}`);
    },
  });

  // Initialize form with organization data
  useEffect(() => {
    if (backendOrg) {
      setOrgName(backendOrg.name);
    } else if (organization) {
      setOrgName(organization.name);
    }
  }, [backendOrg, organization]);

  const handleSave = () => {
    if (!organization?.id || !orgName.trim()) return;
    updateOrgMutation.mutate({
      id: organization.id,
      name: orgName,
    });
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
            {/* Organization ID */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Organization ID
              </label>
              <div className="px-4 py-3 bg-primary-800/50 border border-primary-700/30 rounded-lg text-secondary-50">
                {organization?.id || 'N/A'}
              </div>
              <p className="text-secondary-50 text-xs mt-1">
                Your unique organization identifier (read-only)
              </p>
            </div>

            {/* Organization Name */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Organization Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-3 bg-primary-800/90 border border-primary-700/30 rounded-lg text-white placeholder-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              ) : (
                <div className="px-4 py-3 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white">
                  {orgName || organization?.name || 'N/A'}
                </div>
              )}
              <p className="text-secondary-50 text-xs mt-1">
                The display name for your organization
              </p>
            </div>

            {/* Domain (read-only) */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Domain
              </label>
              <div className="px-4 py-3 bg-primary-800/50 border border-primary-700/30 rounded-lg text-secondary-50">
                {backendOrg?.domain || 'Not set'}
              </div>
              <p className="text-secondary-50 text-xs mt-1">
                Contact support to update your organization domain
              </p>
            </div>

            {/* Created At */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Created
              </label>
              <div className="px-4 py-3 bg-primary-800/50 border border-primary-700/30 rounded-lg text-secondary-50">
                {backendOrg?.createdAt
                  ? new Date(backendOrg.createdAt).toLocaleString()
                  : organization?.createdAt
                  ? new Date(organization.createdAt).toLocaleString()
                  : 'N/A'}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={!orgName.trim() || updateOrgMutation.isPending}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      orgName.trim() && !updateOrgMutation.isPending
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white'
                        : 'bg-primary-800/90 text-secondary-400 cursor-not-allowed'
                    }`}
                  >
                    {updateOrgMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setOrgName(backendOrg?.name || organization?.name || '');
                    }}
                    disabled={updateOrgMutation.isPending}
                    className="px-6 py-3 bg-primary-800/90 hover:bg-primary-700/90 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-lg font-semibold transition-all"
                >
                  Edit Organization
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="backdrop-blur-xl bg-red-950/30 rounded-2xl border border-red-500/40 overflow-hidden">
          <div className="p-6 border-b border-red-500/40">
            <h2 className="text-2xl font-bold text-red-400">Danger Zone</h2>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-white font-semibold mb-2">Delete Organization</h3>
              <p className="text-secondary-50 text-sm mb-4">
                Organization deletion is not self-serve. This action requires manual review and cannot be undone.
              </p>
              <button
                onClick={() => {
                  alert('Organization deletion is not self-serve. Please contact team@tryhog.com to delete your organization.');
                }}
                className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold transition-all border border-red-500/30"
              >
                Request Organization Deletion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
