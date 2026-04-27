"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import type { Company } from "@/lib/trpc/schemas/companyList-schemas";
import CompanyRow from "./CompanyRow";
import CompanySheet from "./CompanySheet";
import CsvUploadModal from "./CsvUploadModal";
import Pagination from "./Pagination";
import ConfirmToggleModal from "./ConfirmToggleModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import RenameListModal from "./RenameListModal";
import SignalsList from "./SignalsList";
import { Button, Badge, Card, PageSpinner, useToast, AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui";
import { ArrowLeft, Plus, Upload, X, RefreshCw, TrendingUp, Clock, Pencil, AlertTriangle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';

export default function CompanyListDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;
  const { addToast } = useToast();
  const [isAddingLoading, setIsAddingLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvUploadModal, setShowCsvUploadModal] = useState(false);
  const [showConfirmToggleModal, setShowConfirmToggleModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [newItemUrl, setNewItemUrl] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showNoMovementsDialog, setShowNoMovementsDialog] = useState(false);
  const [showValidationErrorDialog, setShowValidationErrorDialog] = useState<string | null>(null);
  const [showLargeListConfirmDialog, setShowLargeListConfirmDialog] = useState<{ total: number; estimatedMinutes: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const { data: listData, isLoading } = trpc.companyLists.getById.useQuery({
    id: listId,
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
  });

  const { data: movements = [] } = trpc.companyLists.getListMovements.useQuery({
    id: listId,
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
      addToast({
        title: "Company deleted",
        description: "The company has been removed from the list.",
        variant: "success",
        duration: 3000,
      });
      setCompanyToDelete(null);
    },
    onError: (error) => {
      addToast({
        title: "Failed to delete company",
        description: error.message || "An error occurred while deleting the company.",
        variant: "error",
        duration: 5000,
      });
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

  const triggerRefreshMutation = trpc.companyLists.triggerRefresh.useMutation({
    onSuccess: () => {
      utils.companyLists.getById.invalidate({ id: listId });
    },
  });

  const validateSignalsWithAIMutation = trpc.companyLists.validateSignalsWithAI.useMutation({
    onSuccess: (data) => {
      utils.companyLists.getById.invalidate({ id: listId });
      utils.companyLists.getListMovements.invalidate({ id: listId });
      // Navigate to movements page to see results
      router.push(`/app/companies/${listId}/movements`);
    },
    onError: (error) => {
      setShowValidationErrorDialog(error.message);
    },
  });

  if (isLoading) {
    return <PageSpinner />;
  }

  if (!listData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-foreground text-xl">Company list not found</div>
      </div>
    );
  }

  const { list, companies, total } = listData;

  const handleAddItem = () => {
    if (!newItemUrl.trim()) return;

    setIsAddingLoading(true);
    addCompanyMutation.mutate({
      listId,
      linkedinUrl: newItemUrl,
    });
  };

  const handleRequestDelete = (company: Company) => {
    setCompanyToDelete(company);
  };

  const handleConfirmDelete = () => {
    if (!companyToDelete) return;
    removeCompanyMutation.mutate({
      companyId: companyToDelete.id,
      listId,
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

  const handleConfirmRename = (newName: string) => {
    updateCompanyListMutation.mutate(
      {
        id: listId,
        name: newName,
      },
      {
        onSuccess: () => {
          setShowRenameModal(false);
        },
      }
    );
  };

  const handleCsvUpload = async (linkedinUrls: string[]) => {
    await addCompaniesMutation.mutateAsync({
      listId,
      linkedinUrls,
    });
  };

  const handleTriggerRefresh = () => {
    triggerRefreshMutation.mutate({ id: listId });
  };

  const isEnriching = list.syncStatus === 'ENRICHING';
  const hasEnrichmentError = list.syncStatus === 'FAILED';

  const handleValidateSignals = () => {
    if (!list.movementDefinitions || list.movementDefinitions.length === 0) {
      setShowNoMovementsDialog(true);
      return;
    }

    if (total > 50) {
      const estimatedMinutes = Math.ceil(total * 1 / 60);
      setShowLargeListConfirmDialog({ total, estimatedMinutes });
      return;
    }

    validateSignalsWithAIMutation.mutate({ id: listId });
  };

  const handleConfirmLargeListValidation = () => {
    setShowLargeListConfirmDialog(null);
    validateSignalsWithAIMutation.mutate({ id: listId });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Signal Validation Progress Banner */}
      {validateSignalsWithAIMutation.isPending && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-purple-500/10 border-4 border-purple-500 rounded-lg shadow-[4px_4px_0_0_var(--border)]"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-purple-500" />
            <div>
              <p className="font-bold text-purple-500 text-lg">Validating Signals with AI</p>
              <p className="text-sm text-purple-400">
                Processing {total} companies to detect movements. This may take a few minutes (est. ~1 second per company).
              </p>
              <p className="text-xs text-purple-300 mt-1">
                Please wait... The page will automatically refresh when validation is complete.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enrichment Progress Banner */}
      {isEnriching && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-blue-500/10 border-4 border-blue-500 rounded-lg shadow-[4px_4px_0_0_var(--border)]"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <div>
              <p className="font-bold text-blue-500 text-lg">Enrichment in Progress</p>
              <p className="text-sm text-blue-400">
                Enriching {total} companies with latest data. This may take several minutes.
                {list.enrichmentStartedAt && ` Started ${new Date(list.enrichmentStartedAt).toLocaleTimeString()}`}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enrichment Error Banner */}
      {hasEnrichmentError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-500/10 border-4 border-red-500 rounded-lg shadow-[4px_4px_0_0_var(--border)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-red-500 text-lg">Enrichment Failed</p>
              <p className="text-sm text-red-400">
                {list.enrichmentError || 'An unexpected error occurred during enrichment'}
              </p>
            </div>
            <Button
              variant="neutral"
              size="sm"
              onClick={handleValidateSignals}
              disabled={validateSignalsWithAIMutation.isPending}
            >
              Retry
            </Button>
          </div>
        </motion.div>
      )}

      {/* Main Info Card - Title, Stats, Signals, Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <Card className="relative overflow-hidden border-4 border-border bg-secondary-background shadow-[12px_12px_0_0_var(--border)]">
          {/* Neobrutalism dot pattern background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(93,217,193,0.25) 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px'
            }}
          />
          <div className="p-6 space-y-4 relative">
            {/* Breadcrumb & Title */}
            <div>
              <button
                onClick={() => router.push("/app/companies")}
                className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-3 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm">Back to Company Lists</span>
              </button>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{list.name}</h1>
                    <p className="text-foreground/60 text-sm">
                      {total} companies • Created {new Date(list.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRenameModal(true)}
                    disabled={isEnriching || validateSignalsWithAIMutation.isPending}
                    className="p-2 text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Rename list"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={list.enabled ? 'default' : 'neutral'}>
                    {list.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={() => router.push(`/app/companies/${listId}/movements`)}
                    disabled={isEnriching || validateSignalsWithAIMutation.isPending}
                    title="View signal movements"
                  >
                    <TrendingUp className="h-4 w-4" />
                    View Movements
                  </Button>
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={handleValidateSignals}
                    disabled={
                      isEnriching ||
                      validateSignalsWithAIMutation.isPending ||
                      !list.movementDefinitions ||
                      list.movementDefinitions.length === 0
                    }
                    title={
                      isEnriching
                        ? "Enrichment in progress..."
                        : "Validate signals with AI"
                    }
                  >
                    <RefreshCw className={`h-4 w-4 ${isEnriching || validateSignalsWithAIMutation.isPending ? 'animate-spin' : ''}`} />
                    {isEnriching ? 'Enriching...' : validateSignalsWithAIMutation.isPending ? 'Starting...' : 'Validate Signals'}
                  </Button>
                  {hasEnrichmentError && (
                    <Badge variant="default">
                      Last enrichment failed
                    </Badge>
                  )}
                  <Button
                    variant={list.enabled ? 'neutral' : 'default'}
                    size="sm"
                    onClick={handleToggleEnabled}
                    disabled={isEnriching || validateSignalsWithAIMutation.isPending}
                  >
                    {list.enabled ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </div>

            {/* List Info Grid - Neobrutalism Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-4 border-border">
              {/* Cadence Info */}
              <div className="relative overflow-hidden bg-dark-200 border-4 border-border p-4 shadow-[4px_4px_0_0_var(--border)]">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.5) 1.5px, transparent 1.5px)',
                    backgroundSize: '16px 16px'
                  }}
                />
                <div className="relative">
                  <p className="text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1">Enrichment Cadence</p>
                  <p className="text-lg font-black text-foreground mb-2">
                    {list.cadence || 'MANUAL'}
                    {list.cadenceInterval && ` (every ${list.cadenceInterval} ${list.cadence === 'DAILY' ? 'days' : list.cadence === 'WEEKLY' ? 'weeks' : 'months'})`}
                  </p>
                  {list.nextRunAt && (
                    <div className="inline-flex items-center gap-2 bg-main border-2 border-border px-3 py-1.5 shadow-[2px_2px_0_0_var(--border)]">
                      <Clock className="w-3.5 h-3.5 text-main-foreground" />
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-main-foreground uppercase tracking-wide">
                          {formatDistanceToNow(new Date(list.nextRunAt), { addSuffix: true })}
                        </span>
                        <span className="text-[10px] font-medium opacity-70">
                          {format(new Date(list.nextRunAt), 'MMM do \'at\' h:mm a')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Last Run */}
              <div className="relative overflow-hidden bg-dark-200 border-4 border-border p-4 shadow-[4px_4px_0_0_var(--border)]">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.5) 1.5px, transparent 1.5px)',
                    backgroundSize: '16px 16px'
                  }}
                />
                <div className="relative">
                  <p className="text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1">Last Enrichment</p>
                  <p className="text-lg font-black text-foreground">
                    {list.lastRunAt
                      ? format(new Date(list.lastRunAt), 'MMM do, yyyy')
                      : 'Never'}
                  </p>
                  {list.lastRunAt && (
                    <p className="text-xs text-foreground/50 mt-1">
                      {format(new Date(list.lastRunAt), 'h:mm a')}
                    </p>
                  )}
                </div>
              </div>

              {/* Sync Status */}
              <div className="relative overflow-hidden bg-dark-200 border-4 border-border p-4 shadow-[4px_4px_0_0_var(--border)]">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.5) 1.5px, transparent 1.5px)',
                    backgroundSize: '16px 16px'
                  }}
                />
                <div className="relative">
                  <p className="text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1">Sync Status</p>
                  <Badge variant={list.syncStatus === 'NORMAL' ? 'default' : 'neutral'}>
                    {list.syncStatus}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Signals List */}
            <SignalsList movementDefinitions={list.movementDefinitions ?? []} />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-gray-800">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowAddModal(true)}
                disabled={isEnriching || validateSignalsWithAIMutation.isPending}
              >
                <Plus className="h-4 w-4" /> Add Company
              </Button>
              <Button
                variant="neutral"
                size="sm"
                onClick={() => setShowCsvUploadModal(true)}
                disabled={isEnriching || validateSignalsWithAIMutation.isPending}
              >
                <Upload className="h-4 w-4" /> Upload CSV
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Companies Table */}
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/60">
                  Company Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/60">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/60">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/60">
                  Added
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/60">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {companies && companies.length > 0 ? (
                companies.map((company: Company, index: number) => (
                  <CompanyRow
                    key={company.id}
                    company={company}
                    onViewCompany={setSelectedCompany}
                    onRequestDelete={handleRequestDelete}
                    index={index}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-foreground/60"
                  >
                    <p className="text-lg mb-2">No companies in this list yet</p>
                    <p className="text-sm">Add companies to get started tracking</p>
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

      {/* Add Company Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-secondary-background opacity-100 p-8 rounded-2xl max-w-md w-full border border-gray-800"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Add Company</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-foreground text-sm font-medium mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={newItemUrl}
                  onChange={(e) => setNewItemUrl(e.target.value)}
                  placeholder="https://linkedin.com/company/companyname"
                  className="w-full px-4 py-3 bg-dark-200 border border-gray-700 rounded-lg text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
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
                  Add Company
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

      <RenameListModal
        isOpen={showRenameModal}
        currentName={list?.name ?? ""}
        onConfirm={handleConfirmRename}
        onCancel={() => setShowRenameModal(false)}
        isLoading={updateCompanyListMutation.isPending}
      />

      <ConfirmDeleteModal
        isOpen={!!companyToDelete}
        companyName={
          (companyToDelete?.latestMetadata as any)?.company?.company_name ||
          (companyToDelete?.latestMetadata as any)?.company_name ||
          companyToDelete?.linkedinUrl ||
          "this company"
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setCompanyToDelete(null)}
        isLoading={removeCompanyMutation.isPending}
      />

      <CompanySheet
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
      />

      <AlertDialog open={showNoMovementsDialog} onOpenChange={(open) => !open && setShowNoMovementsDialog(false)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-500/10 border-2 border-yellow-500 rounded-base">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <AlertDialogTitle>No Movement Definitions</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              This list has no movement definitions. Please add movement definitions to enable AI validation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowNoMovementsDialog(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!showValidationErrorDialog} onOpenChange={(open) => !open && setShowValidationErrorDialog(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-500/10 border-2 border-red-500 rounded-base">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <AlertDialogTitle>AI Validation Failed</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              {showValidationErrorDialog}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowValidationErrorDialog(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!showLargeListConfirmDialog} onOpenChange={(open) => !open && setShowLargeListConfirmDialog(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-500/10 border-2 border-yellow-500 rounded-base">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <AlertDialogTitle>Large List Warning</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              This list has {showLargeListConfirmDialog?.total} companies. Estimated validation time: {showLargeListConfirmDialog?.estimatedMinutes} minutes. During validation, you won&apos;t be able to add/remove companies or modify signals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLargeListValidation}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
