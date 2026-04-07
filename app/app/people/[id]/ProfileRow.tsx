import { Profile } from "@/lib/db/schema";
import React, { useState } from "react";

interface ProfileRowProps {
  profile: any;
  listId: string;
  isExpanded: boolean;
  onToggleExpanded: (profileId: string) => void;
  onDelete: (profileId: string) => Promise<void>;
}

export default function ProfileRow({
  profile,
  listId,
  isExpanded,
  onToggleExpanded,
  onDelete,
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
      <tr className="hover:bg-primary-800/50 transition-colors group cursor-pointer">
        <td
          className="px-6 py-4"
          onClick={() => metadata && onToggleExpanded(profile.id)}
        >
          <div className="flex items-center gap-3">
            {metadata?.profile_photo_url && (
              <img
                src={metadata.profile_photo_url}
                alt={displayName || "Profile"}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div className="flex items-center gap-2">
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 hover:underline flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                {displayName || profile.linkedinUrl}
              </a>
              {metadata && (
                <span className="text-secondary-50 text-sm">
                  {isExpanded ? "▼" : "▶"}
                </span>
              )}
            </div>
          </div>
        </td>
        <td
          className="px-6 py-4 text-secondary-50"
          onClick={() => metadata && onToggleExpanded(profile.id)}
        >
          {metadata?.headline || "-"}
        </td>
        <td
          className="px-6 py-4"
          onClick={() => metadata && onToggleExpanded(profile.id)}
        >
          <span
            className={`px-2 py-1 rounded text-xs ${
              metadata
                ? "bg-green-600/20 text-green-400"
                : "bg-gray-600/20 text-gray-400"
            }`}
          >
            {metadata ? "Enriched" : "Pending"}
          </span>
        </td>
        <td
          className="px-6 py-4 text-secondary-50"
          onClick={() => metadata && onToggleExpanded(profile.id)}
        >
          {new Date(profile.createdAt).toLocaleDateString()}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              disabled={isDeleting}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && metadata && (
        <tr>
          <td colSpan={5} className="px-6 py-4 bg-primary-800/30">
            <div className="space-y-6">
              {/* Summary */}
              {metadata.summary && (
                <div>
                  <h4 className="text-white font-semibold mb-2">About</h4>
                  <p className="text-secondary-50 text-sm whitespace-pre-wrap">
                    {metadata.summary}
                  </p>
                </div>
              )}

              {/* Experience */}
              {metadata.experience && metadata.experience.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Experience</h4>
                  <div className="space-y-4">
                    {metadata.experience.map((exp: any, idx: number) => (
                      <div key={idx} className="flex gap-3">
                        {exp.company_logo_url && (
                          <img
                            src={exp.company_logo_url}
                            alt={exp.company_name}
                            className="w-12 h-12 rounded object-contain bg-white"
                          />
                        )}
                        <div className="flex-1">
                          <div className="text-white font-medium">
                            {exp.positions?.[0]?.title || "Position"}
                          </div>
                          <div className="text-secondary-50 text-sm">
                            {exp.company_name}
                            {exp.positions?.[0]?.employment_type &&
                              ` · ${exp.positions[0].employment_type}`}
                          </div>
                          <div className="text-secondary-50/70 text-xs mt-1">
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
                            <p className="text-secondary-50 text-sm mt-2">
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
                  <h4 className="text-white font-semibold mb-3">Education</h4>
                  <div className="space-y-4">
                    {metadata.education.map((edu: any, idx: number) => (
                      <div key={idx} className="flex gap-3">
                        {edu.school_logo_url && (
                          <img
                            src={edu.school_logo_url}
                            alt={edu.school_name}
                            className="w-12 h-12 rounded object-contain bg-white"
                          />
                        )}
                        <div className="flex-1">
                          <div className="text-white font-medium">
                            {edu.school_name}
                          </div>
                          <div className="text-secondary-50 text-sm">
                            {edu.degree &&
                              edu.field_of_study &&
                              `${edu.degree}, ${edu.field_of_study}`}
                            {edu.grade && ` · GPA: ${edu.grade}`}
                          </div>
                          <div className="text-secondary-50/70 text-xs mt-1">
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
                  <h4 className="text-white font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {metadata.skills
                      .slice(0, 20)
                      .map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary-700/50 text-secondary-50 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Network Info */}
              {metadata.network_info && (
                <div className="flex gap-6 text-sm">
                  {metadata.network_info.connections_count && (
                    <div>
                      <span className="text-white font-medium">
                        {metadata.network_info.connections_count}
                      </span>
                      <span className="text-secondary-50"> connections</span>
                    </div>
                  )}
                  {metadata.network_info.followers_count && (
                    <div>
                      <span className="text-white font-medium">
                        {metadata.network_info.followers_count}
                      </span>
                      <span className="text-secondary-50"> followers</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
