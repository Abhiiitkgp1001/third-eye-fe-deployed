import React, { useState } from "react";
import { Badge, Button, Avatar, AvatarImage, AvatarFallback } from "@/components/ui";
import { Trash2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Profile, getProfileMetadata } from "@/lib/trpc/schemas/peopleList-schemas";

interface ProfileRowProps {
  profile: Profile;
  onViewProfile: (profile: Profile) => void;
  onDelete: (profileId: string) => Promise<void>;
  index: number;
}

export default function ProfileRow({
  profile,
  onViewProfile,
  onDelete,
  index,
}: ProfileRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const metadata = getProfileMetadata(profile);

  const displayName = metadata
    ? `${metadata.first_name ?? ""} ${metadata.last_name ?? ""}`.trim() || null
    : null;

  const initials = displayName
    ? displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this profile?")) return;
    setIsDeleting(true);
    try {
      await onDelete(profile.id);
    } finally {
      setIsDeleting(false);
    }
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
            <AvatarImage src={metadata?.profile_photo_url} alt={displayName ?? "Profile"} />
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
      <td className="px-6 py-4 text-gray-300">
        <span className="line-clamp-2">{metadata?.headline ?? "-"}</span>
      </td>
      <td className="px-6 py-4">
        <Badge variant={metadata ? 'default' : 'neutral'}>
          {metadata ? 'Enriched' : 'Pending'}
        </Badge>
      </td>
      <td className="px-6 py-4 text-gray-400 text-sm">
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
  );
}
