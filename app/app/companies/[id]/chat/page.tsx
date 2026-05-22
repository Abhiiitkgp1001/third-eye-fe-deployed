"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import ChatInterface from "@/components/chat/ChatInterface";
import { PageSpinner, Button } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function CompanyListChatPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const { data: listData, isLoading } = trpc.companyLists.getById.useQuery({
    id: listId,
    limit: 1,
    offset: 0,
  });

  if (isLoading) {
    return <PageSpinner />;
  }

  if (!listData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-foreground text-xl">Company list not found</div>
      </div>
    );
  }

  const { list } = listData;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 py-4 border-b-2 border-border bg-background shrink-0">
        <div className="max-w-7xl mx-auto">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex items-center gap-2 text-xs text-foreground/60 font-base">
              <li>
                <Link href="/app" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/app/companies" className="hover:text-foreground transition-colors">
                  Company Lists
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href={`/app/companies/${listId}`} className="hover:text-foreground transition-colors">
                  {list.name}
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">Chat</li>
            </ol>
          </nav>

          <button
            onClick={() => router.push(`/app/companies/${listId}`)}
            className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-base">Back to {list.name}</span>
          </button>
        </div>
      </div>

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-h-0"
      >
        <ChatInterface listId={listId} listType="company" listName={list.name} />
      </motion.div>
    </div>
  );
}
