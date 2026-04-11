"use client";

import { useTheme } from "@/lib/theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center p-2 rounded-base border-2 border-border bg-background text-foreground hover:bg-secondary-background transition-colors"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
