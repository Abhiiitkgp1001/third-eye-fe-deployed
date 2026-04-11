'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
} from "@/components/ui";
import { Loader2, ArrowLeft,  CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MovementDefinition {
  name: string;
  description: string;
}

interface CreateListWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateListWizard({ open, onOpenChange }: CreateListWizardProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [listName, setListName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [movements, setMovements] = useState<MovementDefinition[]>([]);
  const [promptError, setPromptError] = useState('');
  const [cadence, setCadence] = useState<"MANUAL" | "DAILY" | "WEEKLY" | "MONTHLY">("DAILY");
  const [cadenceInterval, setCadenceInterval] = useState(10);

  const processPrompt = trpc.prompts.processForCompanyList.useMutation({
    onSuccess: (data) => {
      setMovements(data.movements);
      setPromptError('');
    },
    onError: (error) => {
      setPromptError(error.message);
      setMovements([]);
    },
  });

  const createList = trpc.companyLists.create.useMutation({
    onSuccess: (data) => {
      utils.companyLists.getAll.invalidate();
      handleClose();
      router.push(`/app/companies/${data.list.id}`);
    },
    onError: (error) => {
      setPromptError(`Error creating list: ${error.message}`);
    },
  });

  function handleClose() {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setListName('');
      setPrompt('');
      setMovements([]);
      setPromptError('');
      setCadence("DAILY");
      setCadenceInterval(10);
    }, 200);
  }

  function handleNext() {
    if (step === 1 && listName.trim()) {
      setStep(2);
    }
  }

  function handleProcessPrompt() {
    if (!prompt.trim()) return;
    setPromptError('');
    processPrompt.mutate({ prompt: prompt.trim() });
  }

  function handleCreate() {
    createList.mutate({
      name: listName.trim(),
      prompt: prompt.trim() || undefined,
      cadence,
      cadenceInterval,
      companies: [],
    });
  }

  const isBusy = processPrompt.isPending || createList.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isBusy) { if (!v) handleClose(); else onOpenChange(v); } }}>
      <DialogContent className="sm:max-w-md">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400 font-medium">Step {step} of 3</span>
          <div className="flex gap-1">
            <div className={`h-1 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-gray-700'}`} />
            <div className={`h-1 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-gray-700'}`} />
            <div className={`h-1 w-8 rounded-full transition-colors ${step >= 3 ? 'bg-primary' : 'bg-gray-700'}`} />
          </div>
        </div>

        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Create New Company List</DialogTitle>
              <DialogDescription>
                Enter a name for your new company tracking list.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="listName">List Name</Label>
                <Input
                  id="listName"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="e.g., SaaS Companies"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleNext(); }}
                />
              </div>
            </div>

            <DialogFooter className="flex gap-3 sm:gap-3">
              <Button variant="neutral" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleNext} disabled={!listName.trim()}>
                Next
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Describe Your List (Optional)</DialogTitle>
              <DialogDescription>
                Optionally describe what kind of companies you want to track.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="prompt">Prompt</Label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Early-stage B2B SaaS startups that raised a seed round in the last 6 months..."
                  rows={4}
                  className="flex w-full rounded-base border-2 border-border bg-main px-3 py-2 text-sm text-main-foreground placeholder:text-main-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  disabled={isBusy}
                />
              </div>

              {/* Note about not implemented */}
              <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
                <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                <span className="text-xs text-yellow-300">
                  AI prompt processing for company lists is not yet implemented. You can still save a description for reference.
                </span>
              </div>

              {promptError && (
                <p className="text-sm text-red-400">{promptError}</p>
              )}

              {movements.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                  <span className="text-sm text-green-300">
                    Generated <strong>{movements.length}</strong> movement{movements.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-3 sm:gap-3">
              <Button
                variant="neutral"
                onClick={() => { setStep(1); setMovements([]); setPromptError(''); }}
                disabled={isBusy}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button onClick={() => setStep(3)} disabled={isBusy}>
                Next
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ── Step 3: Cadence ── */}
        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle>Set Update Cadence</DialogTitle>
              <DialogDescription>
                Choose how often to check for company movements and enrichments.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Cadence type selector */}
              <div className="grid gap-2">
                <Label>Cadence Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(["MANUAL", "DAILY", "WEEKLY", "MONTHLY"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setCadence(type)}
                      disabled={isBusy}
                      className={cn(
                        "px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors",
                        cadence === type
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-transparent hover:bg-secondary/50 text-muted-foreground",
                        isBusy && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interval input (only show for non-MANUAL) */}
              {cadence !== "MANUAL" && (
                <div className="grid gap-2">
                  <Label htmlFor="interval">
                    Run every{" "}
                    <span className="font-mono text-primary">{cadenceInterval}</span>{" "}
                    {cadence === "DAILY" ? "day(s)" : cadence === "WEEKLY" ? "week(s)" : "month(s)"}
                  </Label>
                  <Input
                    id="interval"
                    type="number"
                    min={1}
                    max={365}
                    value={cadenceInterval}
                    onChange={(e) => setCadenceInterval(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
                    disabled={isBusy}
                  />
                  <p className="text-xs text-muted-foreground">
                    {cadence === "DAILY" && cadenceInterval === 1 && "Companies will be enriched daily."}
                    {cadence === "DAILY" && cadenceInterval > 1 && `Companies will be enriched every ${cadenceInterval} days.`}
                    {cadence === "WEEKLY" && cadenceInterval === 1 && "Companies will be enriched weekly."}
                    {cadence === "WEEKLY" && cadenceInterval > 1 && `Companies will be enriched every ${cadenceInterval} weeks.`}
                    {cadence === "MONTHLY" && cadenceInterval === 1 && "Companies will be enriched monthly."}
                    {cadence === "MONTHLY" && cadenceInterval > 1 && `Companies will be enriched every ${cadenceInterval} months.`}
                  </p>
                </div>
              )}

              {cadence === "MANUAL" && (
                <p className="text-xs text-muted-foreground p-3 rounded-lg bg-secondary/30 border border-border">
                  Manual mode: enrichment will only run when you manually trigger it.
                </p>
              )}
            </div>

            <DialogFooter className="flex gap-3 sm:gap-3">
              <Button
                variant="neutral"
                onClick={() => { setStep(2); setPromptError(''); }}
                disabled={isBusy}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isBusy}
              >
                {createList.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create List
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
