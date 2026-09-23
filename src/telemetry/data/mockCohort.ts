export type SessionFormat = "Value sprint" | "Ghost ledger";
export type SessionOutcome = "Pilot proposed" | "Run" | "Pilot funded" | "Scoped";
export type Qualification = "—" | "Qualified" | "Not qualified";
export type WhoRan = "Facilitated" | "Self-service";

export interface PartnerBar {
  partner: string;
  sessions: number;
}

export interface PatternBar {
  pattern: string;
  funded: number;
  total: number;
}

export interface FormatBar {
  format: SessionFormat;
  funded: number;
  total: number;
}

export interface FunnelStep {
  label: string;
  count: number;
}

export interface RecentSession {
  partner: string;
  industry: string;
  pattern: string;
  whoRan: WhoRan;
  format: SessionFormat;
  qualification: Qualification;
  outcome: SessionOutcome;
  quarter: string;
  liveOverlay?: boolean;
}

export const PCM_PERSONA = {
  name: "Priya Raghavan",
  title: "Partner Channel Manager",
};

export const TELEMETRY_KPIS = {
  sessionsRun: 239,
  pilotsProposed: 136,
  pilotsFunded: 112,
  fundedPilotValueLabel: "$45.1M",
  cohortNote: "My partners' cohort · 251 scoped sessions over eight quarters · live Heartland overlay shown separately.",
};

export const SESSIONS_BY_PARTNER: PartnerBar[] = [
  { partner: "CDW", sessions: 83 },
  { partner: "SoftwareOne", sessions: 83 },
  { partner: "Insight", sessions: 82 },
  { partner: "SHI", sessions: 82 },
  { partner: "Softchoice", sessions: 1 },
];

export const SESSIONS_BY_PATTERN: PatternBar[] = [
  { pattern: "Document-heavy intake", funded: 26, total: 62 },
  { pattern: "Contact-centre summarisation", funded: 27, total: 62 },
  { pattern: "Knowledge retrieval", funded: 28, total: 63 },
  { pattern: "Fraud triage", funded: 29, total: 64 },
];

export const SESSIONS_BY_FORMAT: FormatBar[] = [
  { format: "Value sprint", funded: 82, total: 208 },
  { format: "Ghost ledger", funded: 30, total: 46 },
];

export const FUNNEL: FunnelStep[] = [
  { label: "Scoped", count: 251 },
  { label: "Run", count: 239 },
  { label: "Pilot proposed", count: 136 },
  { label: "Pilot funded", count: 112 },
];

export const RECENT_SESSIONS: RecentSession[] = [
  {
    partner: "Softchoice",
    industry: "Insurance",
    pattern: "Fraud triage",
    whoRan: "Facilitated",
    format: "Value sprint",
    qualification: "—",
    outcome: "Pilot proposed",
    quarter: "Q3 2026",
    liveOverlay: true,
  },
  {
    partner: "Softchoice",
    industry: "Insurance",
    pattern: "Fraud triage",
    whoRan: "Facilitated",
    format: "Ghost ledger",
    qualification: "—",
    outcome: "Run",
    quarter: "Q3 2026",
    liveOverlay: true,
  },
  {
    partner: "SoftwareOne",
    industry: "Banking",
    pattern: "Contact-centre summarisation",
    whoRan: "Self-service",
    format: "Value sprint",
    qualification: "Qualified",
    outcome: "Pilot proposed",
    quarter: "Q4 2025",
  },
  {
    partner: "CDW",
    industry: "Healthcare",
    pattern: "Document-heavy intake",
    whoRan: "Facilitated",
    format: "Value sprint",
    qualification: "Qualified",
    outcome: "Pilot proposed",
    quarter: "Q1 2026",
  },
  {
    partner: "Insight",
    industry: "Manufacturing",
    pattern: "Knowledge retrieval",
    whoRan: "Self-service",
    format: "Ghost ledger",
    qualification: "Not qualified",
    outcome: "Run",
    quarter: "Q4 2024",
  },
  {
    partner: "SHI",
    industry: "Insurance",
    pattern: "Fraud triage",
    whoRan: "Facilitated",
    format: "Value sprint",
    qualification: "Qualified",
    outcome: "Pilot proposed",
    quarter: "Q2 2026",
  },
  {
    partner: "SoftwareOne",
    industry: "Healthcare",
    pattern: "Document-heavy intake",
    whoRan: "Facilitated",
    format: "Ghost ledger",
    qualification: "Qualified",
    outcome: "Run",
    quarter: "Q3 2026",
  },
  {
    partner: "CDW",
    industry: "Banking",
    pattern: "Knowledge retrieval",
    whoRan: "Self-service",
    format: "Value sprint",
    qualification: "—",
    outcome: "Pilot proposed",
    quarter: "Q1 2026",
  },
];
