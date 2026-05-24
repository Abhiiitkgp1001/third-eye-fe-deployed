"use client";

import React from "react";
import { ExternalLink } from "lucide-react";

interface EvidenceItem {
  name: string;
  value: string;
  detail?: string;
  url?: string;
}

interface TableViewProps {
  evidence: EvidenceItem[];
}

export default function TableView({ evidence }: TableViewProps) {
  if (!evidence || evidence.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-2 border-border rounded-base overflow-hidden">
        <thead>
          <tr className="bg-secondary-background border-b-2 border-border">
            <th className="px-4 py-3 text-left text-sm font-heading text-foreground">
              Name
            </th>
            <th className="px-4 py-3 text-left text-sm font-heading text-foreground">
              Value
            </th>
            <th className="px-4 py-3 text-left text-sm font-heading text-foreground">
              Details
            </th>
            <th className="px-4 py-3 text-center text-sm font-heading text-foreground w-16">
              Link
            </th>
          </tr>
        </thead>
        <tbody>
          {evidence.map((item, index) => (
            <tr
              key={index}
              className="border-b border-border last:border-b-0 hover:bg-secondary-background/50 transition-colors"
            >
              <td className="px-4 py-3 text-sm font-base text-foreground">
                {item.name}
              </td>
              <td className="px-4 py-3 text-sm font-heading text-main">
                {item.value}
              </td>
              <td className="px-4 py-3 text-sm font-base text-foreground/80">
                {item.detail || "—"}
              </td>
              <td className="px-4 py-3 text-center">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-base border-2 border-border bg-background hover:bg-main hover:border-main hover:text-white transition-all"
                    title="View profile"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-foreground/30">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
