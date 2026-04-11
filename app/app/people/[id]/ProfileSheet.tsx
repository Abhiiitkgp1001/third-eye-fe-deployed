"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback, Badge } from "@/components/ui";
import {
  Profile,
  ProfileMetadataExperience,
  ProfileMetadataEducation,
  getProfileMetadata,
} from "@/lib/trpc/schemas/peopleList-schemas";

interface ProfileSheetProps {
  profile: Profile | null;
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

export default function ProfileSheet({ profile, onClose }: ProfileSheetProps) {
  const metadata = profile ? getProfileMetadata(profile) : null;
  const displayName = metadata
    ? `${metadata.first_name ?? ""} ${metadata.last_name ?? ""}`.trim() || null
    : null;
  const initials = displayName
    ? displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

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
