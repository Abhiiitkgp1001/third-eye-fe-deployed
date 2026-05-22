"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui";
import { Send, X, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatBoxProps {
  companyNames: string;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => Promise<string>;
}

export default function AIChatBox({
  companyNames,
  isOpen,
  onClose,
  onSendMessage,
}: AIChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await onSendMessage(input);

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] z-50"
      >
        <Card className="border-4 border-border shadow-[8px_8px_0_0_var(--border)]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-border bg-main">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-main-foreground" />
              <div>
                <h3 className="text-sm font-bold text-main-foreground">AI Assistant</h3>
                <p className="text-xs text-main-foreground/80">{companyNames}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-main-foreground/10 rounded-base transition-colors"
            >
              <X className="w-4 h-4 text-main-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-3 bg-secondary-background">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="w-12 h-12 text-foreground/20 mb-3" />
                <p className="text-sm text-foreground/60 mb-1">Ask me anything about the selected companies</p>
                <p className="text-xs text-foreground/40">
                  I have access to company data, posts, and signal movements
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-base border-2 border-border p-3 ${
                    message.role === "user"
                      ? "bg-main text-main-foreground"
                      : "bg-background text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-[10px] opacity-50 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-base border-2 border-border p-3 bg-background">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-main" />
                    <p className="text-sm text-foreground/60">Thinking...</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t-2 border-border bg-background">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-secondary-background border-2 border-border rounded-base text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-main disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-main text-main-foreground rounded-base border-2 border-border hover:bg-main/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
