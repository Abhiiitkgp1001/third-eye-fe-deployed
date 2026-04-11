import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (linkedinUrls: string[]) => Promise<void>;
}

// LinkedIn URL regex from backend schema
const LINKEDIN_URL_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;

interface CsvData {
  headers: string[];
  rows: string[][];
}

export default function CsvUploadModal({
  isOpen,
  onClose,
  onUpload,
}: CsvUploadModalProps) {
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      // Parse CSV
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        setErrorMessage("CSV file must have at least a header row and one data row");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = lines.slice(1).map((line) =>
        line.split(",").map((cell) => cell.trim())
      );

      setCsvData({ headers, rows });
      setSelectedColumn(null);
      setValidationErrors([]);
    };

    reader.readAsText(file);
  };

  const validateColumn = (columnIndex: number): string[] => {
    if (!csvData) return [];

    const errors: string[] = [];
    const columnValues = csvData.rows.map((row) => row[columnIndex]).filter(Boolean);

    columnValues.forEach((value, idx) => {
      if (!LINKEDIN_URL_REGEX.test(value)) {
        errors.push(`Row ${idx + 2}: "${value}" is not a valid LinkedIn URL`);
      }
    });

    return errors;
  };

  const handleColumnSelect = (columnIndex: number) => {
    setSelectedColumn(columnIndex);
    const errors = validateColumn(columnIndex);
    setValidationErrors(errors);
  };

  const handleUpload = async () => {
    if (!csvData || selectedColumn === null) return;

    const linkedinUrls = csvData.rows
      .map((row) => row[selectedColumn])
      .filter((url) => url && LINKEDIN_URL_REGEX.test(url));

    if (linkedinUrls.length === 0) {
      setErrorMessage("No valid LinkedIn URLs found in the selected column");
      return;
    }

    setIsUploading(true);
    setUploadProgress(`Uploading ${linkedinUrls.length} profiles...`);

    try {
      await onUpload(linkedinUrls);
      setUploadProgress(`Successfully uploaded ${linkedinUrls.length} profiles!`);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error("Upload failed:", error);
      setErrorMessage("Failed to upload profiles. Please try again.");
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const handleClose = () => {
    setCsvData(null);
    setSelectedColumn(null);
    setValidationErrors([]);
    setIsUploading(false);
    setUploadProgress("");
    onClose();
  };

  const getColumnPreviewData = (columnIndex: number): string[] => {
    if (!csvData) return [];
    return csvData.rows.slice(0, 5).map((row) => row[columnIndex] || "");
  };

  const validLinkedinUrlsCount = csvData && selectedColumn !== null
    ? csvData.rows.filter((row) =>
        row[selectedColumn] && LINKEDIN_URL_REGEX.test(row[selectedColumn])
      ).length
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-xl bg-primary-900/95 rounded-2xl border border-primary-700/40 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Upload CSV</h2>

        {!csvData ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-primary-700 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer inline-block"
              >
                <div className="text-primary-400 text-4xl mb-2">📄</div>
                <div className="text-foreground font-medium mb-1">
                  Choose a CSV file
                </div>
                <div className="text-secondary-50 text-sm">
                  First row should contain headers
                </div>
              </label>
            </div>
            <div className="text-secondary-50 text-sm">
              <p className="font-semibold mb-2">Requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>CSV file with headers in the first row</li>
                <li>At least one column with LinkedIn profile URLs</li>
                <li>URLs must be in format: https://linkedin.com/in/username</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Column Selection */}
            <div>
              <h3 className="text-foreground font-semibold mb-3">
                Select the column containing LinkedIn URLs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {csvData.headers.map((header, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleColumnSelect(idx)}
                    className={`p-4 rounded-lg border transition-all text-left ${
                      selectedColumn === idx
                        ? "border-primary-500 bg-primary-800/50"
                        : "border-primary-700 bg-primary-800/20 hover:bg-primary-800/40"
                    }`}
                  >
                    <div className="text-foreground font-medium mb-2">
                      {header || `Column ${idx + 1}`}
                    </div>
                    <div className="text-secondary-50 text-xs space-y-1">
                      {getColumnPreviewData(idx).map((value, rowIdx) => (
                        <div key={rowIdx} className="truncate">
                          {value || "(empty)"}
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Validation Results */}
            {selectedColumn !== null && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-foreground font-semibold">
                    Validation Results
                  </h3>
                  <div className="text-sm">
                    {validationErrors.length === 0 ? (
                      <span className="text-green-400">
                        ✓ {validLinkedinUrlsCount} valid URLs found
                      </span>
                    ) : (
                      <span className="text-yellow-400">
                        ⚠ {validationErrors.length} invalid URLs found,{" "}
                        {validLinkedinUrlsCount} valid
                      </span>
                    )}
                  </div>
                </div>

                {validationErrors.length > 0 && (
                  <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="text-yellow-400 text-sm space-y-1">
                      {validationErrors.slice(0, 10).map((error, idx) => (
                        <div key={idx}>{error}</div>
                      ))}
                      {validationErrors.length > 10 && (
                        <div className="text-yellow-300 font-medium">
                          ... and {validationErrors.length - 10} more errors
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {validationErrors.length === 0 && validLinkedinUrlsCount > 0 && (
                  <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-4">
                    <div className="text-green-400 text-sm">
                      All URLs in this column are valid LinkedIn profile URLs.
                      Ready to upload!
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress && (
              <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4">
                <div className="text-white text-center">{uploadProgress}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={
                  selectedColumn === null ||
                  validLinkedinUrlsCount === 0 ||
                  isUploading
                }
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading
                  ? "Uploading..."
                  : `Upload ${validLinkedinUrlsCount} Profiles`}
              </button>
              <button
                onClick={() => {
                  setCsvData(null);
                  setSelectedColumn(null);
                  setValidationErrors([]);
                }}
                disabled={isUploading}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Choose Different File
              </button>
              <button
                onClick={handleClose}
                disabled={isUploading}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Dialog */}
      <AlertDialog open={!!errorMessage} onOpenChange={() => setErrorMessage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorMessage(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
