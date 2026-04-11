// Copied from shiv/src/lib/movements.ts — people-list signals only.
// ProfilePostSignal is excluded (all variants are 💤 unused in the BE).

export type ProfileCoreSignal =
  | "JOB_CHANGED"
  | "PROMOTED"
  | "NEW_CLEVEL_JOINED"
  | "NEW_VP_JOINED"
  | "CHAMPION_AT_NEW_ACCOUNT";

export type ProfileFieldSignal =
  | "EMPLOYER_LEFT"
  | "HEADLINE_CHANGED"
  | "LOCATION_CHANGED"
  | "SKILLS_CHANGED"
  | "SUMMARY_CHANGED";

export type ProfileSignal = ProfileCoreSignal | ProfileFieldSignal;

// ── Rich metadata for UI display ──────────────────────────────────────────────

export interface SignalDef {
  key: ProfileSignal;
  label: string;
  description: string;
}

export interface SignalGroup {
  id: string;
  label: string;
  color: string; // tailwind text color for the group label
  signals: SignalDef[];
}

export const SIGNAL_GROUPS: SignalGroup[] = [
  {
    id: "core",
    label: "Core Signals",
    color: "text-red-400",
    signals: [
      {
        key: "JOB_CHANGED",
        label: "Job Changed",
        description: "Person moved to a new company.",
      },
      {
        key: "PROMOTED",
        label: "Promoted",
        description: "Title changed upward at the same company.",
      },
      {
        key: "NEW_CLEVEL_JOINED",
        label: "New C-Level Joined",
        description: "Person joined a tracked company as C-suite.",
      },
      {
        key: "NEW_VP_JOINED",
        label: "New VP Joined",
        description: "Person joined a tracked company as VP.",
      },
      {
        key: "CHAMPION_AT_NEW_ACCOUNT",
        label: "Champion at New Account",
        description: "Known buyer moved to a new target account.",
      },
    ],
  },
  {
    id: "field",
    label: "Field Signals",
    color: "text-yellow-400",
    signals: [
      {
        key: "EMPLOYER_LEFT",
        label: "Employer Left",
        description: "Position removed with no new position added — went dark.",
      },
      {
        key: "HEADLINE_CHANGED",
        label: "Headline Changed",
        description: "Professional tagline changed.",
      },
      {
        key: "LOCATION_CHANGED",
        label: "Location Changed",
        description: "Geographic location changed.",
      },
      {
        key: "SKILLS_CHANGED",
        label: "Skills Changed",
        description: "Skills added or removed from profile.",
      },
      {
        key: "SUMMARY_CHANGED",
        label: "Summary Changed",
        description: "About / bio section changed.",
      },
    ],
  },
];
