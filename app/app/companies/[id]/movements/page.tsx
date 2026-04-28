"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Badge, Card, PageSpinner, Button, Avatar, AvatarImage, AvatarFallback } from "@/components/ui";
import { ArrowLeft, TrendingUp, Sparkles, Calendar, Target, BarChart3, ExternalLink, Filter, X, Search, ChevronDown, ChevronRight, MessageSquareText, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const isPositiveMovement = (movement: string) =>
  movement !== "NO_CHANGE" &&
  !movement.endsWith("_NOT_CHANGED") &&
  !movement.endsWith("_NOT_DETECTED");

export default function MovementsPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const [selectedMovementTypes, setSelectedMovementTypes] = useState<Set<string>>(new Set());
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [expandedMovements, setExpandedMovements] = useState<Set<string>>(new Set());

  const { data: listData, isLoading: listLoading } = trpc.companyLists.getById.useQuery({
    id: listId,
    limit: 1000,
    offset: 0,
  });

  const { data: movements = [], isLoading: movementsLoading } = trpc.companyLists.getListMovements.useQuery({
    id: listId,
  });

  const actualMovements = useMemo(() => movements.filter(m => m.movement !== "NO_CHANGE"), [movements]);
  const noChangeRecords = useMemo(() => movements.filter(m => m.movement === "NO_CHANGE"), [movements]);

  const totalMovements = actualMovements.length;
  const totalValidations = movements.length;
  const uniqueCompaniesWithMovements = new Set(actualMovements.map(m => m.companyId)).size;
  const uniqueCompaniesValidated = new Set(movements.map(m => m.companyId)).size;

  const movementsByType = useMemo(() => {
    return actualMovements.reduce((acc, m) => {
      acc[m.movement] = (acc[m.movement] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [actualMovements]);

  const allMovementTypes = useMemo(() => {
    const types = new Set(movements.map(m => m.movement));
    return Array.from(types).sort();
  }, [movements]);

  const averageConfidence = useMemo(() => {
    return actualMovements.length > 0
      ? Math.round(actualMovements.reduce((sum, m) => sum + (m.metadata?.confidence || 0), 0) / actualMovements.length)
      : 0;
  }, [actualMovements]);

  const companiesWithMovements = useMemo(() => {
    if (!listData) return [];
    const { companies } = listData;
    const uniqueCompanyIds = new Set(movements.map(m => m.companyId));
    return companies
      .filter(c => uniqueCompanyIds.has(c.id))
      .map(c => {
        const rawMeta = c.latestMetadata as any;
        const isAgg = rawMeta && typeof rawMeta === 'object' && 'company' in rawMeta;
        const companyData = isAgg ? rawMeta.company : rawMeta;
        const displayName = companyData?.name || companyData?.company_name || c.linkedinUrl;
        return {
          id: c.id,
          displayName,
          linkedinUrl: c.linkedinUrl,
          movementCount: movements.filter(m => m.companyId === c.id).length,
        };
      })
      .sort((a, b) => b.movementCount - a.movementCount);
  }, [movements, listData]);

  const filteredMovements = useMemo(() => {
    if (!listData) return [];
    const { companies } = listData;
    let filtered = [...movements];

    if (selectedCompanyId) {
      filtered = filtered.filter(m => m.companyId === selectedCompanyId);
    }

    if (selectedMovementTypes.size > 0) {
      filtered = filtered.filter(m => selectedMovementTypes.has(m.movement));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => {
        const company = companies.find(c => c.id === m.companyId);
        const rawMeta = company?.latestMetadata as any;
        const isAgg = rawMeta && typeof rawMeta === 'object' && 'company' in rawMeta;
        const companyData = isAgg ? rawMeta.company : rawMeta;
        const displayName = companyData?.name || companyData?.company_name || "";
        const linkedinUrl = m.linkedinUrl.toLowerCase();

        return (
          displayName.toLowerCase().includes(query) ||
          linkedinUrl.includes(query) ||
          m.movement.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [movements, selectedCompanyId, selectedMovementTypes, searchQuery, listData]);

  // Group filtered movements by company, sorted by most signals first
  const groupedByCompany = useMemo(() => {
    if (!listData) return [];
    const { companies: allCompanies } = listData;
    const groups = new Map<string, typeof filteredMovements>();

    for (const m of filteredMovements) {
      const existing = groups.get(m.companyId) ?? [];
      existing.push(m);
      groups.set(m.companyId, existing);
    }

    return Array.from(groups.entries()).map(([companyId, mvs]) => {
      const company = allCompanies.find(c => c.id === companyId);
      const rawMetadata = company?.latestMetadata as any;
      const isAggregatedFormat = rawMetadata && typeof rawMetadata === 'object' && 'company' in rawMetadata;
      const companyData = isAggregatedFormat ? rawMetadata.company : rawMetadata;
      const displayName = companyData?.name || companyData?.company_name || company?.linkedinUrl || companyId;
      const signals = mvs.filter(m => m.movement !== "NO_CHANGE");
      const noChange = mvs.filter(m => m.movement === "NO_CHANGE");

      return {
        companyId,
        displayName,
        linkedinUrl: company?.linkedinUrl ?? "",
        logoUrl: companyData?.logo_url ?? companyData?.logo ?? null,
        description: companyData?.tagline ?? companyData?.description ?? null,
        initials: displayName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "?",
        signals,
        noChangeMovements: noChange,
        noChangeCount: noChange.length,
        allMovements: mvs,
        latestDate: mvs.length > 0 ? new Date(Math.max(...mvs.map(m => new Date(m.createdAt).getTime()))) : null,
      };
    }).sort((a, b) => b.signals.length - a.signals.length);
  }, [filteredMovements, listData]);

  const hasActiveFilters = useMemo(() =>
    selectedMovementTypes.size > 0 || selectedCompanyId.length > 0 || searchQuery.trim().length > 0,
    [selectedMovementTypes, selectedCompanyId, searchQuery]
  );

  const isLoading = listLoading || movementsLoading;

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

  const { list } = listData;

  const toggleMovementType = (type: string) => {
    const newSelected = new Set(selectedMovementTypes);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    setSelectedMovementTypes(newSelected);
  };

  const clearFilters = () => {
    setSelectedMovementTypes(new Set());
    setSelectedCompanyId("");
    setSearchQuery("");
  };

  const toggleCompany = (companyId: string) => {
    const next = new Set(expandedCompanies);
    if (next.has(companyId)) {
      next.delete(companyId);
    } else {
      next.add(companyId);
    }
    setExpandedCompanies(next);
  };

  const toggleMovement = (movementId: string) => {
    const next = new Set(expandedMovements);
    if (next.has(movementId)) {
      next.delete(movementId);
    } else {
      next.add(movementId);
    }
    setExpandedMovements(next);
  };

  const expandAll = () => {
    setExpandedCompanies(new Set(groupedByCompany.map(g => g.companyId)));
  };

  const collapseAll = () => {
    setExpandedCompanies(new Set());
    setExpandedMovements(new Set());
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <button
          onClick={() => router.push(`/app/companies/${listId}`)}
          className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back to {list.name}</span>
        </button>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-brand-500" />
              Signal Movements
            </h1>
            <p className="text-foreground/60 text-sm mt-1">
              AI-detected company changes for {list.name}
            </p>
          </div>
          <Button
            variant={hasActiveFilters ? "default" : "neutral"}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-brand-400 text-white">
                {selectedMovementTypes.size + (selectedCompanyId ? 1 : 0) + (searchQuery.trim() ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <Card>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-2 block">
                    Select Company
                  </label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-200/60 border border-gray-800 rounded-lg text-foreground focus:outline-none focus:border-brand-500/50"
                  >
                    <option value="">All Companies ({companiesWithMovements.length})</option>
                    {companiesWithMovements.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.displayName} ({company.movementCount} movement{company.movementCount !== 1 ? 's' : ''})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-2 block">
                    Search Companies
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by company name, LinkedIn URL, or movement type..."
                      className="w-full pl-10 pr-4 py-2 bg-dark-200/60 border border-gray-800 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-brand-500/50"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-2 block">
                    Movement Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allMovementTypes.map((type) => {
                      const isSelected = selectedMovementTypes.has(type);
                      const isNoChange = type === "NO_CHANGE";
                      const count = type === "NO_CHANGE"
                        ? noChangeRecords.length
                        : movementsByType[type] || 0;

                      return (
                        <button
                          key={type}
                          onClick={() => toggleMovementType(type)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? isNoChange
                                ? 'bg-foreground/10 text-foreground border-2 border-foreground/30'
                                : 'bg-brand-500/20 text-brand-400 border-2 border-brand-500/50'
                              : 'bg-dark-200/60 text-foreground/60 border border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          <span className="font-mono">{type}</span>
                          <span className="ml-1.5 opacity-70">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="pt-2 border-t border-gray-800">
                    <Button
                      variant="neutral"
                      size="sm"
                      onClick={clearFilters}
                      className="flex items-center gap-2"
                    >
                      <X className="w-3 h-3" />
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                <Target className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalMovements}</p>
                <p className="text-xs text-foreground/60">Total Movements</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{uniqueCompaniesWithMovements}</p>
                <p className="text-xs text-foreground/60">Companies with Signals</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{averageConfidence}%</p>
                <p className="text-xs text-foreground/60">Avg Confidence</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {uniqueCompaniesValidated}
                </p>
                <p className="text-xs text-foreground/60">Companies Validated</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Movement Type Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6"
      >
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Movement Types</h2>
            {totalMovements === 0 && noChangeRecords.length > 0 ? (
              <div className="text-center py-8 text-foreground/60">
                <p className="text-sm">
                  All {noChangeRecords.length} validated companies showed no meaningful changes
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {Object.entries(movementsByType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-200/60 border border-gray-800"
                    >
                      <Badge variant="default" className="font-mono text-xs">
                        {type}
                      </Badge>
                      <span className="text-foreground font-semibold">{count}</span>
                      <span className="text-foreground/50 text-sm">
                        ({((count / totalMovements) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                {noChangeRecords.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-200/60 border border-gray-800">
                    <Badge variant="neutral" className="font-mono text-xs">
                      NO_CHANGE
                    </Badge>
                    <span className="text-foreground font-semibold">{noChangeRecords.length}</span>
                    <span className="text-foreground/50 text-sm">
                      (validated, no change)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Company Accordions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">
                {hasActiveFilters ? (
                  <>
                    Filtered Companies
                    <span className="ml-2 text-sm font-normal text-foreground/60">
                      ({groupedByCompany.length} of {uniqueCompaniesValidated})
                    </span>
                  </>
                ) : (
                  <>
                    Companies
                    <span className="ml-2 text-sm font-normal text-foreground/60">
                      ({groupedByCompany.length})
                    </span>
                  </>
                )}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={expandAll}
                  className="text-xs font-base text-foreground/60 hover:text-main transition-colors"
                >
                  Expand all
                </button>
                <span className="text-foreground/30">|</span>
                <button
                  onClick={collapseAll}
                  className="text-xs font-base text-foreground/60 hover:text-main transition-colors"
                >
                  Collapse all
                </button>
              </div>
            </div>

            {totalValidations === 0 ? (
              <div className="text-center py-12 text-foreground/60">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg mb-2">No validations yet</p>
                <p className="text-sm">
                  Run &quot;Validate Signals&quot; to detect company changes with AI
                </p>
              </div>
            ) : groupedByCompany.length === 0 ? (
              <div className="text-center py-12 text-foreground/60">
                <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg mb-2">No movements match your filters</p>
                <p className="text-sm mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button variant="neutral" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {groupedByCompany.map((group) => {
                  const isExpanded = expandedCompanies.has(group.companyId);
                  const hasSignals = group.signals.length > 0;

                  return (
                    <div
                      key={group.companyId}
                      className={`rounded-base border-2 border-border transition-colors ${
                        hasSignals
                          ? 'bg-secondary-background shadow-shadow'
                          : 'bg-secondary-background/50'
                      }`}
                    >
                      {/* Company Accordion Header */}
                      <button
                        onClick={() => toggleCompany(group.companyId)}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-main/10 transition-colors rounded-base"
                      >
                        {isExpanded
                          ? <ChevronDown className="w-4 h-4 text-foreground/50 shrink-0" />
                          : <ChevronRight className="w-4 h-4 text-foreground/50 shrink-0" />
                        }

                        <Avatar className="size-9 shrink-0">
                          <AvatarImage src={group.logoUrl ?? ""} alt={group.displayName} />
                          <AvatarFallback className="bg-main/20 text-main border-2 border-border text-xs font-heading">
                            {group.initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground truncate">
                              {group.displayName}
                            </span>
                            {!hasSignals && (
                              <span className="text-xs text-foreground/40">
                                No changes detected
                              </span>
                            )}
                          </div>

                          {/* Description + signal badges row */}
                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            {group.description && (
                              <span className="text-xs text-foreground/40 line-clamp-1 max-w-[300px]">
                                {group.description}
                              </span>
                            )}
                            {hasSignals && group.description && (
                              <span className="text-foreground/20">·</span>
                            )}
                            {group.signals.slice(0, 3).map((sig, i) => (
                              <Badge
                                key={i}
                                variant="default"
                                className={`font-mono text-[10px] shrink-0 ${
                                  isPositiveMovement(sig.movement)
                                    ? 'bg-main text-main-foreground border-border'
                                    : 'bg-secondary-background text-foreground/60 border-border/40'
                                }`}
                              >
                                {sig.movement}
                              </Badge>
                            ))}
                            {group.signals.length > 3 && (
                              <span className="text-xs text-foreground/50">
                                +{group.signals.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {group.noChangeCount > 0 && (
                            <span className="text-xs text-foreground/40">
                              {group.noChangeCount} scan{group.noChangeCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          {group.latestDate && (
                            <span className="text-xs text-foreground/40">
                              {group.latestDate.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-1 border-t-2 border-border/40">
                              {/* LinkedIn link */}
                              <a
                                href={group.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-main hover:text-main/80 hover:underline flex items-center gap-1 w-fit mb-3 font-base"
                              >
                                View LinkedIn Company Page
                                <ExternalLink className="w-3 h-3" />
                              </a>

                              {group.signals.length === 0 && group.noChangeMovements.length === 0 ? (
                                <p className="text-sm text-foreground/50">
                                  No validations recorded.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {group.signals
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .map((movement) => {
                                      const isMovementExpanded = expandedMovements.has(movement.id);
                                      const hasEvidence = movement.metadata?.evidence && movement.metadata.evidence.length > 0;

                                      return (
                                        <div
                                          key={movement.id}
                                          className="rounded-base border-2 border-border bg-background"
                                        >
                                          {/* Movement Card Header — always visible */}
                                          <button
                                            onClick={() => toggleMovement(movement.id)}
                                            className="w-full px-3 py-2.5 flex items-start gap-3 text-left hover:bg-main/5 transition-colors rounded-base"
                                          >
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 mb-1">
                                                <Badge
                                                  variant="default"
                                                  className={`font-mono text-[10px] flex items-center gap-1 ${
                                                    isPositiveMovement(movement.movement)
                                                      ? 'bg-main text-main-foreground border-border'
                                                      : 'bg-secondary-background text-foreground/60 border-border/40'
                                                  }`}
                                                >
                                                  <Sparkles className="w-2.5 h-2.5" />
                                                  {movement.movement}
                                                </Badge>
                                                <span className={`text-xs font-heading ${isPositiveMovement(movement.movement) ? 'text-main' : 'text-foreground/40'}`}>
                                                  {movement.metadata?.confidence}%
                                                </span>
                                                <span className="text-xs text-foreground/40">
                                                  {new Date(movement.createdAt).toLocaleDateString()}
                                                </span>
                                              </div>

                                              {/* Key changes preview — always visible */}
                                              {hasEvidence && (
                                                <div className="space-y-0.5">
                                                  {movement.metadata!.evidence!.map((item: any, idx: number) => (
                                                    <div key={idx} className="text-xs text-foreground/70">
                                                      <span className="text-foreground/50 font-medium">
                                                        {item.field.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, (str: string) => str.toUpperCase())}:
                                                      </span>{' '}
                                                      {item.previousValue != null && item.currentValue != null
                                                        ? <span>{String(item.previousValue).substring(0, 60)}{String(item.previousValue).length > 60 ? '...' : ''} <span className="text-main font-heading">→</span> {String(item.currentValue).substring(0, 60)}{String(item.currentValue).length > 60 ? '...' : ''}</span>
                                                        : item.currentValue != null
                                                          ? String(item.currentValue).substring(0, 120) + (String(item.currentValue).length > 120 ? '...' : '')
                                                          : item.interpretation ?? String(item.previousValue ?? '')}
                                                      {item.sourceUrl && (
                                                        <a
                                                          href={item.sourceUrl}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="inline-flex items-center gap-0.5 ml-1.5 text-main hover:text-main/80 hover:underline"
                                                          onClick={(e) => e.stopPropagation()}
                                                        >
                                                          <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                      )}
                                                    </div>
                                                  ))}
                                                </div>
                                              )}

                                              {!hasEvidence && movement.metadata?.reasoning && (
                                                <p className="text-xs text-foreground/50 line-clamp-1">
                                                  {movement.metadata.reasoning}
                                                </p>
                                              )}
                                            </div>

                                            {(hasEvidence || movement.metadata?.reasoning) && (
                                              <ChevronDown className={`w-3.5 h-3.5 text-foreground/40 shrink-0 mt-0.5 transition-transform ${isMovementExpanded ? '' : '-rotate-90'}`} />
                                            )}
                                          </button>

                                          {/* Expanded: full evidence + AI analysis */}
                                          <AnimatePresence>
                                            {isMovementExpanded && (
                                              <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.15 }}
                                                className="overflow-hidden"
                                              >
                                                <div className="px-3 pb-3 border-t-2 border-border/30 pt-2 space-y-3">
                                                  {/* Full evidence */}
                                                  {hasEvidence && (
                                                    <div>
                                                      <p className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-1.5">Key Changes</p>
                                                      <div className="space-y-2">
                                                        {movement.metadata!.evidence!.map((item: any, idx: number) => (
                                                          <div key={idx} className="rounded-base border border-border/20 bg-secondary-background/50 px-2.5 py-2 text-xs space-y-1">
                                                            <div className="flex items-center justify-between">
                                                              <div className="font-medium text-foreground/70">
                                                                {item.field.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, (str: string) => str.toUpperCase())}
                                                              </div>
                                                              {item.sourceUrl && (
                                                                <a
                                                                  href={item.sourceUrl}
                                                                  target="_blank"
                                                                  rel="noopener noreferrer"
                                                                  className="text-main hover:text-main/80 hover:underline flex items-center gap-1 shrink-0"
                                                                  onClick={(e) => e.stopPropagation()}
                                                                >
                                                                  View Post <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                              )}
                                                            </div>
                                                            {item.previousValue != null && item.currentValue != null ? (
                                                              <div className="space-y-1">
                                                                <div className="text-foreground/40">
                                                                  <span className="text-red-400/70 line-through">{String(item.previousValue)}</span>
                                                                </div>
                                                                <div className="text-foreground/80">
                                                                  <span className="text-green-400/80">{String(item.currentValue)}</span>
                                                                </div>
                                                              </div>
                                                            ) : item.currentValue != null ? (
                                                              <div className="text-foreground/80">{String(item.currentValue)}</div>
                                                            ) : null}
                                                            {item.interpretation && (
                                                              <div className="text-foreground/50 italic">{item.interpretation}</div>
                                                            )}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  )}

                                                  {/* AI Analysis */}
                                                  {movement.metadata?.reasoning && (
                                                    <div>
                                                      <p className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                        <MessageSquareText className="w-3 h-3" />
                                                        AI Analysis
                                                      </p>
                                                      <p className="text-xs text-foreground/60 leading-relaxed">
                                                        {movement.metadata.reasoning}
                                                      </p>
                                                    </div>
                                                  )}
                                                </div>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                      );
                                    })}

                                  {/* NO_CHANGE entries — muted, not highlighted */}
                                  {group.noChangeMovements.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-border/20">
                                      <p className="text-[10px] font-semibold text-foreground/30 uppercase tracking-wider mb-2">
                                        No Change ({group.noChangeMovements.length})
                                      </p>
                                      <div className="space-y-1">
                                        {group.noChangeMovements
                                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                          .map((movement) => {
                                            const isMovementExpanded = expandedMovements.has(movement.id);

                                            return (
                                              <div
                                                key={movement.id}
                                                className="rounded-base border border-border/15 bg-background/50 opacity-60"
                                              >
                                                <button
                                                  onClick={() => toggleMovement(movement.id)}
                                                  className="w-full px-3 py-2 flex items-center gap-2 text-left hover:opacity-100 transition-opacity rounded-base"
                                                >
                                                  <Badge
                                                    variant="neutral"
                                                    className="font-mono text-[10px] bg-transparent text-foreground/40 border-border/20"
                                                  >
                                                    {String(movement.metadata?.movementDefinition ?? 'NO_CHANGE')}
                                                  </Badge>
                                                  <span className="text-[10px] text-foreground/30">
                                                    {new Date(movement.createdAt).toLocaleDateString()}
                                                  </span>
                                                  <span className="flex-1" />
                                                  {movement.metadata?.reasoning && (
                                                    <ChevronDown className={`w-3 h-3 text-foreground/25 shrink-0 transition-transform ${isMovementExpanded ? '' : '-rotate-90'}`} />
                                                  )}
                                                </button>

                                                <AnimatePresence>
                                                  {isMovementExpanded && movement.metadata?.reasoning && (
                                                    <motion.div
                                                      initial={{ height: 0, opacity: 0 }}
                                                      animate={{ height: "auto", opacity: 1 }}
                                                      exit={{ height: 0, opacity: 0 }}
                                                      transition={{ duration: 0.15 }}
                                                      className="overflow-hidden"
                                                    >
                                                      <div className="px-3 pb-2 border-t border-border/10 pt-1.5">
                                                        <p className="text-xs text-foreground/40 leading-relaxed">
                                                          {movement.metadata.reasoning}
                                                        </p>
                                                      </div>
                                                    </motion.div>
                                                  )}
                                                </AnimatePresence>
                                              </div>
                                            );
                                          })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
