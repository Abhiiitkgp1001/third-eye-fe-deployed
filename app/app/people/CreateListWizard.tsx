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
import { Loader2, ArrowLeft, Sparkles, X } from "lucide-react";

interface MovementDefinition {
  name: string;
  description: string;
}

interface CreateListWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toReadableLabel(name: string): string {
  return name
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function CreateListWizard({ open, onOpenChange }: CreateListWizardProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [step, setStep] = useState<1 | 2>(1);
  const [listName, setListName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [movements, setMovements] = useState<MovementDefinition[]>([]);
  const [error, setError] = useState('');

  const processPrompt = trpc.prompts.processForPeopleList.useMutation({
    onSuccess: (data) => {
      setMovements(data.movements);
      setError('');
    },
    onError: (err) => {
      setError(err.message);
      setMovements([]);
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

  function handleClose() {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setListName('');
      setPrompt('');
      setMovements([]);
      setError('');
    }, 200);
  }

  function handleNext() {
    if (listName.trim()) setStep(2);
  }

  function handleProcessPrompt() {
    if (!prompt.trim()) return;
    setError('');
    setMovements([]);
    processPrompt.mutate({ prompt: prompt.trim() });
  }

  function removeMovement(name: string) {
    setMovements((prev) => prev.filter((m) => m.name !== name));
  }

  function handleCreate() {
    if (movements.length === 0) return;
    createList.mutate({
      name: listName.trim(),
      prompt: prompt.trim(),
      movementDefinitions: movements,
      profiles: [],
    });
  }

  const isBusy = processPrompt.isPending || createList.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => { if (!isBusy) { if (!v) handleClose(); else onOpenChange(v); } }}
    >
      <DialogContent className="sm:max-w-lg">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400 font-medium">Step {step} of 2</span>
          <div className="flex gap-1">
            <div className={`h-1 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-gray-700'}`} />
            <div className={`h-1 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-gray-700'}`} />
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

        {/* ── Step 2: Prompt → movement definitions ── */}
        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Describe Your List</DialogTitle>
              <DialogDescription>
                Describe who you want to track and what changes matter. We'll generate the signals automatically.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
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
                {movements.length > 0 ? 'Re-generate signals' : 'Generate signals'}
              </Button>

              {error && <p className="text-sm text-red-400">{error}</p>}

              {/* Generated movement definitions */}
              {movements.length > 0 && (
                <div className="grid gap-2">
                  <p className="text-xs text-gray-400">
                    Generated signals — click × to remove any you don't need
                  </p>
                  <div className="grid gap-2">
                    {movements.map((m) => (
                      <div
                        key={m.name}
                        className="flex items-start justify-between gap-3 rounded-lg border border-gray-700 bg-dark-200/40 px-3 py-2"
                      >
                        <div className="grid gap-0.5 min-w-0">
                          <span className="text-xs font-mono text-green-400">{m.name}</span>
                          <span className="text-xs text-gray-400 leading-relaxed">{m.description}</span>
                        </div>
                        <button
                          onClick={() => removeMovement(m.name)}
                          disabled={isBusy}
                          className="shrink-0 text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40 mt-0.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-3 sm:gap-3">
              <Button
                variant="neutral"
                onClick={() => { setStep(1); setMovements([]); setError(''); }}
                disabled={isBusy}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={movements.length === 0 || isBusy}
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
