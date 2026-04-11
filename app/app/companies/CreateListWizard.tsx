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
  Badge,
  Checkbox,
} from "@/components/ui";
import { Loader2, ArrowLeft, Sparkles, X } from "lucide-react";
import { COMPANY_SIGNAL_GROUPS, type CompanySignal } from "@/lib/companyMovements";
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
  const [selectedSignals, setSelectedSignals] = useState<Set<CompanySignal>>(new Set());
  const [aiMovements, setAiMovements] = useState<MovementDefinition[]>([]);
  const [error, setError] = useState('');
  const [cadence, setCadence] = useState<"MANUAL" | "DAILY" | "WEEKLY" | "MONTHLY">("DAILY");
  const [cadenceInterval, setCadenceInterval] = useState(10);

  const processPrompt = trpc.prompts.processForCompanyList.useMutation({
    onSuccess: (data) => {
      setAiMovements(data.movements);
      setError('');
    },
    onError: (err) => {
      setError(err.message);
      setAiMovements([]);
    },
  });

  const createList = trpc.companyLists.create.useMutation({
    onSuccess: (data) => {
      utils.companyLists.getAll.invalidate();
      handleClose();
      router.push(`/app/companies/${data.list.id}`);
    },
    onError: (err) => {
      setError(`Error creating list: ${err.message}`);
    },
  });

  // Merge selected signals + AI-generated movements, deduped by name
  const allMovements: MovementDefinition[] = [
    ...Array.from(selectedSignals).map((key) => {
      const def = COMPANY_SIGNAL_GROUPS.flatMap((g) => g.signals).find((s) => s.key === key)!;
      return { name: key, description: def.description };
    }),
    ...aiMovements.filter(
      (m) => !Array.from(selectedSignals).some((k) => k === m.name),
    ),
  ];

  function handleClose() {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setListName('');
      setPrompt('');
      setSelectedSignals(new Set());
      setAiMovements([]);
      setCadence("DAILY");
      setCadenceInterval(10);
      setError('');
    }, 200);
  }

  function handleNext() {
    if (listName.trim()) setStep(2);
  }

  function toggleSignal(key: CompanySignal) {
    setSelectedSignals((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleProcessPrompt() {
    if (!prompt.trim()) return;
    setError('');
    processPrompt.mutate({ prompt: prompt.trim() });
  }

  function handleCreate() {
    createList.mutate({
      name: listName.trim(),
      prompt: prompt.trim() || undefined,
      cadence,
      cadenceInterval,
      companies: [],
      movementDefinitions: allMovements.length > 0 ? allMovements : undefined,
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
              <DialogTitle>Configure Company Signals</DialogTitle>
              <DialogDescription>
                Select predefined signals or define custom ones using AI.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              {/* Signal Groups */}
              {COMPANY_SIGNAL_GROUPS.map((group) => (
                <div key={group.id} className="space-y-2">
                  <h4 className={cn("text-sm font-semibold", group.color)}>
                    {group.label}
                  </h4>
                  <div className="grid gap-2">
                    {group.signals.map((signal) => {
                      const isSelected = selectedSignals.has(signal.key);
                      return (
                        <label
                          key={signal.key}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-secondary/20"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSignal(signal.key)}
                            disabled={isBusy}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{signal.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {signal.description}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* AI Custom Prompt */}
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <h4 className="text-sm font-semibold text-purple-400">
                    Custom AI Signals (Optional)
                  </h4>
                </div>
                <div className="grid gap-2">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Companies that post about sustainability 5+ times per month..."
                    rows={3}
                    className="flex w-full rounded-base border-2 border-border bg-main px-3 py-2 text-sm text-main-foreground placeholder:text-main-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    disabled={isBusy}
                  />
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={handleProcessPrompt}
                    disabled={!prompt.trim() || isBusy}
                  >
                    {processPrompt.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" /> Generate AI Signals</>
                    )}
                  </Button>
                </div>
              </div>

              {/* AI-generated movements display */}
              {aiMovements.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-purple-400">
                      AI-Generated Signals ({aiMovements.length})
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAiMovements([])}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiMovements.map((m) => (
                      <Badge key={m.name} variant="neutral" className="text-xs">
                        {m.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-400 p-2 rounded bg-red-500/10 border border-red-500/20">
                  {error}
                </p>
              )}

              {/* Summary */}
              {allMovements.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
                  <Badge variant="default" className="text-xs">
                    {allMovements.length} signal{allMovements.length !== 1 ? 's' : ''} selected
                  </Badge>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-3 sm:gap-3">
              <Button
                variant="neutral"
                onClick={() => { setStep(1); setAiMovements([]); setError(''); }}
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
