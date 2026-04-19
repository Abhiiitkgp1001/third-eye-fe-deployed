'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import {
  Button,
  Badge,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  PageSpinner,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui";
import { Plus, Users, Eye, Trash2, Loader2, TrendingUp, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateListWizard } from "./CreateListWizard";
import { formatCadence } from "@/lib/trpc/schemas/peopleList-schemas";

export default function PeoplePage() {
  const router = useRouter();
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch people lists using tRPC
  const { data: peopleLists = [], isLoading } = trpc.peopleLists.getAll.useQuery();

  // Delete list mutation
  const utils = trpc.useUtils();
  const deleteListMutation = trpc.peopleLists.delete.useMutation({
    onSuccess: () => {
      utils.peopleLists.getAll.invalidate();
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      setErrorMessage(`Error deleting list: ${error.message}`);
      setDeleteConfirmId(null);
    },
  });

  const handleDeleteList = (listId: string) => {
    setDeleteConfirmId(listId);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteListMutation.mutate({ id: deleteConfirmId });
    }
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex-shrink-0"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">People Lists</h1>
            <p className="text-foreground/60">Manage and track your people lists</p>
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
        className="glass rounded-xl overflow-visible flex-1 flex flex-col min-h-0"
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
          <div className="w-full flex-1 flex flex-col">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Name</TableHead>
                  <TableHead className="w-[12%]">Total People</TableHead>
                  <TableHead className="w-[10%]">Status</TableHead>
                  <TableHead className="w-[18%]">Signals</TableHead>
                  <TableHead className="w-[12%]">Cadence</TableHead>
                  <TableHead className="w-[10%]">Created</TableHead>
                  <TableHead className="text-right w-[13%]">Actions</TableHead>
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
                        <span className="text-foreground font-medium">{list.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-foreground font-semibold">{list.profileCount}</span>
                      <span className="text-foreground/60 text-sm ml-1">profiles</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={list.enabled ? 'default' : 'neutral'}>
                        {list.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {list.movementDefinitions && list.movementDefinitions.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {list.movementDefinitions.slice(0, 3).map((movement) => (
                            <Badge key={movement.name} variant="neutral" className="font-mono text-[9px]">
                              {movement.name}
                            </Badge>
                          ))}
                          {list.movementDefinitions.length > 3 && (
                            <Badge variant="neutral" className="text-[9px]">
                              +{list.movementDefinitions.length - 3}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-foreground/50 text-xs">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-foreground text-sm">
                        {formatCadence(list.cadence, list.cadenceInterval)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-foreground/60 text-sm">
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
                          onClick={() => router.push(`/app/people/${list.id}/movements`)}
                          title="View signal movements"
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Movements
                        </Button>
                        <DropdownMenu
                          trigger={
                            <Button
                              variant="neutral"
                              size="sm"
                              title="More actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <DropdownMenuItem
                            destructive
                            onClick={() => handleDeleteList(list.id)}
                            disabled={deleteListMutation.isPending}
                          >
                            {deleteListMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenu>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete People List</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this list? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteListMutation.isPending}>
              {deleteListMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
