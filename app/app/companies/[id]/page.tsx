'use client';

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import type { Company } from "@/lib/trpc/schemas/companyList-schemas";
import CompanyRow from "./CompanyRow";
import CsvUploadModal from "./CsvUploadModal";
import Pagination from "./Pagination";
import ConfirmToggleModal from "./ConfirmToggleModal";
import { PageSpinner } from "@/components/ui";

export default function CompanyListDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;
  const [isAddingLoading, setIsAddingLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvUploadModal, setShowCsvUploadModal] = useState(false);
  const [showConfirmToggleModal, setShowConfirmToggleModal] = useState(false);
  const [newItemUrl, setNewItemUrl] = useState("");
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const { data: listData, isLoading } = trpc.companyLists.getById.useQuery({
    id: listId,
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
  });
  const utils = trpc.useUtils();

  const addCompanyMutation = trpc.companyLists.addCompany.useMutation({
    onSuccess: () => {
      setShowAddModal(false);
      setIsAddingLoading(false);
      setNewItemUrl("");
      setCurrentPage(1); // Reset to first page when adding
      utils.companyLists.getById.invalidate({ id: listId });
    },
    onError: () => {
      setIsAddingLoading(false);
    },
  });

  const removeCompanyMutation = trpc.companyLists.removeCompany.useMutation({
    onSuccess: () => {
      utils.companyLists.getById.invalidate({ id: listId });
    },
  });

  const updateCompanyListMutation = trpc.companyLists.update.useMutation({
    onSuccess: () => {
      utils.companyLists.getById.invalidate({ id: listId });
    },
  });

  const addCompaniesMutation = trpc.companyLists.addCompanies.useMutation({
    onSuccess: () => {
      setCurrentPage(1); // Reset to first page when adding bulk
      utils.companyLists.getById.invalidate({ id: listId });
    },
  });

  if (isLoading) {
    return <PageSpinner />;
  }

  if (!listData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">Company list not found</div>
      </div>
    );
  }

  const { list, companies, total } = listData;

  const toggleExpanded = (companyId: string) => {
    setExpandedCompanyId(expandedCompanyId === companyId ? null : companyId);
  };

  const handleAddItem = () => {
    if (!newItemUrl.trim()) return;

    setIsAddingLoading(true);
    addCompanyMutation.mutate({
      listId,
      linkedinUrl: newItemUrl,
    });
  };

  const handleDeleteItem = async (companyId: string) => {
    return new Promise<void>((resolve, reject) => {
      removeCompanyMutation.mutate(
        { companyId: companyId, listId },
        {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        }
      );
    });
  };

  const handleToggleEnabled = () => {
    setShowConfirmToggleModal(true);
  };

  const handleConfirmToggle = () => {
    updateCompanyListMutation.mutate({
      id: listId,
      enabled: !list.enabled,
    });
    setShowConfirmToggleModal(false);
  };

  const handleCsvUpload = async (linkedinUrls: string[]) => {
    await addCompaniesMutation.mutateAsync({
      listId,
      linkedinUrls,
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 backdrop-blur-xl bg-primary-900/95 rounded-2xl border border-primary-700/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => router.push('/app/companies')}
                  className="text-secondary-50 hover:text-white transition-colors"
                >
                  ← Back to Companies
                </button>
                <h1 className="text-3xl font-bold text-white">{list.name}</h1>
                <span className="px-3 py-1 rounded-full text-sm bg-primary-700/50 text-white">
                  🏢 Company List
                </span>
              </div>
              <p className="text-secondary-50">
                {total} companies • Created {new Date(list.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white">Status:</span>
                <button
                  onClick={handleToggleEnabled}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    list.enabled
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  {list.enabled ? '✓ Active' : '○ Inactive'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              + Add Single Company
            </button>
            <button
              onClick={() => setShowCsvUploadModal(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              📄 Upload CSV
            </button>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-primary-900/95 rounded-2xl border border-primary-700/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-800/90 border-b border-primary-700/40">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Company Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Added</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-700/40">
                {companies && companies.length > 0 ? (
                  companies.map((company: Company) => (
                    <CompanyRow
                      key={company.id}
                      company={company}
                      listId={listId}
                      isExpanded={expandedCompanyId === company.id}
                      onToggleExpanded={toggleExpanded}
                      onDelete={handleDeleteItem}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-secondary-50">
                      No companies in this list yet. Add some to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={total}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="backdrop-blur-xl bg-primary-900/95 rounded-2xl border border-primary-700/40 p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-4">Add Company</h2>
              <div className="mb-4">
                <label className="block text-white mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  value={newItemUrl}
                  onChange={(e) => setNewItemUrl(e.target.value)}
                  placeholder="https://linkedin.com/company/companyname"
                  className="w-full px-4 py-2 bg-primary-800 border border-primary-700 rounded-lg text-white placeholder-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddItem}
                  disabled={isAddingLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isAddingLoading ? 'Adding...' : 'Add'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewItemUrl("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <CsvUploadModal
          isOpen={showCsvUploadModal}
          onClose={() => setShowCsvUploadModal(false)}
          onUpload={handleCsvUpload}
        />

        <ConfirmToggleModal
          isOpen={showConfirmToggleModal}
          currentStatus={list?.enabled ?? false}
          listName={list?.name ?? ""}
          onConfirm={handleConfirmToggle}
          onCancel={() => setShowConfirmToggleModal(false)}
          isLoading={updateCompanyListMutation.isPending}
        />
      </div>
    </div>
  );
}
