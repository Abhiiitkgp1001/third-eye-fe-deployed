"use client";

import React from "react";
import TableView from "./visualizations/TableView";
import CardsView from "./visualizations/CardsView";
import ListView from "./visualizations/ListView";
import { Info } from "lucide-react";

interface EvidenceItem {
  name: string;
  value: string;
  detail?: string;
  url?: string;
}

interface SummaryItem {
  key: string;
  value: string;
}

interface EnhancedMessageRendererProps {
  answer: string;
  visualizationType: "table" | "cards" | "list" | "text";
  evidence?: EvidenceItem[];
  summary?: SummaryItem[];
}

export default function EnhancedMessageRenderer({
  answer,
  visualizationType,
  evidence = [],
  summary = [],
}: EnhancedMessageRendererProps) {
  return (
    <div className="space-y-4">
      {/* Main answer text */}
      <div className="prose prose-sm max-w-none">
        <p className="whitespace-pre-wrap font-base text-sm leading-relaxed text-foreground">
          {answer}
        </p>
      </div>

      {/* Summary stats (if available) */}
      {summary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {summary.map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-base border-2 border-border bg-secondary-background"
            >
              <div className="text-xs font-base text-foreground/60 mb-1">
                {item.key}
              </div>
              <div className="text-lg font-heading text-main">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visualization based on type */}
      {evidence.length > 0 && (
        <div>
          {/* Evidence label */}
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-main" />
            <span className="text-xs font-heading text-foreground/70 uppercase tracking-wide">
              Evidence & Details
            </span>
          </div>

          {/* Render appropriate visualization */}
          {visualizationType === "table" && <TableView evidence={evidence} />}
          {visualizationType === "cards" && <CardsView evidence={evidence} />}
          {visualizationType === "list" && <ListView evidence={evidence} />}
          {visualizationType === "text" && (
            <div className="p-4 rounded-base border-2 border-border bg-secondary-background/50">
              <p className="text-sm font-base text-foreground/80">
                No structured data available for this response.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
