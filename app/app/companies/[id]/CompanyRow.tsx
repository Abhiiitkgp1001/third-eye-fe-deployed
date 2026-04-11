import React, { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { Trash2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface CompanyRowProps {
  company: any;
  onViewCompany: (company: any) => void;
  onDelete: (companyId: string) => Promise<void>;
  index: number;
}

export default function CompanyRow({
  company,
  onViewCompany,
  onDelete,
  index,
}: CompanyRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const metadata = company.latestMetadata;

  const displayName = metadata?.company_name || null;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this company?")) return;
    setIsDeleting(true);
    try {
      await onDelete(company.id);
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
      onClick={() => onViewCompany(company)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {metadata?.logo_url && (
            <img
              src={metadata.logo_url}
              alt={displayName || "Company"}
              className="w-10 h-10 rounded object-contain bg-white p-1"
            />
          )}
          <a
            href={company.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:text-brand-300 hover:underline flex items-center gap-1.5 group/link font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {displayName || company.linkedinUrl}
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
          </a>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-300">
        <span className="line-clamp-2">{metadata?.description || "-"}</span>
      </td>
      <td className="px-6 py-4">
        <Badge variant={metadata ? "default" : "neutral"}>
          {metadata ? "Enriched" : "Pending"}
        </Badge>
      </td>
      <td className="px-6 py-4 text-gray-400 text-sm">
        {new Date(company.createdAt).toLocaleDateString()}
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
