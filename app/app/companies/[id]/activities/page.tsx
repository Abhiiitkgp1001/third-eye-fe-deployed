"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Card, PageSpinner, Avatar, AvatarImage, AvatarFallback } from "@/components/ui";
import { ArrowLeft, Building2, MessageSquare, ThumbsUp, Share2, Calendar, ExternalLink, ChevronDown, Sparkles, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIChatBox from "../AIChatBox";

// Helper function to safely parse dates from various formats
const parsePostDate = (dateValue: any): Date | null => {
  if (!dateValue) return null;

  // If it's already a Date object
  if (dateValue instanceof Date) return dateValue;

  // If it's a string, try to parse it
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // If it's a number, assume Unix timestamp
  if (typeof dateValue === 'number') {
    // If the number is too large, it might be in milliseconds already
    // Unix timestamps in seconds are ~10 digits, in milliseconds are ~13 digits
    const timestamp = dateValue < 10000000000 ? dateValue * 1000 : dateValue;
    const parsed = new Date(timestamp);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null;
};

const formatPostDate = (dateValue: any): string => {
  const date = parsePostDate(dateValue);
  if (!date) return 'Unknown date';

  try {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Unknown date';
  }
};

export default function CompanyActivitiesPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'individual' | 'combined'>('individual');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activitiesData, setActivitiesData] = useState<Record<string, any>>({});
  const [loadingCompanies, setLoadingCompanies] = useState<Set<string>>(new Set());
  const loadedCompaniesRef = React.useRef<Set<string>>(new Set());
  const [chatOpen, setChatOpen] = useState(false);

  // Fetch list data to get companies
  const { data: listData, isLoading: listLoading } = trpc.companyLists.getById.useQuery({
    id: listId,
    limit: 1000,
    offset: 0,
  });

  // Extract activities from company metadata when companies are selected
  React.useEffect(() => {
    if (!listData) return;

    for (const companyId of Array.from(selectedCompanyIds)) {
      // Skip if already loaded
      if (loadedCompaniesRef.current.has(companyId)) {
        continue;
      }

      // Mark as loaded
      loadedCompaniesRef.current.add(companyId);

      // Find the company in the list
      const company = listData.companies.find(c => c.id === companyId);
      if (!company) {
        setActivitiesData(prev => ({
          ...prev,
          [companyId]: {
            posts: [],
            error: 'Company not found'
          }
        }));
        continue;
      }

      // Extract posts from latestMetadata
      const rawMeta = company.latestMetadata as any;
      const isAgg = rawMeta && typeof rawMeta === 'object' && 'company' in rawMeta;

      // For companies, posts are in company_posts array at the root level (not nested in company)
      const posts = rawMeta?.company_posts || [];

      setActivitiesData(prev => ({
        ...prev,
        [companyId]: {
          posts: posts,
          error: posts.length === 0 ? 'No posts available for this company' : null
        }
      }));
    }
  }, [selectedCompanyIds, listData]);

  const companies = useMemo(() => {
    if (!listData) return [];
    return listData.companies.map(c => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawMeta = c.latestMetadata as any;
      const isAgg = rawMeta && typeof rawMeta === 'object' && 'company' in rawMeta;
      const companyData = isAgg ? rawMeta.company : rawMeta;
      const displayName = companyData?.name || companyData?.company_name || c.linkedinUrl;

      return {
        id: c.id,
        displayName,
        linkedinUrl: c.linkedinUrl,
        logoUrl: companyData?.logo_url ?? companyData?.logo ?? null,
        tagline: companyData?.tagline ?? companyData?.description ?? null,
        initials: displayName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "?",
      };
    });
  }, [listData]);

  // Aggregate all posts from selected companies
  const allActivities = useMemo(() => {
    const activities: Array<{
      companyId: string;
      company: typeof companies[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      posts: any[];
    }> = [];

    Array.from(selectedCompanyIds).forEach(companyId => {
      const company = companies.find(c => c.id === companyId);
      const data = activitiesData[companyId];

      if (data && company) {
        activities.push({
          companyId,
          company,
          posts: data.posts || [],
        });
      }
    });

    return activities;
  }, [activitiesData, selectedCompanyIds, companies]);

  // Combined view - all posts sorted by date
  const combinedPosts = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const posts: Array<any> = [];

    allActivities.forEach(activity => {
      activity.posts.forEach(postItem => {
        // Extract the actual activity data from the nested structure
        const post = postItem.activity || postItem;
        posts.push({
          ...post,
          companyId: activity.companyId,
          company: activity.company,
          comments: postItem.comments?.comments || [],
          reactions: postItem.reactions?.reactions || [],
        });
      });
    });

    return posts.sort((a, b) => {
      const dateA = parsePostDate(a.created_at || a.posted_at || a.createdAt);
      const dateB = parsePostDate(b.created_at || b.posted_at || b.createdAt);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB.getTime() - dateA.getTime();
    });
  }, [allActivities]);

  const toggleCompany = (companyId: string) => {
    const next = new Set(selectedCompanyIds);
    if (next.has(companyId)) {
      next.delete(companyId);
    } else {
      next.add(companyId);
    }
    setSelectedCompanyIds(next);
  };

  const togglePost = (postId: string) => {
    const next = new Set(expandedPosts);
    if (next.has(postId)) {
      next.delete(postId);
    } else {
      next.add(postId);
    }
    setExpandedPosts(next);
  };

  const selectAll = () => {
    setSelectedCompanyIds(new Set(companies.map(c => c.id)));
  };

  const clearAll = () => {
    setSelectedCompanyIds(new Set());
  };

  const handleOpenChat = () => {
    setChatOpen(true);
  };

  const chatCompanyIds = useMemo(() => Array.from(selectedCompanyIds), [selectedCompanyIds]);
  const chatCompanyNames = useMemo(() => {
    return chatCompanyIds.map(id => companies.find(c => c.id === id)?.displayName || 'Unknown').join(', ');
  }, [chatCompanyIds, companies]);

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat/company-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId,
          companyIds: chatCompanyIds,
          question: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.answer;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return 'Sorry, I encountered an error processing your question. Please try again.';
    }
  };

  const isLoading = listLoading;
  const anyLoading = loadingCompanies.size > 0;

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
  const totalPosts = viewMode === 'combined'
    ? combinedPosts.length
    : allActivities.reduce((sum, a) => sum + a.posts.length, 0);

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
              <Sparkles className="w-8 h-8 text-brand-500" />
              LinkedIn Activities
            </h1>
            <p className="text-foreground/60 text-sm mt-1">
              Posts, comments, and reactions from selected companies
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 border-2 border-border rounded-base bg-background p-1">
            <button
              onClick={() => setViewMode('individual')}
              className={`px-3 py-1.5 rounded-base text-sm font-medium transition-all ${
                viewMode === 'individual'
                  ? 'bg-main text-main-foreground shadow-shadow'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Individual Companies
              </div>
            </button>
            <button
              onClick={() => setViewMode('combined')}
              className={`px-3 py-1.5 rounded-base text-sm font-medium transition-all ${
                viewMode === 'combined'
                  ? 'bg-main text-main-foreground shadow-shadow'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              Combined Feed
            </button>
          </div>

          <div className="text-xs text-foreground/50 flex items-center gap-1.5 px-3 py-1.5 bg-secondary-background border-2 border-border rounded-base">
            <span className="font-medium">{selectedCompanyIds.size}</span>
            <span>compan{selectedCompanyIds.size !== 1 ? 'ies' : 'y'} selected</span>
            <span className="text-foreground/30">·</span>
            <span className="font-medium">{totalPosts}</span>
            <span>post{totalPosts !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </motion.div>

      {/* Company Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6"
      >
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">
                Select Companies
                <span className="ml-2 text-sm font-normal text-foreground/60">
                  ({selectedCompanyIds.size} of {companies.length})
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs font-base text-foreground/60 hover:text-main transition-colors"
                >
                  Select all
                </button>
                <span className="text-foreground/30">|</span>
                <button
                  onClick={clearAll}
                  className="text-xs font-base text-foreground/60 hover:text-main transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {companies.map(company => {
                const isSelected = selectedCompanyIds.has(company.id);
                return (
                  <button
                    key={company.id}
                    onClick={() => toggleCompany(company.id)}
                    className={`flex items-center gap-3 p-3 rounded-base border-2 transition-all text-left ${
                      isSelected
                        ? 'bg-main/10 border-main shadow-shadow'
                        : 'bg-secondary-background border-border hover:border-main/40'
                    }`}
                  >
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={company.logoUrl ?? ""} alt={company.displayName} />
                      <AvatarFallback className="bg-main/20 text-main border-2 border-border text-xs font-heading">
                        {company.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {company.displayName}
                      </div>
                      {company.tagline && (
                        <div className="text-xs text-foreground/50 truncate">
                          {company.tagline}
                        </div>
                      )}
                    </div>
                    <div className={`w-4 h-4 rounded border-2 shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-main border-main'
                        : 'border-foreground/30'
                    }`}>
                      {isSelected && (
                        <svg className="w-full h-full text-main-foreground" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Activities Display */}
      {selectedCompanyIds.size === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50 text-foreground/60" />
            <p className="text-lg text-foreground/60 mb-2">No companies selected</p>
            <p className="text-sm text-foreground/50">
              Select one or more companies above to view their LinkedIn activities
            </p>
          </div>
        </Card>
      ) : anyLoading ? (
        <Card>
          <div className="p-12 text-center">
            <PageSpinner />
            <p className="text-sm text-foreground/60 mt-4">Loading activities...</p>
          </div>
        </Card>
      ) : viewMode === 'individual' ? (
        <div className="space-y-4">
          {allActivities.map(activity => (
            <Card key={activity.companyId}>
              <div className="p-6">
                {/* Company Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-border">
                  <Avatar className="size-12">
                    <AvatarImage src={activity.company.logoUrl ?? ""} alt={activity.company.displayName} />
                    <AvatarFallback className="bg-main/20 text-main border-2 border-border font-heading">
                      {activity.company.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-foreground">
                      {activity.company.displayName}
                    </div>
                    {activity.company.tagline && (
                      <div className="text-xs text-foreground/50">
                        {activity.company.tagline}
                      </div>
                    )}
                  </div>
                  <a
                    href={activity.company.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-main hover:text-main/80 hover:underline flex items-center gap-1"
                  >
                    View Company Page
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Posts */}
                {activitiesData[activity.companyId]?.error ? (
                  <div className="text-center py-8 text-foreground/50 bg-orange-500/5 border-2 border-orange-500/20 rounded-base">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50 text-orange-400" />
                    <p className="text-sm text-orange-400">{activitiesData[activity.companyId].error}</p>
                    <p className="text-xs text-foreground/40 mt-2">This company may not have public activities or may need enrichment</p>
                  </div>
                ) : activity.posts.length === 0 ? (
                  <div className="text-center py-8 text-foreground/50">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No posts found for this company</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {activity.posts.map((postItem: any, idx: number) => {
                      // Extract the actual activity data from the nested structure
                      const post = postItem.activity || postItem;
                      const comments = postItem.comments?.comments || [];
                      const reactions = postItem.reactions?.reactions || [];
                      const postId = `${activity.companyId}-${post.id || idx}`;
                      const isExpanded = expandedPosts.has(postId);
                      const socialCounts = post.social_counts || {};
                      const hasEngagement = (socialCounts.num_comments > 0 || socialCounts.num_likes > 0 || socialCounts.num_shares > 0);

                      return (
                        <div
                          key={postId}
                          className="rounded-base border-2 border-border bg-background"
                        >
                          <button
                            onClick={() => togglePost(postId)}
                            className="w-full px-4 py-3 text-left hover:bg-main/5 transition-colors rounded-base"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="w-3.5 h-3.5 text-foreground/40" />
                                  <span className="text-xs text-foreground/60">
                                    {formatPostDate(post.created_at || post.posted_at)}
                                  </span>
                                  {post.post_url && (
                                    <a
                                      href={post.post_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-main hover:text-main/80 hover:underline flex items-center gap-1 ml-auto"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      View on LinkedIn
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>

                                <p className="text-sm text-foreground/80 line-clamp-3">
                                  {post.commentary || post.text || 'No content available'}
                                </p>

                                {hasEngagement && (
                                  <div className="flex items-center gap-4 mt-2">
                                    {socialCounts.num_likes > 0 && (
                                      <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        <span>{socialCounts.num_likes}</span>
                                      </div>
                                    )}
                                    {socialCounts.num_comments > 0 && (
                                      <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>{socialCounts.num_comments}</span>
                                      </div>
                                    )}
                                    {socialCounts.num_shares > 0 && (
                                      <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                                        <Share2 className="w-3.5 h-3.5" />
                                        <span>{socialCounts.num_shares}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {(post.commentary || post.text) && (
                                <ChevronDown className={`w-4 h-4 text-foreground/40 shrink-0 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                              )}
                            </div>
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 border-t-2 border-border/30 pt-3 space-y-4">
                                  {/* Full Post Content */}
                                  <div>
                                    <p className="text-sm text-foreground/70 whitespace-pre-wrap">
                                      {post.commentary || post.text || 'No content available'}
                                    </p>
                                  </div>

                                  {/* Comments Section */}
                                  {comments.length > 0 && (
                                    <div>
                                      <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        Comments ({comments.length})
                                      </h4>
                                      <div className="space-y-3">
                                        {comments.map((comment: any, commentIdx: number) => (
                                          <div key={commentIdx} className="bg-secondary-background/50 rounded-base border border-border/30 p-3">
                                            <div className="flex items-start gap-2 mb-2">
                                              <Avatar className="size-6 shrink-0">
                                                <AvatarImage src={comment.commenter?.profile_picture_url ?? ""} alt={comment.commenter?.name || 'User'} />
                                                <AvatarFallback className="bg-main/10 text-main border border-border text-[10px] font-heading">
                                                  {comment.commenter?.name?.[0]?.toUpperCase() || '?'}
                                                </AvatarFallback>
                                              </Avatar>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span className="text-xs font-medium text-foreground">{comment.commenter?.name || 'Anonymous'}</span>
                                                  {comment.commenter?.headline && (
                                                    <span className="text-[10px] text-foreground/40 truncate">{comment.commenter.headline}</span>
                                                  )}
                                                </div>
                                                <p className="text-xs text-foreground/70 whitespace-pre-wrap">{comment.comment_text || comment.text}</p>
                                                {comment.created_at && (
                                                  <span className="text-[10px] text-foreground/40 mt-1 block">
                                                    {formatPostDate(comment.created_at)}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Reactions Section */}
                                  {reactions.length > 0 && (
                                    <div>
                                      <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        Reactions ({reactions.length})
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {(() => {
                                          // Group reactions by type and count them
                                          const reactionCounts = reactions.reduce((acc: Record<string, number>, reaction: any) => {
                                            const reactionType = reaction.reaction_type || reaction.type || 'like';
                                            acc[reactionType] = (acc[reactionType] || 0) + 1;
                                            return acc;
                                          }, {});

                                          // Get emoji for reaction type
                                          const getReactionEmoji = (type: string) => {
                                            const emojiMap: Record<string, string> = {
                                              'like': '👍',
                                              'love': '❤️',
                                              'empathy': '🤝',
                                              'praise': '👏',
                                              'interest': '💡',
                                              'appreciation': '🙏',
                                              'funny': '😄',
                                              'celebrate': '🎉',
                                            };
                                            return emojiMap[type.toLowerCase()] || '👍';
                                          };

                                          return Object.entries(reactionCounts).map(([type, count]) => (
                                            <div key={type} className="flex items-center gap-1.5 bg-secondary-background/50 rounded-base border border-border/30 px-3 py-1.5">
                                              <span className="text-sm">{getReactionEmoji(type)}</span>
                                              <span className="text-xs text-foreground/60 capitalize">{type}</span>
                                              <span className="text-xs text-foreground/80 font-semibold">({count})</span>
                                            </div>
                                          ));
                                        })()}
                                      </div>
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
          ))}
        </div>
      ) : (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Combined Feed
              <span className="ml-2 text-sm font-normal text-foreground/60">
                ({combinedPosts.length} posts)
              </span>
            </h2>

            {(() => {
              const companiesWithErrors = Array.from(selectedCompanyIds)
                .filter(id => activitiesData[id]?.error)
                .map(id => companies.find(c => c.id === id))
                .filter(Boolean);

              return (
                <>
                  {companiesWithErrors.length > 0 && (
                    <div className="mb-4 p-4 bg-orange-500/5 border-2 border-orange-500/20 rounded-base">
                      <p className="text-sm text-orange-400 font-medium mb-2">
                        {companiesWithErrors.length} compan{companiesWithErrors.length > 1 ? 'ies' : 'y'} could not be loaded:
                      </p>
                      <ul className="text-xs text-foreground/60 list-disc list-inside space-y-1">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {companiesWithErrors.map((company: any) => (
                          <li key={company.id}>{company.displayName}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-foreground/40 mt-2">
                        These companies may not have public activities or may need enrichment
                      </p>
                    </div>
                  )}

                  {combinedPosts.length === 0 ? (
                    <div className="text-center py-12 text-foreground/50">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg mb-2">No posts found</p>
                      <p className="text-sm">
                        Selected companies have no LinkedIn posts available
                      </p>
                    </div>
                  ) : (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {combinedPosts.map((post: any, idx: number) => {
                  const postId = `combined-${post.companyId}-${post.id || idx}`;
                  const isExpanded = expandedPosts.has(postId);
                  const socialCounts = post.social_counts || {};
                  const hasEngagement = (socialCounts.num_comments > 0 || socialCounts.num_likes > 0 || socialCounts.num_shares > 0);

                  return (
                    <div
                      key={postId}
                      className="rounded-base border-2 border-border bg-secondary-background"
                    >
                      <button
                        onClick={() => togglePost(postId)}
                        className="w-full px-4 py-3 text-left hover:bg-main/5 transition-colors rounded-base"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="size-9 shrink-0">
                            <AvatarImage src={post.company.logoUrl ?? ""} alt={post.company.displayName} />
                            <AvatarFallback className="bg-main/20 text-main border-2 border-border text-xs font-heading">
                              {post.company.initials}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-foreground">
                                {post.company.displayName}
                              </span>
                              <span className="text-xs text-foreground/40">
                                {formatPostDate(post.created_at || post.posted_at)}
                              </span>
                              {post.post_url && (
                                <a
                                  href={post.post_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-main hover:text-main/80 hover:underline flex items-center gap-1 ml-auto"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View on LinkedIn
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>

                            <p className="text-sm text-foreground/70 line-clamp-3">
                              {post.commentary || post.text || 'No content available'}
                            </p>

                            {hasEngagement && (
                              <div className="flex items-center gap-4 mt-2">
                                {socialCounts.num_likes > 0 && (
                                  <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                    <span>{socialCounts.num_likes}</span>
                                  </div>
                                )}
                                {socialCounts.num_comments > 0 && (
                                  <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>{socialCounts.num_comments}</span>
                                  </div>
                                )}
                                {socialCounts.num_shares > 0 && (
                                  <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                                    <Share2 className="w-3.5 h-3.5" />
                                    <span>{socialCounts.num_shares}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {(post.commentary || post.text) && (
                            <ChevronDown className={`w-4 h-4 text-foreground/40 shrink-0 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                          )}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t-2 border-border/30 pt-3 ml-12 space-y-4">
                              {/* Full Post Content */}
                              <div>
                                <p className="text-sm text-foreground/70 whitespace-pre-wrap">
                                  {post.commentary || post.text || 'No content available'}
                                </p>
                              </div>

                              {/* Comments Section */}
                              {post.comments && post.comments.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Comments ({post.comments.length})
                                  </h4>
                                  <div className="space-y-3">
                                    {post.comments.map((comment: any, commentIdx: number) => (
                                      <div key={commentIdx} className="bg-secondary-background/50 rounded-base border border-border/30 p-3">
                                        <div className="flex items-start gap-2 mb-2">
                                          <Avatar className="size-6 shrink-0">
                                            <AvatarImage src={comment.commenter?.profile_picture_url ?? ""} alt={comment.commenter?.name || 'User'} />
                                            <AvatarFallback className="bg-main/10 text-main border border-border text-[10px] font-heading">
                                              {comment.commenter?.name?.[0]?.toUpperCase() || '?'}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-xs font-medium text-foreground">{comment.commenter?.name || 'Anonymous'}</span>
                                              {comment.commenter?.headline && (
                                                <span className="text-[10px] text-foreground/40 truncate">{comment.commenter.headline}</span>
                                              )}
                                            </div>
                                            <p className="text-xs text-foreground/70 whitespace-pre-wrap">{comment.comment_text || comment.text}</p>
                                            {comment.created_at && (
                                              <span className="text-[10px] text-foreground/40 mt-1 block">
                                                {formatPostDate(comment.created_at)}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Reactions Section */}
                              {post.reactions && post.reactions.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                    Reactions ({post.reactions.length})
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {(() => {
                                      // Group reactions by type and count them
                                      const reactionCounts = post.reactions.reduce((acc: Record<string, number>, reaction: any) => {
                                        const reactionType = reaction.reaction_type || reaction.type || 'like';
                                        acc[reactionType] = (acc[reactionType] || 0) + 1;
                                        return acc;
                                      }, {});

                                      // Get emoji for reaction type
                                      const getReactionEmoji = (type: string) => {
                                        const emojiMap: Record<string, string> = {
                                          'like': '👍',
                                          'love': '❤️',
                                          'empathy': '🤝',
                                          'praise': '👏',
                                          'interest': '💡',
                                          'appreciation': '🙏',
                                          'funny': '😄',
                                          'celebrate': '🎉',
                                        };
                                        return emojiMap[type.toLowerCase()] || '👍';
                                      };

                                      return Object.entries(reactionCounts).map(([type, count]) => (
                                        <div key={type} className="flex items-center gap-1.5 bg-secondary-background/50 rounded-base border border-border/30 px-3 py-1.5">
                                          <span className="text-sm">{getReactionEmoji(type)}</span>
                                          <span className="text-xs text-foreground/60 capitalize">{type}</span>
                                          <span className="text-xs text-foreground/80 font-semibold">({count})</span>
                                        </div>
                                      ));
                                    })()}
                                  </div>
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
                </>
              );
            })()}
          </div>
        </Card>
      )}

      {/* Floating AI Chat Button - only show when companies are selected */}
      {selectedCompanyIds.size > 0 && !chatOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 w-14 h-14 bg-main text-main-foreground rounded-full shadow-[8px_8px_0_0_var(--border)] border-4 border-border hover:shadow-[4px_4px_0_0_var(--border)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center z-40"
          title="Ask AI about selected companies"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}

      {/* AI Chat Box */}
      {chatOpen && selectedCompanyIds.size > 0 && (
        <AIChatBox
          companyNames={chatCompanyNames}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}
