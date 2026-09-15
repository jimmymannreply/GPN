export interface UseCaseCandidate {
  id: string;
  title: string;
  summary: string;
  valueScore: number;
  feasibilityScore: number;
  riskScore: number;
  tags: string[];
}

const retailCases: UseCaseCandidate[] = [
  {
    id: "ret-1",
    title: "Store associate copilot",
    summary: "Hands-free answers on inventory, promos, and returns at the register.",
    valueScore: 88,
    feasibilityScore: 82,
    riskScore: 22,
    tags: ["CX", "frontline"],
  },
  {
    id: "ret-2",
    title: "Demand sensing from POS + web",
    summary: "Blend e‑commerce and store signals to cut stockouts on hero SKUs.",
    valueScore: 91,
    feasibilityScore: 74,
    riskScore: 35,
    tags: ["supply chain"],
  },
  {
    id: "ret-3",
    title: "Vendor claims automation",
    summary: "Extract and reconcile co‑op invoices from email and PDF attachments.",
    valueScore: 79,
    feasibilityScore: 86,
    riskScore: 18,
    tags: ["finance"],
  },
  {
    id: "ret-4",
    title: "Personalized outbound campaigns",
    summary: "Generate segment‑specific offers from loyalty and browse history.",
    valueScore: 85,
    feasibilityScore: 78,
    riskScore: 28,
    tags: ["marketing"],
  },
  {
    id: "ret-5",
    title: "Workforce scheduling assistant",
    summary: "Draft shift plans from footfall forecasts and absence patterns.",
    valueScore: 72,
    feasibilityScore: 80,
    riskScore: 24,
    tags: ["operations"],
  },
  {
    id: "ret-6",
    title: "Contact center summarization",
    summary: "Auto‑summarize calls and route follow‑ups to the right queue.",
    valueScore: 83,
    feasibilityScore: 88,
    riskScore: 20,
    tags: ["CX"],
  },
  {
    id: "ret-7",
    title: "Planogram compliance vision",
    summary: "Photo audit of endcaps against approved layouts.",
    valueScore: 77,
    feasibilityScore: 65,
    riskScore: 42,
    tags: ["store ops"],
  },
  {
    id: "ret-8",
    title: "Shrink and fraud triage",
    summary: "Rank exception reports and surface explainable loss drivers.",
    valueScore: 86,
    feasibilityScore: 70,
    riskScore: 38,
    tags: ["risk"],
  },
  {
    id: "ret-9",
    title: "Supplier onboarding Q&A",
    summary: "Answer vendor policy questions from a governed knowledge base.",
    valueScore: 68,
    feasibilityScore: 90,
    riskScore: 15,
    tags: ["procurement"],
  },
  {
    id: "ret-10",
    title: "Executive narrative generator",
    summary: "Weekly board‑ready story on margin, traffic, and digital mix.",
    valueScore: 90,
    feasibilityScore: 76,
    riskScore: 30,
    tags: ["CXO"],
  },
];

const manufacturingCases: UseCaseCandidate[] = [
  {
    id: "mfg-1",
    title: "Predictive maintenance briefings",
    summary: "Turn sensor telemetry into shift‑ready work orders.",
    valueScore: 92,
    feasibilityScore: 71,
    riskScore: 36,
    tags: ["plant"],
  },
  {
    id: "mfg-2",
    title: "Quality escape root cause",
    summary: "Correlate lot data, SOPs, and operator notes after a defect spike.",
    valueScore: 87,
    feasibilityScore: 68,
    riskScore: 40,
    tags: ["quality"],
  },
  {
    id: "mfg-3",
    title: "RFQ response accelerator",
    summary: "Draft compliant quotes from historical BOMs and capacity.",
    valueScore: 84,
    feasibilityScore: 75,
    riskScore: 28,
    tags: ["sales"],
  },
  {
    id: "mfg-4",
    title: "Safety incident reporting",
    summary: "Voice capture on the floor with automatic OSHA‑aligned narratives.",
    valueScore: 78,
    feasibilityScore: 82,
    riskScore: 22,
    tags: ["EHS"],
  },
  {
    id: "mfg-5",
    title: "Supplier risk monitor",
    summary: "Watch lead times, geopolitical news, and alternate sourcing.",
    valueScore: 80,
    feasibilityScore: 72,
    riskScore: 33,
    tags: ["supply chain"],
  },
  {
    id: "mfg-6",
    title: "Engineering change assistant",
    summary: "Summarize ECO packets and flag cross‑plant impacts.",
    valueScore: 76,
    feasibilityScore: 79,
    riskScore: 26,
    tags: ["engineering"],
  },
  {
    id: "mfg-7",
    title: "Field service copilot",
    summary: "Guided troubleshooting from manuals and prior fix history.",
    valueScore: 89,
    feasibilityScore: 77,
    riskScore: 25,
    tags: ["service"],
  },
  {
    id: "mfg-8",
    title: "Energy optimization coach",
    summary: "Recommend load shifts using tariff and production schedules.",
    valueScore: 74,
    feasibilityScore: 70,
    riskScore: 30,
    tags: ["sustainability"],
  },
  {
    id: "mfg-9",
    title: "Training path generator",
    summary: "Role‑based micro‑learning from SOP updates.",
    valueScore: 70,
    feasibilityScore: 88,
    riskScore: 18,
    tags: ["HR"],
  },
  {
    id: "mfg-10",
    title: "CXO operations narrative",
    summary: "Monthly story on OEE, backlog, and working capital.",
    valueScore: 88,
    feasibilityScore: 73,
    riskScore: 32,
    tags: ["CXO"],
  },
];

