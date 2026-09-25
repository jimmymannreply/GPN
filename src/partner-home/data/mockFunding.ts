export type FundingStatus = "Draft" | "Ready to submit" | "Submitted";

export interface MockFundingClaim {
  id: string;
  customer: string;
  useCase: string;
  annualValueLabel: string;
  format: "Value sprint" | "Ghost ledger";
  partnerSponsor: string;
  notes: { who: string; text: string }[];
  status: FundingStatus;
}

export const DEFAULT_FUNDING_CLAIM: MockFundingClaim = {
  id: "heartland-2026-09",
  customer: "Heartland Mutual Insurance",
  useCase: "AI-assisted claims intake extraction",
  annualValueLabel: "$7,750,000 / year",
  format: "Value sprint",
  partnerSponsor: "Tom Brennan · CDW AI & Data Practice Lead",
  status: "Draft",
  notes: [
    { who: "Michelle Dorsey", text: "Intake sits six days, mostly manual PDF reading." },
    { who: "Dana Reyes", text: "We handled Q1 volume by paying overtime, not by hiring." },
  ],
};

export const FUNDING_STATUS_ORDER: FundingStatus[] = ["Draft", "Ready to submit", "Submitted"];

export function nextFundingStatus(current: FundingStatus): FundingStatus {
  const idx = FUNDING_STATUS_ORDER.indexOf(current);
  if (idx < 0 || idx >= FUNDING_STATUS_ORDER.length - 1) return current;
  return FUNDING_STATUS_ORDER[idx + 1];
}
