"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import ProfileRow from "./ProfileRow";
import ProfileSheet from "./ProfileSheet";
import CsvUploadModal from "./CsvUploadModal";
import Pagination from "./Pagination";
import ConfirmToggleModal from "./ConfirmToggleModal";
import { Profile } from "@/lib/trpc/schemas/peopleList-schemas";
import { Button, Badge, Card, PageSpinner } from "@/components/ui";
import { ArrowLeft, Plus, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PeopleListDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;
  const [isAddingLoading, setIsAddingLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvUploadModal, setShowCsvUploadModal] = useState(false);
  const [showConfirmToggleModal, setShowConfirmToggleModal] = useState(false);
  const [newItemUrl, setNewItemUrl] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const { data: listData, isLoading } = trpc.peopleLists.getById.useQuery({
    id: listId,
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
  });
  const utils = trpc.useUtils();

  const addProfileMutation = trpc.peopleLists.addProfile.useMutation({
    onSuccess: () => {
      setShowAddModal(false);
      setIsAddingLoading(false);
      setNewItemUrl("");
      setCurrentPage(1);
      utils.peopleLists.getById.invalidate({ id: listId });
    },
    onError: () => {
      setIsAddingLoading(false);
    },
  });

  const removeProfileMutation = trpc.peopleLists.removeProfile.useMutation({
    onSuccess: () => {
      utils.peopleLists.getById.invalidate({ id: listId });
    },
  });

  const updatePeopleListMutation = trpc.peopleLists.update.useMutation({
    onSuccess: () => {
      utils.peopleLists.getById.invalidate({ id: listId });
    },
  });

  const addProfilesMutation = trpc.peopleLists.addProfiles.useMutation({
    onSuccess: () => {
      setCurrentPage(1);
      utils.peopleLists.getById.invalidate({ id: listId });
    },
  });

  if (isLoading) {
    return <PageSpinner />;
  }

  if (!listData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">People list not found</div>
      </div>
    );
  }

  const { list, profiles, total } = listData;

  const handleAddItem = () => {
    if (!newItemUrl.trim()) return;
    setIsAddingLoading(true);
    addProfileMutation.mutate({
      listId,
      linkedinUrl: newItemUrl,
    });
  };

  const handleDeleteItem = async (profileId: string) => {
    return new Promise<void>((resolve, reject) => {
      removeProfileMutation.mutate(
        { profileId: profileId, listId },
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
    updatePeopleListMutation.mutate({
      id: listId,
      enabled: !list.enabled,
    });
    setShowConfirmToggleModal(false);
  };

  const handleCsvUpload = async (linkedinUrls: string[]) => {
    await addProfilesMutation.mutateAsync({
      listId,
      linkedinUrls,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <Card>
          <div className="space-y-4">
            {/* Breadcrumb & Title */}
            <div>
              <button
                onClick={() => router.push("/app/people")}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-3 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm">Back to People Lists</span>
              </button>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{list.name}</h1>
                  <p className="text-gray-400 text-sm">
                    {total} profiles • Created {new Date(list.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={list.enabled ? 'default' : 'neutral'}>
                    {list.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant={list.enabled ? 'neutral' : 'default'}
                    size="sm"
                    onClick={handleToggleEnabled}
                  >
                    {list.enabled ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4" /> Add Profile
              </Button>
              <Button
                variant="neutral"
                size="sm"
                onClick={() => setShowCsvUploadModal(true)}
              >
                <Upload className="h-4 w-4" /> Upload CSV
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Profiles Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Name / Profile
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Headline
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Added
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {profiles && profiles.length > 0 ? (
                profiles.map((profile: Profile, index: number) => (
                  <ProfileRow
                    key={profile.id}
                    profile={profile}
                    onViewProfile={setSelectedProfile}
                    onDelete={handleDeleteItem}
                    index={index}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <p className="text-lg mb-2">No profiles in this list yet</p>
                    <p className="text-sm">Add profiles to get started tracking</p>
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
      </motion.div>

      {/* Add Profile Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass p-8 rounded-2xl max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add Profile</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={newItemUrl}
                  onChange={(e) => setNewItemUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-3 bg-dark-200 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddItem();
                  }}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="default"
                  onClick={handleAddItem}
                  disabled={isAddingLoading || !newItemUrl.trim()}
                  className="flex-1"
                >
                  Add Profile
                </Button>
                <Button
                  variant="neutral"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewItemUrl("");
                  }}
                  disabled={isAddingLoading}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProfileSheet
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />

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
        isLoading={updatePeopleListMutation.isPending}
      />
    </div>
  );
}
