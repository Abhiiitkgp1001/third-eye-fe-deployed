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

export type ProfileActivitySignal =
  | "PORTFOLIO_COMPANY_ENDORSED"
  | "FUNDING_ANNOUNCEMENT_ENGAGED"
  | "BATCH_COMPANY_CONGRATULATED"
  | "PRODUCT_LAUNCH_AMPLIFIED"
  | "SELF_PROMOTION_ACTIVE"
  | "MILESTONE_ACKNOWLEDGED"
  | "STARTUP_ADVICE_GIVEN"
  | "ACQUISITION_INTEREST";

export type ProfileSignal = ProfileCoreSignal | ProfileFieldSignal | ProfileActivitySignal;

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
  {
    id: "activity",
    label: "Activity Signals",
    color: "text-blue-400",
    signals: [
      {
        key: "PORTFOLIO_COMPANY_ENDORSED",
        label: "Portfolio Company Endorsed",
        description: "Liked a YC batch company's post.",
      },
      {
        key: "FUNDING_ANNOUNCEMENT_ENGAGED",
        label: "Funding Announcement Engaged",
        description: "Engaged with a funding round post.",
      },
      {
        key: "BATCH_COMPANY_CONGRATULATED",
        label: "Batch Company Congratulated",
        description: "Commented congrats on a portfolio company milestone.",
      },
      {
        key: "PRODUCT_LAUNCH_AMPLIFIED",
        label: "Product Launch Amplified",
        description: "Liked or shared a product launch post.",
      },
      {
        key: "SELF_PROMOTION_ACTIVE",
        label: "Self Promotion Active",
        description: "Commented with own fund or company links.",
      },
      {
        key: "MILESTONE_ACKNOWLEDGED",
        label: "Milestone Acknowledged",
        description: "Liked a revenue or growth milestone post.",
      },
      {
        key: "STARTUP_ADVICE_GIVEN",
        label: "Startup Advice Given",
        description: "Gave substantive founder advice in comments.",
      },
      {
        key: "ACQUISITION_INTEREST",
        label: "Acquisition Interest",
        description: "Engaged with M&A news.",
      },
    ],
  },
];
