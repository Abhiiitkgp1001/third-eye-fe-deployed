'use client';

import { OrganizationSwitcher } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useOrganization } from '@clerk/nextjs';

function SelectOrganizationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { organization, isLoaded } = useOrganization();

  const redirectUrl = searchParams.get('__clerk_redirect_url') || '/app';
  const preselectedOrgId = searchParams.get('__clerk_org_id');

  useEffect(() => {
    // If we have an organization loaded and it matches the preselected one (or we have any org),
    // redirect to the target page
    if (isLoaded && organization) {
      // If we have a preselected org, check if it matches
      if (preselectedOrgId) {
        if (organization.id === preselectedOrgId) {
          router.push(redirectUrl);
        }
      } else {
        // No preselected org, just redirect once any org is active
        router.push(redirectUrl);
      }
    }
  }, [isLoaded, organization, preselectedOrgId, redirectUrl, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Select Organization
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Choose an organization to continue
          </p>
        </div>

        <div className="flex justify-center">
          <OrganizationSwitcher
            hidePersonal={false}
            afterSelectOrganizationUrl={redirectUrl}
            afterCreateOrganizationUrl={redirectUrl}
            appearance={{
              elements: {
                rootBox: 'w-full',
                organizationSwitcherTrigger: 'w-full justify-center',
              },
            }}
          />
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          You can switch organizations anytime from the dashboard
        </div>
      </div>
    </div>
  );
}

export default function SelectOrganizationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SelectOrganizationContent />
    </Suspense>
  );
}
