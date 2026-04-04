import React, { useState } from "react";

interface CompanyRowProps {
  company: any;
  listId: string;
  isExpanded: boolean;
  onToggleExpanded: (companyId: string) => void;
  onDelete: (companyId: string) => void;
}

export default function CompanyRow({
  company,
  listId,
  isExpanded,
  onToggleExpanded,
  onDelete,
}: CompanyRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const getDisplayName = () => {
    if (company.latestMetadata?.name) {
      return company.latestMetadata.name;
    }
    return null;
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this company?")) {
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(company.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const displayName = getDisplayName();
  const metadata = company.latestMetadata;

  return (
    <React.Fragment>
      <tr className="hover:bg-primary-800/50 transition-colors group cursor-pointer">
        <td
          className="px-6 py-4"
          onClick={() => metadata && onToggleExpanded(company.id)}
        >
          <div className="flex items-center gap-3">
            {metadata?.logo && (
              <img
                src={metadata.logo}
                alt={displayName || "Company"}
                className="w-10 h-10 rounded object-contain bg-white p-1"
              />
            )}
            <div className="flex items-center gap-2">
              <a
                href={company.linkedinUrl}
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
                {displayName || company.linkedinUrl}
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
          onClick={() => metadata && onToggleExpanded(company.id)}
        >
          <div className="line-clamp-2">
            {metadata?.description || "-"}
          </div>
        </td>
        <td
          className="px-6 py-4"
          onClick={() => metadata && onToggleExpanded(company.id)}
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
          onClick={() => metadata && onToggleExpanded(company.id)}
        >
          {new Date(company.createdAt).toLocaleDateString()}
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
              {/* Company Overview */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">
                    Company Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    {metadata.industry && (
                      <div>
                        <span className="text-secondary-50/70">Industry: </span>
                        <span className="text-white">{metadata.industry}</span>
                      </div>
                    )}
                    {metadata.company_size && (
                      <div>
                        <span className="text-secondary-50/70">
                          Company Size:{" "}
                        </span>
                        <span className="text-white">
                          {metadata.company_size}
                        </span>
                      </div>
                    )}
                    {metadata.headquarters && (
                      <div>
                        <span className="text-secondary-50/70">
                          Headquarters:{" "}
                        </span>
                        <span className="text-white">
                          {metadata.headquarters}
                        </span>
                      </div>
                    )}
                    {metadata.founded && (
                      <div>
                        <span className="text-secondary-50/70">Founded: </span>
                        <span className="text-white">{metadata.founded}</span>
                      </div>
                    )}
                    {metadata.specialties && (
                      <div>
                        <span className="text-secondary-50/70">
                          Specialties:{" "}
                        </span>
                        <span className="text-white">
                          {metadata.specialties}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {metadata.website && (
                  <div>
                    <h4 className="text-white font-semibold mb-3">Website</h4>
                    <a
                      href={metadata.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 hover:underline text-sm"
                    >
                      {metadata.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Description */}
              {metadata.description && (
                <div>
                  <h4 className="text-white font-semibold mb-2">About</h4>
                  <p className="text-secondary-50 text-sm whitespace-pre-wrap">
                    {metadata.description}
                  </p>
                </div>
              )}

              {/* Follower Count */}
              {metadata.follower_count && (
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-white font-medium">
                      {metadata.follower_count.toLocaleString()}
                    </span>
                    <span className="text-secondary-50">
                      {" "}
                      followers on LinkedIn
                    </span>
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
