import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface RenameListModalProps {
  isOpen: boolean;
  currentName: string;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function RenameListModal({
  isOpen,
  currentName,
  onConfirm,
  onCancel,
  isLoading = false,
}: RenameListModalProps) {
  const [newName, setNewName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newName.trim() !== currentName) {
      onConfirm(newName.trim());
    }
  };

  const isDisabled = !newName.trim() || newName.trim() === currentName || isLoading;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-background opacity-100 rounded-2xl border border-gray-800 p-8 w-full max-w-md">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Rename List
            </h2>
            <p className="text-foreground/60 text-sm">
              Enter a new name for this list
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-foreground/60 hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-foreground text-sm font-medium mb-2">
              List Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter list name"
              className="w-full px-4 py-3 bg-dark-200/60 border border-gray-700 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              autoFocus
              disabled={isLoading}
            />
            <p className="text-foreground/40 text-xs mt-2">
              Current name: {currentName}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isDisabled}
              className="flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-brand-500 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30 hover:scale-[1.02] text-white shadow-lg shadow-brand-500/20"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-dark-200 hover:bg-dark-100 hover:border-gray-600 hover:scale-[1.02] border border-gray-700 text-foreground/60 hover:text-foreground rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
