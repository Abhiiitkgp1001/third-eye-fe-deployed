"use client";

import React, { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button, Card } from "@/components/ui";
import { Send, Loader2, Sparkles, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedMessageRenderer from "./EnhancedMessageRenderer";

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

interface Message {
  role: "user" | "assistant";
  content: string;
  // Enhanced fields for assistant messages
  visualizationType?: "table" | "cards" | "list" | "text";
  evidence?: EvidenceItem[];
  summary?: SummaryItem[];
}

interface ChatInterfaceProps {
  listId: string;
  listType: "people" | "company";
  listName: string;
}

export default function ChatInterface({ listId, listType, listName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const utils = trpc.useUtils();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAsk = async () => {
    if (!input.trim() || isAsking) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsAsking(true);

    try {
      let response;
      if (listType === "people") {
        response = await utils.client.chat.askAboutPeopleList.mutate({
          listId,
          question: userMessage.content,
          conversationHistory: messages,
        });
      } else {
        response = await utils.client.chat.askAboutCompanyList.mutate({
          listId,
          question: userMessage.content,
          conversationHistory: messages,
        });
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: response.response,
        visualizationType: response.visualizationType,
        evidence: response.evidence,
        summary: response.summary,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error asking AI:", error);

      // Extract detailed error message
      let errorDetail = "Unknown error";
      if (error instanceof Error) {
        errorDetail = error.message;
      } else if (typeof error === "object" && error !== null) {
        errorDetail = JSON.stringify(error, null, 2);
      }

      console.error("Detailed error:", errorDetail);

      const errorMessage: Message = {
        role: "assistant",
        content: `Sorry, I encountered an error: ${errorDetail}\n\nPlease check:\n1. Backend server is running\n2. OpenAI API key is configured\n3. Browser console for more details`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  // Dynamic suggested questions based on list type
  const suggestedQuestions = listType === "people"
    ? [
        "What are the main topics these people are posting about?",
        "Who has the highest engagement on their posts?",
        "What job changes have been detected recently?",
        "Are there any emerging trends in their content?",
        "Which profiles are most active this week?",
      ]
    : [
        "What topics are these companies posting about?",
        "Which companies have the highest social media engagement?",
        "Are there any hiring signals or growth patterns?",
        "What industry trends can you identify?",
        "Which companies are most active this month?",
      ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b-2 border-border bg-secondary-background shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-base bg-main/10 border-2 border-border flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-main" />
          </div>
          <div>
            <h2 className="text-lg font-heading text-foreground">
              Chat with AI about your list
            </h2>
            <p className="text-sm text-foreground/60 font-base">
              Ask anything about {listName}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-main/10 border-2 border-border flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-main" />
              </div>
              <h3 className="text-xl font-heading text-foreground mb-2">
                Start a conversation
              </h3>
              <p className="text-foreground/60 font-base mb-6 max-w-md mx-auto">
                {listType === "people"
                  ? "I can help you analyze profiles, identify job changes, content trends, and engagement patterns."
                  : "I can help you analyze companies, identify hiring signals, industry trends, and social media activity."
                }
              </p>

              {/* Suggested Questions */}
              <div className="max-w-2xl mx-auto">
                <p className="text-sm font-heading text-foreground/80 mb-3">
                  Try asking:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(question)}
                      className="text-left p-3 rounded-base border-2 border-border bg-background hover:bg-secondary-background hover:border-main transition-all text-sm text-foreground/80 hover:text-foreground font-base"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-base bg-main/10 border-2 border-border flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-main" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-base border-2 p-4 ${
                  message.role === "user"
                    ? "bg-main border-border text-main-foreground shadow-shadow"
                    : "bg-background border-border text-foreground"
                }`}
              >
                {message.role === "assistant" && message.visualizationType ? (
                  <EnhancedMessageRenderer
                    answer={message.content}
                    visualizationType={message.visualizationType}
                    evidence={message.evidence}
                    summary={message.summary}
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap font-base text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-base bg-foreground/10 border-2 border-border flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-foreground" />
                </div>
              )}
            </motion.div>
          ))}

          {isAsking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 justify-start"
            >
              <div className="w-8 h-8 rounded-base bg-main/10 border-2 border-border flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-main" />
              </div>
              <div className="max-w-[80%] rounded-base border-2 border-border bg-background p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-main" />
                  <span className="text-sm text-foreground/60 font-base">
                    Thinking...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t-2 border-border bg-secondary-background shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about this list..."
                disabled={isAsking}
                rows={1}
                className="w-full px-4 py-3 rounded-base border-2 border-border bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-main focus:border-main resize-none font-base text-sm"
                style={{
                  minHeight: "48px",
                  maxHeight: "200px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                }}
              />
            </div>
            <Button
              onClick={handleAsk}
              disabled={!input.trim() || isAsking}
              size="lg"
              className="shrink-0"
            >
              {isAsking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-foreground/50 mt-2 font-base">
            Press <kbd className="px-1.5 py-0.5 rounded bg-foreground/10 border border-foreground/20">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-foreground/10 border border-foreground/20">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
}
