import { Profile } from "@/lib/db/schema";
import React, { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { Trash2, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileRowProps {
  profile: any;
  listId: string;
  isExpanded: boolean;
  onToggleExpanded: (profileId: string) => void;
  onDelete: (profileId: string) => Promise<void>;
  index: number;
}

export default function ProfileRow({
  profile,
  listId,
  isExpanded,
  onToggleExpanded,
  onDelete,
  index,
}: ProfileRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const getDisplayName = () => {
    if (
      profile.latestMetadata?.first_name ||
      profile.latestMetadata?.last_name
    ) {
      const firstName = profile.latestMetadata.first_name || "";
      const lastName = profile.latestMetadata.last_name || "";
      return `${firstName} ${lastName}`.trim();
    }
    return null;
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this profile?")) {
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(profile.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const displayName = getDisplayName();
  const metadata = profile.latestMetadata;

  return (
    <React.Fragment>
      <motion.tr
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="hover:bg-dark-200/50 transition-colors group"
      >
        <td
          className="px-6 py-4 cursor-pointer"
          onClick={() => metadata && onToggleExpanded(profile.id)}
        >
          <div className="flex items-center gap-3">
            {metadata?.profile_photo_url ? (
              <img
                src={metadata.profile_photo_url}
                alt={displayName || "Profile"}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-800"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-dark-200 border border-gray-700 flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">
                  {displayName?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div>
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 hover:text-brand-300 hover:underline flex items-center gap-1.5 group/link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="font-medium">
                    {displayName || profile.linkedinUrl}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                </a>
              </div>
              {metadata && (
                <button
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpanded(profile.id);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </td>
        <td
          className="px-6 py-4 text-gray-300 cursor-pointer"
          onClick={() => metadata && onToggleExpanded(profile.id)}
        >
          <span className="line-clamp-2">{metadata?.headline || "-"}</span>
        </td>
        <td
          className="px-6 py-4 cursor-pointer"
          onClick={() => metadata && onToggleExpanded(profile.id)}
        >
          <Badge variant={metadata ? 'default' : 'neutral'}>
            {metadata ? 'Enriched' : 'Pending'}
          </Badge>
        </td>
        <td
          className="px-6 py-4 text-gray-400 text-sm cursor-pointer"
          onClick={() => metadata && onToggleExpanded(profile.id)}
        >
          {new Date(profile.createdAt).toLocaleDateString()}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="neutral"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </td>
      </motion.tr>

      <AnimatePresence>
        {isExpanded && metadata && (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <td colSpan={5} className="px-6 py-6 bg-dark-300/50">
              <motion.div
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                exit={{ y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Summary */}
                {metadata.summary && (
                  <div>
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <span className="w-1 h-4 bg-brand-500 rounded"></span>
                      About
                    </h4>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                      {metadata.summary}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {metadata.experience && metadata.experience.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-brand-500 rounded"></span>
                      Experience
                    </h4>
                    <div className="space-y-4">
                      {metadata.experience.map((exp: any, idx: number) => (
                        <div key={idx} className="flex gap-4 p-4 glass-hover rounded-lg">
                          {exp.company_logo_url && (
                            <img
                              src={exp.company_logo_url}
                              alt={exp.company_name}
                              className="w-12 h-12 rounded-lg object-contain bg-white p-1"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium">
                              {exp.positions?.[0]?.title || "Position"}
                            </div>
                            <div className="text-gray-300 text-sm">
                              {exp.company_name}
                              {exp.positions?.[0]?.employment_type &&
                                ` · ${exp.positions[0].employment_type}`}
                            </div>
                            <div className="text-gray-400 text-xs mt-1">
                              {exp.date_range?.start && (
                                <>
                                  {new Date(
                                    exp.date_range.start.iso,
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    year: "numeric",
                                  })}
                                  {" - "}
                                  {exp.date_range.end
                                    ? new Date(
                                        exp.date_range.end.iso,
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "Present"}
                                </>
                              )}
                            </div>
                            {exp.positions?.[0]?.description && (
                              <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                                {exp.positions[0].description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {metadata.education && metadata.education.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-brand-500 rounded"></span>
                      Education
                    </h4>
                    <div className="space-y-4">
                      {metadata.education.map((edu: any, idx: number) => (
                        <div key={idx} className="flex gap-4 p-4 glass-hover rounded-lg">
                          {edu.school_logo_url && (
                            <img
                              src={edu.school_logo_url}
                              alt={edu.school_name}
                              className="w-12 h-12 rounded-lg object-contain bg-white p-1"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium">
                              {edu.school_name}
                            </div>
                            <div className="text-gray-300 text-sm">
                              {edu.degree &&
                                edu.field_of_study &&
                                `${edu.degree}, ${edu.field_of_study}`}
                              {edu.grade && ` · GPA: ${edu.grade}`}
                            </div>
                            <div className="text-gray-400 text-xs mt-1">
                              {edu.date_range?.start && edu.date_range?.end && (
                                <>
                                  {edu.date_range.start.year} -{" "}
                                  {edu.date_range.end.year}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {metadata.skills && metadata.skills.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-brand-500 rounded"></span>
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {metadata.skills
                        .slice(0, 20)
                        .map((skill: string, idx: number) => (
                          <Badge key={idx} variant="neutral">
                            {skill}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                {/* Network Info */}
                {metadata.network_info && (
                  <div className="flex gap-6 text-sm pt-4 border-t border-gray-800">
                    {metadata.network_info.connections_count && (
                      <div>
                        <span className="text-white font-semibold">
                          {metadata.network_info.connections_count.toLocaleString()}
                        </span>
                        <span className="text-gray-400"> connections</span>
                      </div>
                    )}
                    {metadata.network_info.followers_count && (
                      <div>
                        <span className="text-white font-semibold">
                          {metadata.network_info.followers_count.toLocaleString()}
                        </span>
                        <span className="text-gray-400"> followers</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
}
