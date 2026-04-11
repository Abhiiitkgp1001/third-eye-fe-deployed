'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button, Badge, EmptyState, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, PageSpinner } from "@/components/ui";
import { Plus, Users, Eye, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateListWizard } from "./CreateListWizard";
import { formatCadence } from "@/lib/trpc/schemas/peopleList-schemas";

export default function PeoplePage() {
  const router = useRouter();
  const [isCreatingList, setIsCreatingList] = useState(false);

  // Fetch people lists using tRPC
  const { data: peopleLists = [], isLoading } = trpc.peopleLists.getAll.useQuery();

  // Delete list mutation
  const utils = trpc.useUtils();
  const deleteListMutation = trpc.peopleLists.delete.useMutation({
    onSuccess: () => {
      utils.peopleLists.getAll.invalidate();
    },
    onError: (error) => {
      alert(`Error deleting list: ${error.message}`);
    },
  });

  const handleDeleteList = (listId: string) => {
    if (confirm('Are you sure you want to delete this list?')) {
      deleteListMutation.mutate({ id: listId });
    }
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">People Lists</h1>
            <p className="text-gray-400">Manage and track your people lists</p>
          </div>
          <Button onClick={() => setIsCreatingList(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create List
          </Button>
        </div>
      </motion.div>

      {/* Lists Grid/Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass rounded-xl overflow-hidden"
      >
        {peopleLists.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Users}
              title="No people lists yet"
              description="Create your first people tracking list to get started"
              actionLabel="Create Your First List"
              onAction={() => setIsCreatingList(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Total People</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadence</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {peopleLists.map((list, index) => (
                  <motion.tr
                    key={list.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-dark-200/50 transition-colors border-b border-gray-800"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-white font-medium">{list.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-white font-semibold">{list.profileCount}</span>
                      <span className="text-gray-400 text-sm ml-1">profiles</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={list.enabled ? 'default' : 'neutral'}>
                        {list.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-300 text-sm">
                        {formatCadence(list.cadence, list.cadenceInterval)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-400 text-sm">
                        {list.createdAt ? new Date(list.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="noShadow"
                          size="sm"
                          onClick={() => router.push(`/app/people/${list.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="neutral"
                          size="sm"
                          onClick={() => handleDeleteList(list.id)}
                          disabled={deleteListMutation.isPending}
                        >
                          {deleteListMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      <CreateListWizard open={isCreatingList} onOpenChange={setIsCreatingList} />
    </div>
  );
}
