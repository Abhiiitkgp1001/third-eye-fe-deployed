"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Badge, Card, PageSpinner, Button } from "@/components/ui";
import { ArrowLeft, TrendingUp, Sparkles, Calendar, Target, BarChart3, ExternalLink, Filter, X, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MovementsPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  // Filter states
  const [selectedMovementTypes, setSelectedMovementTypes] = useState<Set<string>>(new Set());
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: listData, isLoading: listLoading } = trpc.companyLists.getById.useQuery({
    id: listId,
    limit: 1000, // Get all companies for stats
    offset: 0,
  });

  const { data: movements = [], isLoading: movementsLoading } = trpc.companyLists.getListMovements.useQuery({
    id: listId,
  });

  // Debug logging
  console.log('[MovementsPage] List ID:', listId);
  console.log('[MovementsPage] Movements data:', movements);
  console.log('[MovementsPage] Movements count:', movements?.length ?? 0);
  console.log('[MovementsPage] Is loading:', movementsLoading);

  const isLoading = listLoading || movementsLoading;

  // Calculate statistics (must be called unconditionally before any returns)
  const actualMovements = useMemo(() => movements.filter(m => m.movement !== "NO_CHANGE"), [movements]);
  const noChangeRecords = useMemo(() => movements.filter(m => m.movement === "NO_CHANGE"), [movements]);

  const totalMovements = actualMovements.length;
  const totalValidations = movements.length;
  const uniqueCompaniesWithMovements = useMemo(() => new Set(actualMovements.map(m => m.companyId)).size, [actualMovements]);
  const uniqueCompaniesValidated = useMemo(() => new Set(movements.map(m => m.companyId)).size, [movements]);

  const movementsByType = useMemo(() => actualMovements.reduce((acc, m) => {
    acc[m.movement] = (acc[m.movement] || 0) + 1;
    return acc;
  }, {} as Record<string, number>), [actualMovements]);

  // Add NO_CHANGE to movement types if there are any
  const allMovementTypes = useMemo(() => {
    const types = new Set(movements.map(m => m.movement));
    return Array.from(types).sort();
  }, [movements]);

  const averageConfidence = useMemo(() => actualMovements.length > 0
    ? Math.round(actualMovements.reduce((sum, m) => sum + (m.metadata?.confidence || 0), 0) / actualMovements.length)
    : 0, [actualMovements]);

  // Get unique companies with movements
  const companiesWithMovements = useMemo(() => {
    if (!listData) return [];
    const { companies } = listData;
    const uniqueCompanyIds = new Set(movements.map(m => m.companyId));
    return companies
      .filter(c => uniqueCompanyIds.has(c.id))
      .map(c => {
        const metadata = c.latestMetadata as any;
        const displayName = metadata?.name || metadata?.company_name || c.linkedinUrl;
        return {
          id: c.id,
          displayName,
          linkedinUrl: c.linkedinUrl,
          movementCount: movements.filter(m => m.companyId === c.id).length,
        };
      })
      .sort((a, b) => b.movementCount - a.movementCount);
  }, [movements, listData]);

  // Apply filters
  const filteredMovements = useMemo(() => {
    if (!listData) return [];
    const { companies } = listData;
    let filtered = [...movements];

    // Filter by selected company
    if (selectedCompanyId) {
      filtered = filtered.filter(m => m.companyId === selectedCompanyId);
    }

    // Filter by movement type
    if (selectedMovementTypes.size > 0) {
      filtered = filtered.filter(m => selectedMovementTypes.has(m.movement));
    }

    // Filter by company search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => {
        const company = companies.find(c => c.id === m.companyId);
        const metadata = company?.latestMetadata as any;
        const displayName = metadata?.name || metadata?.company_name || "";
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

  const recentMovements = useMemo(() => filteredMovements.slice(0, 50), [filteredMovements]); // Show last 50 filtered

  // Early returns AFTER all hooks
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

  // Toggle movement type filter
  const toggleMovementType = (type: string) => {
    const newSelected = new Set(selectedMovementTypes);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    setSelectedMovementTypes(newSelected);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedMovementTypes(new Set());
    setSelectedCompanyId("");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedMovementTypes.size > 0 || selectedCompanyId.length > 0 || searchQuery.trim().length > 0;

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
                {/* Select Company */}
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

                {/* Search by Company */}
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

                {/* Filter by Movement Type */}
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

                {/* Clear Filters */}
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
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-200/60 border border-gray-800"
                  >
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

      {/* Recent Movements List */}
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
                    Filtered Movements
                    <span className="ml-2 text-sm font-normal text-foreground/60">
                      ({filteredMovements.length} of {movements.length})
                    </span>
                  </>
                ) : (
                  <>
                    Recent Movements
                    {recentMovements.length < movements.length && (
                      <span className="ml-2 text-sm font-normal text-foreground/60">
                        (Last {recentMovements.length})
                      </span>
                    )}
                  </>
                )}
              </h2>
            </div>

            {totalValidations === 0 ? (
              <div className="text-center py-12 text-foreground/60">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg mb-2">No validations yet</p>
                <p className="text-sm">
                  Run "Validate Signals" to detect company changes with AI
                </p>
              </div>
            ) : filteredMovements.length === 0 ? (
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
              <div className="space-y-3">
                {recentMovements.map((movement) => {
                  const company = companies.find(c => c.id === movement.companyId);
                  const metadata = company?.latestMetadata as any;
                  const displayName = metadata?.name || metadata?.company_name || company?.linkedinUrl;

                  const isNoChange = movement.movement === "NO_CHANGE";

                  return (
                    <div
                      key={movement.id}
                      className={`rounded-lg border ${
                        isNoChange
                          ? 'bg-dark-200/30 border-gray-800'
                          : 'bg-dark-200/60 border-gray-800'
                      }`}
                    >
                      {/* Company Header */}
                      <div className="p-4 border-b border-gray-800">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-sm font-medium text-foreground">
                                {displayName}
                              </p>
                              <Badge
                                variant={isNoChange ? "neutral" : "default"}
                                className={`font-mono text-[10px] flex items-center gap-1 ${
                                  isNoChange
                                    ? 'bg-foreground/5 text-foreground/60 border-foreground/20'
                                    : 'bg-brand-500/20 text-brand-400 border-brand-500/30'
                                }`}
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                {movement.movement}
                              </Badge>
                              {movement.metadata?.confidence && (
                                <span className={`text-xs font-medium ${
                                  isNoChange ? 'text-foreground/50' : 'text-brand-400'
                                }`}>
                                  {movement.metadata.confidence}%
                                </span>
                              )}
                            </div>
                            {company && (
                              <a
                                href={company.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-brand-400 hover:text-brand-300 hover:underline flex items-center gap-1 w-fit"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View LinkedIn Company Page
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-foreground/50">
                              {new Date(movement.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-foreground/50">
                              {new Date(movement.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* AI Reasoning */}
                      {movement.metadata?.reasoning && (
                        <div className="p-4 bg-dark-200/40">
                          <p className="text-xs font-semibold text-foreground/60 mb-1">AI Analysis</p>
                          <p className="text-sm text-foreground leading-relaxed">
                            {movement.metadata.reasoning}
                          </p>
                        </div>
                      )}

                      {/* Evidence */}
                      {movement.metadata?.evidence && movement.metadata.evidence.length > 0 && !isNoChange && (
                        <div className="p-4 border-t border-gray-800">
                          <p className="text-xs font-semibold text-foreground/60 mb-2">Key Changes</p>
                          <div className="space-y-1">
                            {movement.metadata.evidence.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs">
                                <span className="text-foreground/50 font-medium min-w-[120px]">
                                  {item.field.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, str => str.toUpperCase())}:
                                </span>
                                <span className="text-foreground flex-1">
                                  {item.previousValue != null && item.currentValue != null
                                    ? `${String(item.previousValue)} → ${String(item.currentValue)}`
                                    : item.currentValue != null
                                      ? String(item.currentValue)
                                      : item.interpretation ?? String(item.previousValue ?? '')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
