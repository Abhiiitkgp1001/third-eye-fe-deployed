"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Card, PageSpinner, Avatar, AvatarImage, AvatarFallback } from "@/components/ui";
import { ArrowLeft, Users, MessageSquare, ThumbsUp, Share2, Calendar, ExternalLink, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function ActivitiesPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const [selectedProfileIds, setSelectedProfileIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'individual' | 'combined'>('individual');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activitiesData, setActivitiesData] = useState<Record<string, any>>({});
  const [loadingProfiles, setLoadingProfiles] = useState<Set<string>>(new Set());
  const loadedProfilesRef = React.useRef<Set<string>>(new Set());

  // Fetch list data to get profiles
  const { data: listData, isLoading: listLoading } = trpc.peopleLists.getById.useQuery({
    id: listId,
    limit: 1000,
    offset: 0,
  });

  // Extract activities from profile metadata when profiles are selected
  React.useEffect(() => {
    if (!listData) return;

    for (const profileId of Array.from(selectedProfileIds)) {
      // Skip if already loaded
      if (loadedProfilesRef.current.has(profileId)) {
        continue;
      }

      // Mark as loaded
      loadedProfilesRef.current.add(profileId);

      // Find the profile in the list
      const profile = listData.profiles.find(p => p.id === profileId);
      if (!profile) {
        setActivitiesData(prev => ({
          ...prev,
          [profileId]: {
            posts: [],
            error: 'Profile not found'
          }
        }));
        continue;
      }

      // Extract posts from latestMetadata
      const rawMeta = profile.latestMetadata as any;
      const isAgg = rawMeta && typeof rawMeta === 'object' && 'profile' in rawMeta;
      const profileData = isAgg ? rawMeta.profile : rawMeta;

      // Get posts from metadata
      const posts = profileData?.posts || [];

      setActivitiesData(prev => ({
        ...prev,
        [profileId]: {
          posts: posts,
          error: posts.length === 0 ? 'No posts available for this profile' : null
        }
      }));
    }
  }, [selectedProfileIds, listData]);

  const profiles = useMemo(() => {
    if (!listData) return [];
    return listData.profiles.map(p => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawMeta = p.latestMetadata as any;
      const isAgg = rawMeta && typeof rawMeta === 'object' && 'profile' in rawMeta;
      const profileData = isAgg ? rawMeta.profile : rawMeta;
      const displayName = profileData
        ? `${profileData.first_name ?? ""} ${profileData.last_name ?? ""}`.trim()
        : null;

      return {
        id: p.id,
        displayName: displayName || p.linkedinUrl,
        linkedinUrl: p.linkedinUrl,
        photoUrl: profileData?.profile_photo_url ?? null,
        headline: profileData?.headline ?? null,
        initials: displayName
          ? displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
          : "?",
      };
    });
  }, [listData]);

  // Aggregate all posts from selected profiles
  const allActivities = useMemo(() => {
    const activities: Array<{
      profileId: string;
      profile: typeof profiles[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      posts: any[];
    }> = [];

    Array.from(selectedProfileIds).forEach(profileId => {
      const profile = profiles.find(p => p.id === profileId);
      const data = activitiesData[profileId];

      if (data && profile) {
        activities.push({
          profileId,
          profile,
          posts: data.posts || [],
        });
      }
    });

    return activities;
  }, [activitiesData, selectedProfileIds, profiles]);

  // Combined view - all posts sorted by date
  const combinedPosts = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const posts: Array<any> = [];

    allActivities.forEach(activity => {
      activity.posts.forEach(post => {
        posts.push({
          ...post,
          profileId: activity.profileId,
          profile: activity.profile,
        });
      });
    });

    return posts.sort((a, b) => {
      const dateA = parsePostDate(a.posted_at || a.createdAt);
      const dateB = parsePostDate(b.posted_at || b.createdAt);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB.getTime() - dateA.getTime();
    });
  }, [allActivities]);

  const toggleProfile = (profileId: string) => {
    const next = new Set(selectedProfileIds);
    if (next.has(profileId)) {
      next.delete(profileId);
    } else {
      next.add(profileId);
    }
    setSelectedProfileIds(next);
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
    setSelectedProfileIds(new Set(profiles.map(p => p.id)));
  };

  const clearAll = () => {
    setSelectedProfileIds(new Set());
  };

  const isLoading = listLoading;
  const anyLoading = loadingProfiles.size > 0;

  if (isLoading) {
    return <PageSpinner />;
  }

  if (!listData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-foreground text-xl">People list not found</div>
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
          onClick={() => router.push(`/app/people/${listId}`)}
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
              Posts, comments, and reactions from selected profiles
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
                <Users className="w-3.5 h-3.5" />
                Individual Profiles
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
            <span className="font-medium">{selectedProfileIds.size}</span>
            <span>profile{selectedProfileIds.size !== 1 ? 's' : ''} selected</span>
            <span className="text-foreground/30">·</span>
            <span className="font-medium">{totalPosts}</span>
            <span>post{totalPosts !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </motion.div>

      {/* Profile Selector */}
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
                Select Profiles
                <span className="ml-2 text-sm font-normal text-foreground/60">
                  ({selectedProfileIds.size} of {profiles.length})
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
              {profiles.map(profile => {
                const isSelected = selectedProfileIds.has(profile.id);
                return (
                  <button
                    key={profile.id}
                    onClick={() => toggleProfile(profile.id)}
                    className={`flex items-center gap-3 p-3 rounded-base border-2 transition-all text-left ${
                      isSelected
                        ? 'bg-main/10 border-main shadow-shadow'
                        : 'bg-secondary-background border-border hover:border-main/40'
                    }`}
                  >
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={profile.photoUrl ?? ""} alt={profile.displayName} />
                      <AvatarFallback className="bg-main/20 text-main border-2 border-border text-xs font-heading">
                        {profile.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {profile.displayName}
                      </div>
                      {profile.headline && (
                        <div className="text-xs text-foreground/50 truncate">
                          {profile.headline}
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
      {selectedProfileIds.size === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50 text-foreground/60" />
            <p className="text-lg text-foreground/60 mb-2">No profiles selected</p>
            <p className="text-sm text-foreground/50">
              Select one or more profiles above to view their LinkedIn activities
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
            <Card key={activity.profileId}>
              <div className="p-6">
                {/* Profile Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-border">
                  <Avatar className="size-12">
                    <AvatarImage src={activity.profile.photoUrl ?? ""} alt={activity.profile.displayName} />
                    <AvatarFallback className="bg-main/20 text-main border-2 border-border font-heading">
                      {activity.profile.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-foreground">
                      {activity.profile.displayName}
                    </div>
                    {activity.profile.headline && (
                      <div className="text-xs text-foreground/50">
                        {activity.profile.headline}
                      </div>
                    )}
                  </div>
                  <a
                    href={activity.profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-main hover:text-main/80 hover:underline flex items-center gap-1"
                  >
                    View Profile
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Posts */}
                {activitiesData[activity.profileId]?.error ? (
                  <div className="text-center py-8 text-foreground/50 bg-orange-500/5 border-2 border-orange-500/20 rounded-base">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50 text-orange-400" />
                    <p className="text-sm text-orange-400">{activitiesData[activity.profileId].error}</p>
                    <p className="text-xs text-foreground/40 mt-2">This profile may not have public activities or may need enrichment</p>
                  </div>
                ) : activity.posts.length === 0 ? (
                  <div className="text-center py-8 text-foreground/50">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No posts found for this profile</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {activity.posts.map((post: any) => {
                      const postId = `${activity.profileId}-${post.post_url || post.id}`;
                      const isExpanded = expandedPosts.has(postId);
                      const hasEngagement = (post.num_comments > 0 || post.num_likes > 0 || post.num_shares > 0);

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
                                    {formatPostDate(post.posted_at)}
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
                                  {post.text || post.content || 'No content available'}
                                </p>

                                {hasEngagement && (
                                  <div className="flex items-center gap-4 mt-2">
                                    {post.num_likes > 0 && (
                                      <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        <span>{post.num_likes}</span>
                                      </div>
                                    )}
                                    {post.num_comments > 0 && (
                                      <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>{post.num_comments}</span>
                                      </div>
                                    )}
                                    {post.num_shares > 0 && (
                                      <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                                        <Share2 className="w-3.5 h-3.5" />
                                        <span>{post.num_shares}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {(post.text || post.content) && (
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
                                <div className="px-4 pb-4 border-t-2 border-border/30 pt-3">
                                  <p className="text-sm text-foreground/70 whitespace-pre-wrap">
                                    {post.text || post.content || 'No content available'}
                                  </p>
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
              const profilesWithErrors = Array.from(selectedProfileIds)
                .filter(id => activitiesData[id]?.error)
                .map(id => profiles.find(p => p.id === id))
                .filter(Boolean);

              return (
                <>
                  {profilesWithErrors.length > 0 && (
                    <div className="mb-4 p-4 bg-orange-500/5 border-2 border-orange-500/20 rounded-base">
                      <p className="text-sm text-orange-400 font-medium mb-2">
                        {profilesWithErrors.length} profile{profilesWithErrors.length > 1 ? 's' : ''} could not be loaded:
                      </p>
                      <ul className="text-xs text-foreground/60 list-disc list-inside space-y-1">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {profilesWithErrors.map((profile: any) => (
                          <li key={profile.id}>{profile.displayName}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-foreground/40 mt-2">
                        These profiles may not have public activities or may need enrichment
                      </p>
                    </div>
                  )}

                  {combinedPosts.length === 0 ? (
                    <div className="text-center py-12 text-foreground/50">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg mb-2">No posts found</p>
                      <p className="text-sm">
                        Selected profiles have no LinkedIn posts available
                      </p>
                    </div>
                  ) : (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {combinedPosts.map((post: any) => {
                  const postId = `combined-${post.profileId}-${post.post_url || post.id}`;
                  const isExpanded = expandedPosts.has(postId);
                  const hasEngagement = (post.num_comments > 0 || post.num_likes > 0 || post.num_shares > 0);

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
                            <AvatarImage src={post.profile.photoUrl ?? ""} alt={post.profile.displayName} />
                            <AvatarFallback className="bg-main/20 text-main border-2 border-border text-xs font-heading">
                              {post.profile.initials}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-foreground">
                                {post.profile.displayName}
                              </span>
                              <span className="text-xs text-foreground/40">
                                {formatPostDate(post.posted_at)}
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
                              {post.text || post.content || 'No content available'}
                            </p>

                            {hasEngagement && (
                              <div className="flex items-center gap-4 mt-2">
                                {post.num_likes > 0 && (
                                  <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                    <span>{post.num_likes}</span>
                                  </div>
                                )}
                                {post.num_comments > 0 && (
                                  <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>{post.num_comments}</span>
                                  </div>
                                )}
                                {post.num_shares > 0 && (
                                  <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                                    <Share2 className="w-3.5 h-3.5" />
                                    <span>{post.num_shares}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {(post.text || post.content) && (
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
                            <div className="px-4 pb-4 border-t-2 border-border/30 pt-3 ml-12">
                              <p className="text-sm text-foreground/70 whitespace-pre-wrap">
                                {post.text || post.content || 'No content available'}
                              </p>
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
    </div>
  );
}
