'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function CompaniesPage() {
  const router = useRouter();
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Fetch company lists using tRPC
  const { data: companyLists = [], isLoading } = trpc.companyLists.getAll.useQuery();

  // Create list mutation
  const utils = trpc.useUtils();
  const createList = trpc.companyLists.create.useMutation({
    onSuccess: () => {
      utils.companyLists.getAll.invalidate();
      setNewListName('');
      setIsCreatingList(false);
    },
    onError: (error) => {
      alert(`Error creating list: ${error.message}`);
    },
  });

  // Delete list mutation
  const deleteListMutation = trpc.companyLists.delete.useMutation({
    onSuccess: () => {
      utils.companyLists.getAll.invalidate();
    },
    onError: (error) => {
      alert(`Error deleting list: ${error.message}`);
    },
  });

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    createList.mutate({ name: newListName });
  };

  const handleDeleteList = (listId: string) => {
    if (confirm('Are you sure you want to delete this list?')) {
      deleteListMutation.mutate({ id: listId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Company Lists</h1>
          <p className="text-white">Manage and track your company lists</p>
        </div>

        {/* Company Lists Table */}
        <div className="backdrop-blur-xl bg-primary-900/95 rounded-2xl border border-primary-700/40 overflow-hidden">
          <div className="p-6 border-b border-primary-700/40">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">All Company Lists</h2>
              <button
                onClick={() => setIsCreatingList(true)}
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Company List
              </button>
            </div>
          </div>

          {companyLists.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-7xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold text-white mb-2">No company lists yet</h3>
              <p className="text-secondary-50 mb-6">Create your first company tracking list to get started</p>
              <button
                onClick={() => setIsCreatingList(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-lg transition-all inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Company List
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-700/40">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Items</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Created</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companyLists.map((list, index) => (
                    <tr
                      key={list.id}
                      className={`border-b border-primary-700/30 hover:bg-primary-800/90 transition-colors ${
                        index % 2 === 0 ? 'bg-primary-900/50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🏢</span>
                          <span className="text-white font-medium">{list.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white">0</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-secondary-50 text-sm">
                          {list.createdAt ? new Date(list.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/app/companies/${list.id}`)}
                            className="px-3 py-1.5 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteList(list.id)}
                            disabled={deleteListMutation.isPending}
                            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-all flex items-center gap-1 border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {deleteListMutation.isPending ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create List Modal */}
      {isCreatingList && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-primary-900/90 border border-primary-700/30 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Company List</h2>

            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                List Name
              </label>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g., Fortune 500 Companies"
                className="w-full px-4 py-3 bg-primary-800/90 border border-primary-700/30 rounded-lg text-white placeholder-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateList();
                }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim() || createList.isPending}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  newListName.trim() && !createList.isPending
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white'
                    : 'bg-primary-800/90 text-secondary-400 cursor-not-allowed'
                }`}
              >
                {createList.isPending ? 'Creating...' : 'Create List'}
              </button>
              <button
                onClick={() => {
                  setIsCreatingList(false);
                  setNewListName('');
                }}
                disabled={createList.isPending}
                className="px-6 py-3 bg-primary-800/90 hover:bg-primary-700/90 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
