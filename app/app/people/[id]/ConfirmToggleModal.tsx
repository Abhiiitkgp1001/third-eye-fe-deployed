import React from "react";

interface ConfirmToggleModalProps {
  isOpen: boolean;
  currentStatus: boolean;
  listName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmToggleModal({
  isOpen,
  currentStatus,
  listName,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmToggleModalProps) {
  if (!isOpen) return null;

  const isActivating = !currentStatus;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl border border-gray-800 p-8 w-full max-w-md">
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              isActivating
                ? "bg-brand-500/20 text-brand-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {isActivating ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isActivating ? "Activate List" : "Deactivate List"}
            </h2>
            <p className="text-gray-300 text-sm">
              {isActivating
                ? `Are you sure you want to activate "${listName}"?`
                : `Are you sure you want to deactivate "${listName}"?`}
            </p>
          </div>
        </div>

        <div className="bg-dark-200/60 rounded-lg p-4 mb-6 border border-gray-800">
          <p className="text-white text-sm mb-3 font-semibold">
            {isActivating ? "What will happen:" : "What will stop:"}
          </p>
          <ul className="text-gray-300 text-sm space-y-2">
            {isActivating ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-brand-400 mt-0.5">✓</span>
                  <span>
                    Profile monitoring will begin based on the configured
                    cadence
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-400 mt-0.5">✓</span>
                  <span>
                    Profile enrichment will run to gather latest data
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-400 mt-0.5">✓</span>
                  <span>
                    Movement notifications will be enabled for tracked changes
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">✓</span>
                  <span className="text-yellow-400 font-medium">
                    This list will become billable
                  </span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">⚠</span>
                  <span>Profile monitoring will be paused</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">⚠</span>
                  <span>No new profile data will be collected</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">⚠</span>
                  <span>Movement notifications will be disabled</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-400 mt-0.5">✓</span>
                  <span className="text-brand-400 font-medium">
                    This list will stop being billable
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isActivating
                ? "bg-brand-500 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30 hover:scale-[1.02] text-white shadow-lg shadow-brand-500/20"
                : "bg-yellow-500 hover:bg-yellow-600 hover:shadow-xl hover:shadow-yellow-500/30 hover:scale-[1.02] text-white shadow-lg shadow-yellow-500/20"
            }`}
          >
            {isLoading
              ? isActivating
                ? "Activating..."
                : "Deactivating..."
              : isActivating
              ? "Yes, Activate"
              : "Yes, Deactivate"}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-dark-200 hover:bg-dark-100 hover:border-gray-600 hover:scale-[1.02] border border-gray-700 text-gray-300 hover:text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
