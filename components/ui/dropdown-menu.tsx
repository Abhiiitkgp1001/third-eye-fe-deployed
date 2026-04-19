"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
}

export function DropdownMenu({ trigger, children, align = "end" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const updatePosition = React.useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
        menuRef.current && !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const menuContent = isOpen && (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[9999] min-w-[10rem] overflow-hidden rounded-lg border border-gray-700 bg-dark-100 shadow-2xl"
        style={{
          top: `${position.top + 8}px`,
          left: align === "end" ? `${position.left + position.width}px` : `${position.left}px`,
          transform: align === "end" ? "translateX(-100%)" : "translateX(0)",
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div className="p-1" onClick={() => setIsOpen(false)}>
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      <div className="relative inline-block" ref={triggerRef}>
        <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">{trigger}</div>
      </div>
      {typeof window !== 'undefined' && createPortal(menuContent, document.body)}
    </>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export function DropdownMenuItem({
  children,
  onClick,
  disabled = false,
  destructive = false,
}: DropdownMenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : destructive
          ? "text-red-400 hover:bg-red-500/10 focus:bg-red-500/10"
          : "text-foreground hover:bg-dark-200 focus:bg-dark-200"
      }`}
    >
      {children}
    </button>
  );
}
