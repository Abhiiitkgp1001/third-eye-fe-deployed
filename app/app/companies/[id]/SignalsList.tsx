"use client";

import { Target } from "lucide-react";
import type { MovementDefinition } from "@/lib/trpc/schemas/companyList-schemas";

interface SignalsListProps {
  movementDefinitions: MovementDefinition[];
}

export default function SignalsList({ movementDefinitions }: SignalsListProps) {
  if (!movementDefinitions || movementDefinitions.length === 0) {
    return null;
  }

  const signalsWithMetadata = movementDefinitions.map((def) => ({
    name: def.name,
    label: def.name.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' '),
    description: def.description,
  }));

  return (
    <div className="pt-4 border-t-4 border-black">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="bg-main border-4 border-black p-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <Target className="w-5 h-5 text-black" />
        </div>
        <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
          Tracking {movementDefinitions.length} Signal{movementDefinitions.length !== 1 ? 's' : ''}
        </h3>
      </div>

      {/* Signals Grid - Neobrutalism cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {signalsWithMetadata.map((signal) => (
          <div
            key={signal.name}
            className="
              relative overflow-hidden
              bg-main
              border-4 border-border
              p-4
              shadow-[6px_6px_0_0_var(--border)]
              hover:translate-x-[2px] hover:translate-y-[2px]
              hover:shadow-[4px_4px_0_0_var(--border)]
              transition-all duration-150
            "
          >
            {/* Neobrutalism dot pattern background */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.5) 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px'
              }}
            />
            <div className="relative flex items-start justify-between gap-2 mb-2">
              <h4 className="font-black text-base text-main-foreground uppercase tracking-tight leading-tight">
                {signal.label}
              </h4>
              <span className="bg-foreground text-background text-[10px] font-bold px-2 py-1 border-2 border-foreground uppercase tracking-wider whitespace-nowrap">
                AI
              </span>
            </div>
            <p className="relative text-sm text-main-foreground font-medium leading-snug">
              {signal.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
