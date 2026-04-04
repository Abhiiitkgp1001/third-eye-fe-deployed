"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import ProfileRow from "./ProfileRow";
import { Profile } from "@/lib/trpc/schemas/peopleList-schemas";

export default function PeopleListDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;
  const [isAddingLoading, setIsAddingLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemUrl, setNewItemUrl] = useState("");
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: listData, isLoading } = trpc.peopleLists.getById.useQuery({
    id: listId,
  });
  const utils = trpc.useUtils();

  const addProfileMutation = trpc.peopleLists.addProfile.useMutation({
    onSuccess: () => {
      setShowAddModal(false);
      setIsAddingLoading(false);
      setNewItemUrl("");
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!listData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">People list not found</div>
      </div>
    );
  }

  const { list, profiles, total } = listData;

  const toggleExpanded = (profileId: string) => {
    setExpandedProfileId(expandedProfileId === profileId ? null : profileId);
  };

  const handleAddItem = () => {
    if (!newItemUrl.trim()) return;

    setIsAddingLoading(true);
    addProfileMutation.mutate({
      listId,
      linkedinUrl: newItemUrl,
    });
  };

  const handleDeleteItem = async (liUrl: string) => {
    return new Promise<void>((resolve, reject) => {
      removeProfileMutation.mutate(
        { liUrl: liUrl, listId },
        {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        }
      );
    });
  };

  const handleToggleEnabled = () => {
    updatePeopleListMutation.mutate({
      id: listId,
      enabled: !list.enabled,
    });
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCsv(true);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      const urls = lines
        .slice(1)
        .map((line) => {
          const url = line.split(",")[0].trim();
          return url;
        })
        .filter((url) => url && url.startsWith("http"));

      for (const url of urls) {
        await addProfileMutation.mutateAsync({
          listId,
          linkedinUrl: url,
        });
      }

      alert(`Successfully added ${urls.length} profiles`);
      utils.peopleLists.getById.invalidate({ id: listId });
    } catch (error) {
      console.error("Error uploading CSV:", error);
      alert("Failed to upload CSV");
    } finally {
      setUploadingCsv(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 backdrop-blur-xl bg-primary-900/95 rounded-2xl border border-primary-700/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => router.push("/app/people")}
                  className="text-secondary-50 hover:text-white transition-colors"
                >
                  � Back to People
                </button>
                <h1 className="text-3xl font-bold text-white">{list.name}</h1>
                <span className="px-3 py-1 rounded-full text-sm bg-primary-700/50 text-white">
                  =e People List
                </span>
              </div>
              <p className="text-secondary-50">
                {total} profiles " Created{" "}
                {new Date(list.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white">Status:</span>
                <button
                  onClick={handleToggleEnabled}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    list.enabled
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-600 hover:bg-gray-700 text-white"
                  }`}
                >
                  {list.enabled ? " Active" : "� Inactive"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              + Add Single Profile
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingCsv}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {uploadingCsv ? "Uploading..." : "=� Upload CSV"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="backdrop-blur-xl bg-primary-900/95 rounded-2xl border border-primary-700/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-800/90 border-b border-primary-700/40">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Name / Profile
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Headline
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Added
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-700/40">
                {profiles && profiles.length > 0 ? (
                  profiles.map((profile: Profile) => (
                    <ProfileRow
                      key={profile.id}
                      profile={profile}
                      listId={listId}
                      isExpanded={expandedProfileId === profile.id}
                      onToggleExpanded={toggleExpanded}
                      onDelete={handleDeleteItem}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-secondary-50"
                    >
                      No profiles in this list yet. Add some to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="backdrop-blur-xl bg-primary-900/95 rounded-2xl border border-primary-700/40 p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-4">
                Add Profile
              </h2>
              <div className="mb-4">
                <label className="block text-white mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  value={newItemUrl}
                  onChange={(e) => setNewItemUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2 bg-primary-800 border border-primary-700 rounded-lg text-white placeholder-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddItem}
                  disabled={isAddingLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isAddingLoading ? "Adding..." : "Add"}
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
      </div>
    </div>
  );
}
