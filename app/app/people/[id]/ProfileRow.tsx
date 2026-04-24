import React from "react";
import { Badge, Button, Avatar, AvatarImage, AvatarFallback } from "@/components/ui";
import { Trash2, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Profile, Movement } from "@/lib/trpc/schemas/peopleList-schemas";

interface ProfileRowProps {
  profile: Profile;
  movements?: Movement[];
  onViewProfile: (profile: Profile) => void;
  onRequestDelete: (profile: Profile) => void;
  index: number;
}

export default function ProfileRow({
  profile,
  movements = [],
  onViewProfile,
  onRequestDelete,
  index,
}: ProfileRowProps) {
  // Handle both old format (direct ProfileData) and new format (PeopleAggregatedData)
  const rawMetadata = profile.latestMetadata;
  const isAggregatedFormat = rawMetadata && typeof rawMetadata === 'object' && 'profile' in rawMetadata;
  const metadata = isAggregatedFormat ? (rawMetadata as any).profile : rawMetadata;

  // Filter out NO_CHANGE and show only 2 most recent actual movements
  const actualMovements = movements.filter(m => m.movement !== "NO_CHANGE");
  const recentMovements = actualMovements.slice(0, 2);
  const hasNoChangeOnly = movements.length > 0 && actualMovements.length === 0;

  const displayName = metadata
    ? `${metadata.first_name ?? ""} ${metadata.last_name ?? ""}`.trim() || null
    : null;

  const initials = displayName
    ? displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestDelete(profile);
  };

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="hover:bg-dark-200/50 transition-colors cursor-pointer group"
      onClick={() => onViewProfile(profile)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={metadata?.profile_photo_url ?? ""} alt={displayName ?? "Profile"} />
            <AvatarFallback className="bg-brand-500/10 text-brand-400 border border-brand-500/30">
              {initials}
            </AvatarFallback>
          </Avatar>
          <a
            href={profile.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:text-brand-300 hover:underline flex items-center gap-1.5 group/link font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {displayName ?? profile.linkedinUrl}
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
          </a>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <span className="text-foreground line-clamp-1 block">{metadata?.headline ?? "-"}</span>
          {recentMovements.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {recentMovements.map((movement) => (
                <Badge
                  key={movement.id}
                  variant="default"
                  className="text-[10px] font-mono bg-brand-500/20 text-brand-400 border-brand-500/30 flex items-center gap-1"
                  title={movement.metadata?.reasoning || undefined}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  {movement.movement}
                  {movement.metadata?.confidence && (
                    <span className="opacity-70">{movement.metadata.confidence}%</span>
                  )}
                </Badge>
              ))}
              {actualMovements.length > 2 && (
                <span className="text-xs text-foreground/50">+{actualMovements.length - 2} more</span>
              )}
            </div>
          )}
          {hasNoChangeOnly && (
            <span className="text-xs text-foreground/50 italic">Validated - no changes</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge variant={metadata ? 'default' : 'neutral'}>
          {metadata ? 'Enriched' : 'Pending'}
        </Badge>
      </td>
      <td className="px-6 py-4 text-foreground/60 text-sm">
        {new Date(profile.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="neutral"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </td>
    </motion.tr>
  );
}
