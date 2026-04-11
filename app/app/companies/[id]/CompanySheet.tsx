"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui";

interface CompanySheetProps {
  company: any | null;
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

export default function CompanySheet({ company, onClose }: CompanySheetProps) {
  const metadata = company?.latestMetadata;
  const displayName = metadata?.company_name || "Unnamed Company";

  useEffect(() => {
    if (!company) return;
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [company, onClose]);

  useEffect(() => {
    document.body.style.overflow = company ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [company]);

  return (
    <AnimatePresence>
      {company && (
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
                {metadata?.logo_url && (
                  <img
                    src={metadata.logo_url}
                    alt={displayName}
                    className="w-14 h-14 rounded-lg object-contain bg-white p-2"
                  />
                )}
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-foreground truncate">
                    {displayName}
                  </h2>
                  <a
                    href={company.linkedinUrl}
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
              {metadata?.tagline && (
                <p className="text-foreground/60 text-base leading-relaxed">{metadata.tagline}</p>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant={metadata ? "default" : "neutral"}>
                  {metadata ? "Enriched" : "Pending"}
                </Badge>
                <span className="text-foreground/50 text-sm">
                  Added {new Date(company.createdAt).toLocaleDateString()}
                </span>
              </div>

              {metadata?.followers_count && (
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-foreground font-semibold">
                      {metadata.followers_count.toLocaleString()}
                    </span>
                    <span className="text-foreground/60"> followers on LinkedIn</span>
                  </div>
                </div>
              )}

              {metadata?.description && (
                <div>
                  <SectionHeader>About</SectionHeader>
                  <p className="text-foreground/60 text-sm whitespace-pre-wrap leading-relaxed mt-2">
                    {metadata.description}
                  </p>
                </div>
              )}

              {/* Company Details */}
              {(metadata?.industries || metadata?.staff_info?.staff_count || metadata?.locations?.headquarter || metadata?.founded_on?.year) && (
                <div>
                  <SectionHeader>Company Details</SectionHeader>
                  <div className="space-y-2 mt-3 text-sm">
                    {metadata.industries && metadata.industries.length > 0 && (
                      <div className="flex gap-2">
                        <span className="text-foreground/60 w-24 shrink-0">Industries:</span>
                        <span className="text-foreground">
                          {metadata.industries.map((i: any) => i.name).filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                    {metadata.staff_info?.staff_count && (
                      <div className="flex gap-2">
                        <span className="text-foreground/60 w-24 shrink-0">Company Size:</span>
                        <span className="text-foreground">
                          {metadata.staff_info.staff_count.toLocaleString()} employees
                        </span>
                      </div>
                    )}
                    {metadata.locations?.headquarter && (
                      <div className="flex gap-2">
                        <span className="text-foreground/60 w-24 shrink-0">Headquarters:</span>
                        <span className="text-foreground">
                          {[
                            metadata.locations.headquarter.city,
                            metadata.locations.headquarter.country
                          ].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                    {metadata.founded_on?.year && (
                      <div className="flex gap-2">
                        <span className="text-foreground/60 w-24 shrink-0">Founded:</span>
                        <span className="text-foreground">{metadata.founded_on.year}</span>
                      </div>
                    )}
                    {metadata.company_url && (
                      <div className="flex gap-2">
                        <span className="text-foreground/60 w-24 shrink-0">Website:</span>
                        <a
                          href={metadata.company_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-400 hover:text-brand-300 hover:underline"
                        >
                          {metadata.company_url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Specialties */}
              {metadata?.specialities && metadata.specialities.length > 0 && (
                <div>
                  <SectionHeader>Specialties</SectionHeader>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {metadata.specialities.map((specialty: string, idx: number) => (
                      <Badge key={idx} variant="neutral">{specialty}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Funding */}
              {metadata?.funding_data?.last_funding_round?.money_raised && (
                <div>
                  <SectionHeader>Funding</SectionHeader>
                  <div className="mt-3 p-4 bg-dark-200/60 rounded-lg border border-gray-800 space-y-3">
                    <div>
                      <div className="text-xs text-foreground/60 mb-1">Last Funding Round</div>
                      <div className="text-2xl font-bold text-foreground">
                        {(() => {
                          const currency = metadata.funding_data.last_funding_round.money_raised.currency?.toUpperCase() || 'USD';
                          const amount = metadata.funding_data.last_funding_round.money_raised.amount?.toLocaleString() || '0';
                          return currency === 'USD' ? `$${amount}` : `${currency} ${amount}`;
                        })()}
                      </div>
                    </div>
                    {metadata.funding_data.num_of_funding_rounds && (
                      <div className="pt-3 border-t border-gray-700/50">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-semibold">
                            {metadata.funding_data.num_of_funding_rounds}
                          </span>
                          <span className="text-foreground/60 text-sm">
                            total funding round{metadata.funding_data.num_of_funding_rounds !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}
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
