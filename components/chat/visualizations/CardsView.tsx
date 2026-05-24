"use client";

import React from "react";
import { ExternalLink, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface EvidenceItem {
  name: string;
  value: string;
  detail?: string;
  url?: string;
}

interface CardsViewProps {
  evidence: EvidenceItem[];
}

export default function CardsView({ evidence }: CardsViewProps) {
  if (!evidence || evidence.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      {evidence.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-base border-2 border-border bg-background hover:bg-secondary-background hover:border-main transition-all shadow-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="text-sm font-heading text-foreground mb-1 line-clamp-1">
                {item.name}
              </h4>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-main" />
                <span className="text-lg font-heading text-main">
                  {item.value}
                </span>
              </div>
            </div>
            {item.url && (
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
          {item.detail && (
            <p className="text-sm text-foreground/70 font-base mt-2 line-clamp-2">
              {item.detail}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
