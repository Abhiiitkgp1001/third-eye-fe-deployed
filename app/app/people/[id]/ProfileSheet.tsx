"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Sparkles, TrendingUp } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback, Badge } from "@/components/ui";
import {
  Profile,
  Movement,
  ProfileMetadataExperience,
  ProfileMetadataEducation,
  getProfileMetadata,
} from "@/lib/trpc/schemas/peopleList-schemas";

interface ProfileSheetProps {
  profile: Profile | null;
  movements: Movement[];
  onClose: () => void;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-foreground font-semibold flex items-center gap-2">
      <span className="w-1 h-4 bg-brand-500 rounded shrink-0" />
      {children}
    </h3>
  );
}

export default function ProfileSheet({ profile, movements, onClose }: ProfileSheetProps) {
  const metadata = profile ? getProfileMetadata(profile) : null;
  const displayName = metadata
    ? `${metadata.first_name ?? ""} ${metadata.last_name ?? ""}`.trim() || null
    : null;
  const initials = displayName
    ? displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  // Separate actual movements from NO_CHANGE records
  const actualMovements = movements.filter(m => m.movement !== "NO_CHANGE");
  const hasBeenValidated = movements.length > 0;

  useEffect(() => {
    if (!profile) return;
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [profile, onClose]);

  useEffect(() => {
    document.body.style.overflow = profile ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [profile]);

  return (
    <AnimatePresence>
      {profile && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          <motion.div
            key="sheet"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-dark-300 border-l border-gray-800 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="shrink-0 border-b border-gray-800 px-6 py-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <Avatar className="size-14">
                  <AvatarImage src={metadata?.profile_photo_url} alt={displayName ?? "Profile"} />
                  <AvatarFallback className="bg-brand-500/10 text-brand-400 border border-brand-500/30 text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-foreground truncate">
                    {displayName ?? "Unnamed Profile"}
                  </h2>
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1 mt-0.5 w-fit"
                  >
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-foreground/60 hover:text-foreground transition-colors p-1 shrink-0 mt-0.5"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              {metadata?.headline && (
                <p className="text-foreground/60 text-base leading-relaxed">{metadata.headline}</p>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant={metadata ? "default" : "neutral"}>
                  {metadata ? "Enriched" : "Pending"}
                </Badge>
                <span className="text-foreground/50 text-sm">
                  Added {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>

              {metadata?.network_info &&
                (metadata.network_info.connections_count || metadata.network_info.followers_count) && (
                  <div className="flex gap-6 text-sm">
                    {metadata.network_info.connections_count && (
                      <div>
                        <span className="text-foreground font-semibold">
                          {metadata.network_info.connections_count.toLocaleString()}
                        </span>
                        <span className="text-foreground/60"> connections</span>
                      </div>
                    )}
                    {metadata.network_info.followers_count && (
                      <div>
                        <span className="text-foreground font-semibold">
                          {metadata.network_info.followers_count.toLocaleString()}
                        </span>
                        <span className="text-foreground/60"> followers</span>
                      </div>
                    )}
                  </div>
                )}

              {hasBeenValidated && (
                <div>
                  <SectionHeader>
                    <TrendingUp className="w-4 h-4" />
                    Recent Signals ({actualMovements.length})
                  </SectionHeader>
                  {actualMovements.length === 0 ? (
                    <div className="mt-3 p-4 bg-dark-200/40 rounded-lg border border-gray-800">
                      <p className="text-sm text-foreground/60 text-center">
                        Profile validated - no significant changes detected
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 mt-3">
                      {actualMovements.map((movement) => (
                      <div key={movement.id} className="rounded-lg border border-brand-500/30 overflow-hidden">
                        {/* Movement Header */}
                        <div className="p-3 bg-brand-500/10 border-b border-brand-500/30">
                          <div className="flex items-start justify-between gap-3">
                            <Badge
                              variant="default"
                              className="font-mono text-[10px] bg-brand-500/20 text-brand-400 border-brand-500/30 flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              {movement.movement}
                            </Badge>
                            {movement.metadata?.confidence && (
                              <span className="text-xs font-medium text-brand-400">
                                {movement.metadata.confidence}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* AI Reasoning */}
                        {movement.metadata?.reasoning && (
                          <div className="p-3 bg-dark-200/60">
                            <p className="text-xs font-semibold text-foreground/60 mb-1">AI Analysis</p>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {movement.metadata.reasoning}
                            </p>
                          </div>
                        )}

                        {/* Key Changes */}
                        {movement.metadata?.relevantData && Object.keys(movement.metadata.relevantData).length > 0 && (
                          <div className="p-3 bg-dark-200/40 border-t border-brand-500/20">
                            <p className="text-xs font-semibold text-foreground/60 mb-2">Key Changes</p>
                            <div className="space-y-1">
                              {Object.entries(movement.metadata.relevantData).map(([key, value]) => (
                                <div key={key} className="flex items-start gap-2 text-xs">
                                  <span className="text-foreground/50 font-medium min-w-[100px]">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                  </span>
                                  <span className="text-foreground flex-1">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="px-3 py-2 bg-dark-200/20 border-t border-brand-500/20">
                          <p className="text-xs text-foreground/50">
                            Detected {new Date(movement.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {metadata?.summary && (
                <div>
                  <SectionHeader>About</SectionHeader>
                  <p className="text-foreground/60 text-sm whitespace-pre-wrap leading-relaxed mt-2">
                    {metadata.summary}
                  </p>
                </div>
              )}

              {(metadata?.experience?.length ?? 0) > 0 && (
                <div>
                  <SectionHeader>Experience</SectionHeader>
                  <div className="space-y-3 mt-3">
                    {(metadata?.experience ?? []).map((exp: ProfileMetadataExperience, idx: number) => (
                      <div key={idx} className="flex gap-4 p-4 bg-dark-200/60 rounded-lg border border-gray-800">
                        {exp.company_logo_url && (
                          <img
                            src={exp.company_logo_url}
                            alt={exp.company_name}
                            className="w-10 h-10 rounded-lg object-contain bg-white p-1 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="text-foreground font-medium text-sm">
                            {exp.positions?.[0]?.title ?? "Position"}
                          </div>
                          <div className="text-foreground/60 text-sm">
                            {exp.company_name}
                            {exp.positions?.[0]?.employment_type && ` · ${exp.positions[0].employment_type}`}
                          </div>
                          <div className="text-foreground/50 text-xs mt-0.5">
                            {exp.date_range?.start && (
                              <>
                                {new Date(exp.date_range.start.iso).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                {" – "}
                                {exp.date_range.end
                                  ? new Date(exp.date_range.end.iso).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                                  : "Present"}
                              </>
                            )}
                          </div>
                          {exp.positions?.[0]?.description && (
                            <p className="text-foreground/60 text-xs mt-1.5 leading-relaxed">
                              {exp.positions[0].description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(metadata?.education?.length ?? 0) > 0 && (
                <div>
                  <SectionHeader>Education</SectionHeader>
                  <div className="space-y-3 mt-3">
                    {(metadata?.education ?? []).map((edu: ProfileMetadataEducation, idx: number) => (
                      <div key={idx} className="flex gap-4 p-4 bg-dark-200/60 rounded-lg border border-gray-800">
                        {edu.school_logo_url && (
                          <img
                            src={edu.school_logo_url}
                            alt={edu.school_name}
                            className="w-10 h-10 rounded-lg object-contain bg-white p-1 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="text-foreground font-medium text-sm">{edu.school_name}</div>
                          <div className="text-foreground/60 text-sm">
                            {edu.degree && edu.field_of_study && `${edu.degree}, ${edu.field_of_study}`}
                            {edu.grade && ` · GPA: ${edu.grade}`}
                          </div>
                          <div className="text-foreground/50 text-xs mt-0.5">
                            {edu.date_range?.start && edu.date_range?.end &&
                              `${edu.date_range.start.year} – ${edu.date_range.end.year}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(metadata?.skills?.length ?? 0) > 0 && (
                <div>
                  <SectionHeader>Skills</SectionHeader>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(metadata?.skills ?? []).slice(0, 20).map((skill: string, idx: number) => (
                      <Badge key={idx} variant="neutral">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
