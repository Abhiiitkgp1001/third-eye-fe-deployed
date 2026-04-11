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
import { Loader2, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";

interface CreateListWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateListWizard({ open, onOpenChange }: CreateListWizardProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [step, setStep] = useState<1 | 2>(1);
  const [listName, setListName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [promptResult, setPromptResult] = useState<{ min: number; max: number } | null>(null);
  const [promptError, setPromptError] = useState('');

  const processPrompt = trpc.prompts.processForCompanyList.useMutation({
    onSuccess: (data) => {
      setPromptResult(data);
      setPromptError('');
    },
    onError: (error) => {
      setPromptError(error.message);
      setPromptResult(null);
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
      setPromptResult(null);
      setPromptError('');
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
    if (!promptResult) return;
    createList.mutate({
      name: listName.trim(),
      prompt: prompt.trim(),
      min: promptResult.min,
      max: promptResult.max,
      companies: [],
    });
  }

  const isBusy = processPrompt.isPending || createList.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isBusy) { if (!v) handleClose(); else onOpenChange(v); } }}>
      <DialogContent className="sm:max-w-md">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400 font-medium">Step {step} of 2</span>
          <div className="flex gap-1">
            <div className={`h-1 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-gray-700'}`} />
            <div className={`h-1 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-gray-700'}`} />
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
              <DialogTitle>Describe Your List</DialogTitle>
              <DialogDescription>
                Describe what kind of companies you want to track. We'll determine the movement types automatically.
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

              {promptError && (
                <p className="text-sm text-red-400">{promptError}</p>
              )}

              {promptResult && (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                  <span className="text-sm text-green-300">
                    Movement types: <strong>{promptResult.min}</strong> – <strong>{promptResult.max}</strong>
                  </span>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-3 sm:gap-3">
              <Button
                variant="neutral"
                onClick={() => { setStep(1); setPromptResult(null); setPromptError(''); }}
                disabled={isBusy}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {!promptResult ? (
                <Button
                  onClick={handleProcessPrompt}
                  disabled={!prompt.trim() || processPrompt.isPending}
                >
                  {processPrompt.isPending
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <Sparkles className="mr-2 h-4 w-4" />
                  }
                  Process Prompt
                </Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  disabled={createList.isPending}
                >
                  {createList.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create List
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