const healthcareCases: UseCaseCandidate[] = [
  {
    id: "hc-1",
    title: "Prior authorization prep",
    summary: "Assemble payer‑specific packets from clinical notes.",
    valueScore: 90,
    feasibilityScore: 69,
    riskScore: 44,
    tags: ["revenue cycle"],
  },
  {
    id: "hc-2",
    title: "Care team handoff brief",
    summary: "Structured summaries at shift change with cited sources.",
    valueScore: 86,
    feasibilityScore: 76,
    riskScore: 38,
    tags: ["clinical"],
  },
  {
    id: "hc-3",
    title: "Patient intake assistant",
    summary: "Multilingual intake with routing to the right service line.",
    valueScore: 82,
    feasibilityScore: 80,
    riskScore: 35,
    tags: ["access"],
  },
  {
    id: "hc-4",
    title: "Policy & compliance Q&A",
    summary: "Governed answers on HIPAA workflows for staff.",
    valueScore: 75,
    feasibilityScore: 85,
    riskScore: 30,
    tags: ["compliance"],
  },
  {
    id: "hc-5",
    title: "Denial management insights",
    summary: "Cluster denial codes and recommend appeal language.",
    valueScore: 88,
    feasibilityScore: 72,
    riskScore: 36,
    tags: ["finance"],
  },
  {
    id: "hc-6",
    title: "Clinical trial matching",
    summary: "Screen eligible patients against open protocols.",
    valueScore: 84,
    feasibilityScore: 64,
    riskScore: 48,
    tags: ["research"],
  },
  {
    id: "hc-7",
    title: "Facilities work order triage",
    summary: "Classify tickets and suggest vendor dispatch.",
    valueScore: 71,
    feasibilityScore: 87,
    riskScore: 20,
    tags: ["operations"],
  },
  {
    id: "hc-8",
    title: "Executive quality narrative",
    summary: "Board‑ready readout on safety, throughput, and margin.",
    valueScore: 91,
    feasibilityScore: 70,
    riskScore: 40,
    tags: ["CXO"],
  },
  {
    id: "hc-9",
    title: "Referral loop coordinator",
    summary: "Track specialist referrals and close the loop with PCPs.",
    valueScore: 79,
    feasibilityScore: 78,
    riskScore: 32,
    tags: ["care coordination"],
  },
  {
    id: "hc-10",
    title: "Medical device inventory agent",
    summary: "Predict par levels and automate replenishment requests.",
    valueScore: 77,
    feasibilityScore: 74,
    riskScore: 28,
    tags: ["supply chain"],
  },
];

import { resolveVerticalFromIntake } from "@/hackathon/data/intakeUseCaseGenerator";

export type IndustryKey =
  | "retail"
  | "manufacturing"
  | "healthcare"
  | "financial"
  | "technology"
  | "public_sector"
  | "energy";

export function resolveIndustryKey(
  industryStack: string,
  painPoint: string,
  cxoOutcome: string
): IndustryKey {
  return resolveVerticalFromIntake({
    customerName: "",
    industryStack,
    painPoint,
    cxoOutcome,
  });
}

export function industryLabel(key: IndustryKey): string {
  const labels: Record<IndustryKey, string> = {
    retail: "Retail & consumer",
    manufacturing: "Manufacturing & industrial",
    healthcare: "Healthcare & life sciences",
    financial: "Financial services",
    technology: "Technology & software",
    public_sector: "Public sector & education",
    energy: "Energy & utilities",
  };
  return labels[key];
}

export function getIndustryCases(industry: string): UseCaseCandidate[] {
  const key = resolveIndustryKey(industry, "", "");
  if (key === "healthcare") return healthcareCases;
  if (key === "manufacturing") return manufacturingCases;
  return retailCases;
}

export interface IntakeTailoring {
  customerName: string;
  industryStack: string;
  painPoint: string;
  cxoOutcome: string;
}

export function compositeScore(c: UseCaseCandidate): number {
  return Math.round(c.valueScore * 0.5 + c.feasibilityScore * 0.35 - c.riskScore * 0.15);
}

export function rankCases(cases: UseCaseCandidate[]): UseCaseCandidate[] {
  return [...cases].sort((a, b) => compositeScore(b) - compositeScore(a));
}

export function buildSnakeOrder(participantCount: number, rounds: number): number[] {
  if (participantCount < 1) return [];
  const order: number[] = [];
  for (let r = 0; r < rounds; r++) {
    const forward = r % 2 === 0;
    const indices = forward
      ? Array.from({ length: participantCount }, (_, i) => i)
      : Array.from({ length: participantCount }, (_, i) => participantCount - 1 - i);
    order.push(...indices);
  }
  return order;
}
