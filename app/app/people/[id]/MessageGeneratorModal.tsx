"use client";

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Label,
  Badge,
  Spinner,
  useToast,
} from "@/components/ui";
import { Mail, MessageSquare, Copy, Sparkles, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Profile } from "@/lib/trpc/schemas/peopleList-schemas";

interface MessageGeneratorModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}

type MessageFormat = "linkedin" | "email";

export default function MessageGeneratorModal({
  profile,
  isOpen,
  onClose,
}: MessageGeneratorModalProps) {
  const [format, setFormat] = useState<MessageFormat>("linkedin");
  const [userMessage, setUserMessage] = useState("");
  const [companyContext, setCompanyContext] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const generateMutation = trpc.outreach.generateMessage.useMutation({
    onSuccess: (data) => {
      setGeneratedMessage(data);
      addToast({
        title: "Message generated",
        description: "Your personalized message is ready!",
        variant: "success",
        duration: 3000,
      });
    },
    onError: (error) => {
      addToast({
        title: "Failed to generate message",
        description: error.message || "An error occurred while generating the message.",
        variant: "error",
        duration: 5000,
      });
    },
  });

  const handleGenerate = () => {
    if (!userMessage.trim()) {
      addToast({
        title: "Input required",
        description: "Please tell us what you want to say to this person.",
        variant: "error",
        duration: 3000,
      });
      return;
    }

    generateMutation.mutate({
      profileId: profile.id,
      userMessage: userMessage.trim(),
      format,
      companyContext: companyContext.trim() || undefined,
    });
  };

  const handleCopy = () => {
    if (!generatedMessage) return;

    const textToCopy =
      format === "email" && generatedMessage.subject
        ? `Subject: ${generatedMessage.subject}\n\n${generatedMessage.body}`
        : generatedMessage.body;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    addToast({
      title: "Copied to clipboard",
      description: "Message copied successfully!",
      variant: "success",
      duration: 2000,
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGeneratedMessage(null);
    setUserMessage("");
    setCompanyContext("");
    setCopied(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Get profile name
  const rawMetadata = profile.latestMetadata;
  const isAggregatedFormat = rawMetadata && typeof rawMetadata === "object" && "profile" in rawMetadata;
  const metadata = isAggregatedFormat ? (rawMetadata as any).profile : rawMetadata;
  const displayName = metadata
    ? `${metadata.first_name ?? ""} ${metadata.last_name ?? ""}`.trim() || "this profile"
    : "this profile";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            Generate Personalized Message
          </DialogTitle>
          <DialogDescription>
            Create a highly personalized {format === "linkedin" ? "LinkedIn message" : "email"} for{" "}
            {displayName} using AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Message Type</Label>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFormat("linkedin");
                  setGeneratedMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                  format === "linkedin"
                    ? "border-brand-500 bg-brand-500/10 text-brand-400"
                    : "border-dark-300 hover:border-dark-400 text-foreground/60"
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">LinkedIn Message</span>
              </button>
              <button
                onClick={() => {
                  setFormat("email");
                  setGeneratedMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                  format === "email"
                    ? "border-brand-500 bg-brand-500/10 text-brand-400"
                    : "border-dark-300 hover:border-dark-400 text-foreground/60"
                }`}
              >
                <Mail className="w-5 h-5" />
                <span className="font-medium">Email</span>
              </button>
            </div>
          </div>

          {/* User Message Input */}
          <div className="space-y-2">
            <Label htmlFor="userMessage">
              What do you want to say? <span className="text-red-400">*</span>
            </Label>
            <textarea
              id="userMessage"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Example: I want to introduce our AI sales tool and offer a demo..."
              className="w-full min-h-[100px] p-3 rounded-lg bg-dark-300 border border-dark-400 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand-500"
              disabled={generateMutation.isPending}
            />
            <p className="text-xs text-foreground/60">
              Be specific about your goal - AI will personalize based on their recent posts, job changes, and activity
            </p>
          </div>

          {/* Optional Company Context */}
          <div className="space-y-2">
            <Label htmlFor="companyContext">Your Company Context (Optional)</Label>
            <textarea
              id="companyContext"
              value={companyContext}
              onChange={(e) => setCompanyContext(e.target.value)}
              placeholder="Example: We're an AI-powered CRM that helps sales teams... (helps personalize the message)"
              className="w-full min-h-[80px] p-3 rounded-lg bg-dark-300 border border-dark-400 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand-500"
              disabled={generateMutation.isPending}
            />
          </div>

          {/* Generate Button */}
          {!generatedMessage && (
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !userMessage.trim()}
              className="w-full"
              variant="default"
            >
              {generateMutation.isPending ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Personalized Message
                </>
              )}
            </Button>
          )}

          {/* Generated Message Display */}
          <AnimatePresence>
            {generatedMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Metadata */}
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="default" className="capitalize">
                    {generatedMessage.tone}
                  </Badge>
                  <span className="text-foreground/60">
                    {format === "linkedin" ? "LinkedIn Message" : "Email"}
                  </span>
                </div>

                {/* Subject (Email only) */}
                {format === "email" && generatedMessage.subject && (
                  <div className="space-y-2">
                    <Label className="text-xs text-foreground/60">Subject Line</Label>
                    <div className="p-3 rounded-lg bg-dark-300 border border-dark-400">
                      <p className="text-foreground font-medium">{generatedMessage.subject}</p>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div className="space-y-2">
                  <Label className="text-xs text-foreground/60">Message</Label>
                  <div className="p-4 rounded-lg bg-dark-300 border border-dark-400 max-h-[300px] overflow-y-auto">
                    <pre className="text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {generatedMessage.body}
                    </pre>
                  </div>
                </div>

                {/* Key Points */}
                {generatedMessage.keyPoints && generatedMessage.keyPoints.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-foreground/60">Personalization Points Used</Label>
                    <div className="flex flex-wrap gap-2">
                      {generatedMessage.keyPoints.map((point: string, index: number) => (
                        <Badge key={index} variant="neutral" className="text-xs">
                          {point}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Reasoning */}
                {generatedMessage.reasoning && (
                  <div className="p-3 rounded-lg bg-dark-200/50 border border-dark-400">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-brand-400">Why this approach</p>
                        <p className="text-xs text-foreground/70">{generatedMessage.reasoning}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button onClick={handleCopy} className="flex-1" variant="default">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Message
                      </>
                    )}
                  </Button>
                  <Button onClick={handleReset} variant="neutral">
                    Generate New
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}