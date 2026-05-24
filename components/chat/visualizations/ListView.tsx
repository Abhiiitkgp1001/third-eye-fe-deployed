"use client";

import React from "react";
import { CheckCircle2, ExternalLink } from "lucide-react";

interface EvidenceItem {
  name: string;
  value: string;
  detail: string;
  url: string;
}

interface ListViewProps {
  evidence: EvidenceItem[];
}

export default function ListView({ evidence }: ListViewProps) {
  if (!evidence || evidence.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      {evidence.map((item, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-3 rounded-base border-2 border-border bg-background hover:bg-secondary-background transition-colors"
        >
          <div className="mt-0.5 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-main" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-heading text-foreground">
                {item.name}
              </span>
              <span className="text-sm font-heading text-main">
                {item.value}
              </span>
            </div>
            {item.detail && item.detail.trim() && (
              <p className="text-sm text-foreground/70 font-base mt-1">
                {item.detail}
              </p>
            )}
          </div>
          {item.url && item.url.trim() && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded-base border-2 border-border bg-background hover:bg-main hover:border-main hover:text-white transition-all shrink-0"
              title="View profile"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
