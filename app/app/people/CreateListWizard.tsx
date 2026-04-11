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
import { SIGNAL_GROUPS, type ProfileSignal } from "@/lib/movements";
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
  const [selectedSignals, setSelectedSignals] = useState<Set<ProfileSignal>>(new Set());
  const [aiMovements, setAiMovements] = useState<MovementDefinition[]>([]);
  const [cadence, setCadence] = useState<"MANUAL" | "DAILY" | "WEEKLY" | "MONTHLY">("DAILY");
  const [cadenceInterval, setCadenceInterval] = useState(10);
  const [error, setError] = useState('');

  const processPrompt = trpc.prompts.processForPeopleList.useMutation({
    onSuccess: (data) => {
      setAiMovements(data.movements);
      setError('');
    },
    onError: (err) => {
      setError(err.message);
      setAiMovements([]);
    },
  });

  const createList = trpc.peopleLists.create.useMutation({
    onSuccess: (data) => {
      utils.peopleLists.getAll.invalidate();
      handleClose();
      router.push(`/app/people/${data.list.id}`);
    },
    onError: (err) => {
      setError(`Error creating list: ${err.message}`);
    },
  });

  // Merge selected signals + AI-generated movements, deduped by name
  const allMovements: MovementDefinition[] = [
    ...Array.from(selectedSignals).map((key) => {
      const def = SIGNAL_GROUPS.flatMap((g) => g.signals).find((s) => s.key === key)!;
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

  function toggleSignal(key: ProfileSignal) {
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
    setAiMovements([]);
    processPrompt.mutate({ prompt: prompt.trim() });
  }

  function removeMovement(name: string) {
    // Remove from selected signals if it's one
    setSelectedSignals((prev) => {
      const next = new Set(prev);
      next.delete(name as ProfileSignal);
      return next;
    });
    // Remove from AI movements
    setAiMovements((prev) => prev.filter((m) => m.name !== name));
  }

  function handleCreate() {
    if (allMovements.length === 0) return;
    createList.mutate({
      name: listName.trim(),
      prompt: prompt.trim(),
      movementDefinitions: allMovements,
      cadence,
      cadenceInterval,
      profiles: [],
    });
  }

  const isBusy = processPrompt.isPending || createList.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => { if (!isBusy) { if (!v) handleClose(); else onOpenChange(v); } }}
    >
      <DialogContent className="w-[90vw] max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400 font-medium">Step {step} of 3</span>
          <div className="flex gap-1">
            <div className={`h-1 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-gray-700'}`} />
            <div className={`h-1 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-gray-700'}`} />
            <div className={`h-1 w-8 rounded-full transition-colors ${step >= 3 ? 'bg-primary' : 'bg-gray-700'}`} />
          </div>
        </div>

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Create New People List</DialogTitle>
              <DialogDescription>
                Enter a name for your new people tracking list.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="listName">List Name</Label>
                <Input
                  id="listName"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="e.g., LinkedIn Leads"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleNext(); }}
                />
              </div>
            </div>

            <DialogFooter className="flex gap-3 sm:gap-3">
              <Button variant="neutral" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleNext} disabled={!listName.trim()}>Next</Button>
            </DialogFooter>
          </>
        )}

        {/* ── Step 2: Signals + Prompt ── */}
        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Configure Signals</DialogTitle>
              <DialogDescription>
                Select the signals you want to track, then optionally describe your list to let AI generate additional ones.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-dark-200/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-600">
              {/* Signal checkbox cards */}
              {SIGNAL_GROUPS.map((group) => (
                <div key={group.id} className="grid gap-3">
                  <p className={cn("text-xs font-semibold uppercase tracking-wider", group.color)}>
                    {group.label}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.signals.map((signal) => {
                      const checked = selectedSignals.has(signal.key);
                      return (
                        <label
                          key={signal.key}
                          className={cn(
                            "flex items-start gap-3 rounded-lg border-2 px-3 py-3 cursor-pointer transition-colors",
                            checked
                              ? "border-primary bg-primary/5"
                              : "border-border bg-transparent hover:bg-secondary/30",
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleSignal(signal.key)}
                            disabled={isBusy}
                            className="mt-0.5 shrink-0"
                          />
                          <div className="grid gap-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-foreground">
                                {signal.label}
                              </span>
                              <Badge variant="neutral" className="font-mono text-[10px]">
                                {signal.key}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                              {signal.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or describe your list for AI suggestions</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Prompt */}
              <div className="grid gap-2">
                <Label htmlFor="prompt">Prompt</Label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Founders who've been promoted and started posting about AI tech multiple times a day..."
                  rows={3}
                  className="flex w-full rounded-base border-2 border-border bg-main px-3 py-2 text-sm text-main-foreground placeholder:text-main-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  disabled={isBusy}
                />
              </div>

              <Button
                variant="noShadow"
                onClick={handleProcessPrompt}
                disabled={!prompt.trim() || isBusy}
                className="w-fit"
              >
                {processPrompt.isPending
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Sparkles className="mr-2 h-4 w-4" />
                }
                {aiMovements.length > 0 ? 'Re-generate signals' : 'Generate signals'}
              </Button>

              {error && <p className="text-sm text-red-400">{error}</p>}

              {/* All movements (selected + AI-generated) */}
              {allMovements.length > 0 && (
                <div className="grid gap-2">
                  <p className="text-xs text-muted-foreground">
                    {allMovements.length} signal{allMovements.length !== 1 ? 's' : ''} selected — click × to remove
                  </p>
                  <div className="grid gap-2">
                    {allMovements.map((m) => {
                      const isManual = selectedSignals.has(m.name as ProfileSignal);
                      return (
                        <div
                          key={m.name}
                          className="flex items-start justify-between gap-3 rounded-lg border border-border bg-secondary/20 px-3 py-2"
                        >
                          <div className="grid gap-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="neutral" className="font-mono text-[10px]">
                                {m.name}
                              </Badge>
                              {isManual && (
                                <span className="text-[10px] text-muted-foreground">manual</span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground leading-relaxed">
                              {m.description}
                            </span>
                          </div>
                          <button
                            onClick={() => removeMovement(m.name)}
                            disabled={isBusy}
                            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40 mt-0.5"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
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
              <Button
                onClick={() => setStep(3)}
                disabled={allMovements.length === 0 || isBusy}
              >
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
                Choose how often to check for movements and enrichments.
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
                    {cadence === "DAILY" && cadenceInterval === 1 && "Profiles will be enriched daily."}
                    {cadence === "DAILY" && cadenceInterval > 1 && `Profiles will be enriched every ${cadenceInterval} days.`}
                    {cadence === "WEEKLY" && cadenceInterval === 1 && "Profiles will be enriched weekly."}
                    {cadence === "WEEKLY" && cadenceInterval > 1 && `Profiles will be enriched every ${cadenceInterval} weeks.`}
                    {cadence === "MONTHLY" && cadenceInterval === 1 && "Profiles will be enriched monthly."}
                    {cadence === "MONTHLY" && cadenceInterval > 1 && `Profiles will be enriched every ${cadenceInterval} months.`}
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
                onClick={() => { setStep(2); setError(''); }}
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
