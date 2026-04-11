// Company-focused signals for tracking business changes and growth indicators

export type CompanyCoreSignal =
  | "HEADCOUNT_GROWTH"
  | "HEADCOUNT_DECLINE"
  | "HIRING_GTM_SURGE"
  | "HIRING_ENGINEERING_SURGE"
  | "SENIOR_HIRING_MIX"
  | "GEO_EXPANSION_SIGNAL"
  | "COMPANY_PAGE_FOLLOWER_GROWTH";

export type CompanyMediumSignal =
  | "NEW_CLEVEL_HIRE"
  | "NEW_VP_HIRE"
  | "JOB_CHANGE_CHAMPION"
  | "JOB_CHANGE_BUYER_JOINED"
  | "ROLE_TITLE_EVOLUTION"
  | "SKILL_CONCENTRATION"
  | "SKILL_GAP_DETECTED"
  | "POSTING_CADENCE_INCREASE";

export type CompanySignal = CompanyCoreSignal | CompanyMediumSignal;

// ── Rich metadata for UI display ──────────────────────────────────────────────

export interface SignalDef {
  key: CompanySignal;
  label: string;
  description: string;
}

export interface SignalGroup {
  id: string;
  label: string;
  color: string; // tailwind text color for the group label
  signals: SignalDef[];
}

export const COMPANY_SIGNAL_GROUPS: SignalGroup[] = [
  {
    id: "core",
    label: "Core Growth Signals",
    color: "text-blue-400",
    signals: [
      {
        key: "HEADCOUNT_GROWTH",
        label: "Headcount Growth",
        description: "Company headcount increased by 10%+ or 5+ absolute employees.",
      },
      {
        key: "HEADCOUNT_DECLINE",
        label: "Headcount Decline",
        description: "Company headcount decreased by 10%+ or 5+ absolute employees.",
      },
      {
        key: "HIRING_GTM_SURGE",
        label: "GTM Hiring Surge",
        description: "5+ sales/marketing roles posted, indicating GTM expansion.",
      },
      {
        key: "HIRING_ENGINEERING_SURGE",
        label: "Engineering Hiring Surge",
        description: "Engineering hiring spike suggests product development acceleration.",
      },
      {
        key: "SENIOR_HIRING_MIX",
        label: "Senior Hiring Pattern",
        description: "VP/Director-heavy job postings indicate strategic expansion.",
      },
      {
        key: "GEO_EXPANSION_SIGNAL",
        label: "Geographic Expansion",
        description: "New city appearing in job postings suggests market expansion.",
      },
      {
        key: "COMPANY_PAGE_FOLLOWER_GROWTH",
        label: "Follower Growth",
        description: "LinkedIn page follower growth indicates rising brand awareness.",
      },
    ],
  },
  {
    id: "executive",
    label: "Executive & Leadership Signals",
    color: "text-purple-400",
    signals: [
      {
        key: "NEW_CLEVEL_HIRE",
        label: "New C-Level Hire",
        description: "New C-suite joined - indicates new vendor decisions and priorities.",
      },
      {
        key: "NEW_VP_HIRE",
        label: "New VP Hire",
        description: "New VP Sales/CTO/CRO joined - signals new budget priorities.",
      },
      {
        key: "JOB_CHANGE_CHAMPION",
        label: "Champion Joined",
        description: "Known buyer moved to this company from another account.",
      },
      {
        key: "JOB_CHANGE_BUYER_JOINED",
        label: "Economic Buyer Joined",
        description: "New economic buyer joined this target account.",
      },
    ],
  },
  {
    id: "strategic",
    label: "Strategic Signals",
    color: "text-green-400",
    signals: [
      {
        key: "ROLE_TITLE_EVOLUTION",
        label: "Role Title Evolution",
        description: "New strategic titles appearing - indicates organizational evolution.",
      },
      {
        key: "SKILL_CONCENTRATION",
        label: "Skill Concentration",
        description: "Dominant skill cluster detected - inferred tech stack insights.",
      },
      {
        key: "SKILL_GAP_DETECTED",
        label: "Skill Gap Detected",
        description: "Missing modern-stack skills - vendor opportunity identified.",
      },
      {
        key: "POSTING_CADENCE_INCREASE",
        label: "Posting Activity Increase",
        description: "Sudden uptick in company LinkedIn posts suggests increased activity.",
      },
    ],
  },
];
