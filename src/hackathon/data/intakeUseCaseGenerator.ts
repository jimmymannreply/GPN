import type { IndustryKey, UseCaseCandidate } from "@/hackathon/data/useCaseLibrary";
import { compositeScore } from "@/hackathon/data/useCaseLibrary";

export interface IntakeTailoring {
  customerName: string;
  industryStack: string;
  painPoint: string;
  cxoOutcome: string;
}

export interface IntakeContext {
  customer: string;
  industryPhrase: string;
  stackPhrase: string;
  pain: string;
  outcome: string;
  vertical: IndustryKey;
}

const VERTICAL_SIGNALS: Record<IndustryKey, string[]> = {
  healthcare: [
    "health",
    "hospital",
    "clinical",
    "patient",
    "payer",
    "provider",
    "medical",
    "pharma",
    "life science",
    "hipaa",
    "ehr",
    "revenue cycle",
    "care",
  ],
  manufacturing: [
    "manuf",
    "industrial",
    "factory",
    "plant",
    "production",
    "oee",
    "assembly",
    "automotive",
    "aerospace",
    "discrete",
    "process industry",
  ],
  retail: [
    "retail",
    "store",
    "commerce",
    "ecommerce",
    "e-commerce",
    "sku",
    "pos",
    "merchandis",
    "loyalty",
    "shopper",
    "grocery",
    "hospitality",
    "restaurant",
    "cpg",
    "consumer",
    "omnichannel",
  ],
  financial: [
    "financial",
    "finance",
    "bank",
    "banking",
    "insurance",
    "insurer",
    "capital",
    "lending",
    "loan",
    "mortgage",
    "payment",
    "fintech",
    "wealth",
    "asset management",
    "credit",
    "underwriting",
    "claims",
    "broker",
  ],
  technology: [
    "technology",
    "software",
    "saas",
    "platform",
    "devops",
    "engineering",
    "product",
    "cyber",
    "security",
    "data platform",
    "cloud native",
    "startup",
    "digital",
    "it services",
  ],
  public_sector: [
    "government",
    "public sector",
    "federal",
    "state",
    "local",
    "defense",
    "education",
    "university",
    "agency",
    "civic",
    "municipal",
    "nonprofit",
    "ngo",
  ],
  energy: [
    "energy",
    "utility",
    "utilities",
    "oil",
    "gas",
    "power",
    "grid",
    "renewable",
    "mining",
    "upstream",
    "downstream",
    "field service",
  ],
};

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function scoreVertical(blob: string): Record<IndustryKey, number> {
  const scores = Object.fromEntries(
    Object.keys(VERTICAL_SIGNALS).map((k) => [k, 0])
  ) as Record<IndustryKey, number>;
  for (const [key, signals] of Object.entries(VERTICAL_SIGNALS) as [IndustryKey, string[]][]) {
    for (const signal of signals) {
      if (blob.includes(signal)) scores[key] += 1;
    }
  }
  return scores;
}

export function resolveVerticalFromIntake(intake: IntakeTailoring): IndustryKey {
  const { industryPhrase } = parseIndustryStack(intake.industryStack);
  const industryBlob = industryPhrase.toLowerCase();
  const fullBlob =
    `${intake.industryStack} ${intake.painPoint} ${intake.cxoOutcome}`.toLowerCase();

  const industryScores = scoreVertical(industryBlob);
  const fullScores = scoreVertical(fullBlob);

  const keys = Object.keys(VERTICAL_SIGNALS) as IndustryKey[];
  let best: IndustryKey = "retail";
  let bestScore = -1;
  for (const key of keys) {
    const combined = industryScores[key] * 3 + fullScores[key];
    if (combined > bestScore) {
      bestScore = combined;
      best = key;
    }
  }
  if (bestScore > 0) return best;

  if (industryBlob.includes("health")) return "healthcare";
  if (industryBlob.includes("manuf") || industryBlob.includes("industrial")) {
    return "manufacturing";
  }
  if (industryBlob.includes("financ") || industryBlob.includes("bank")) return "financial";
  if (industryBlob.includes("tech") || industryBlob.includes("software")) return "technology";
  if (industryBlob.includes("gov") || industryBlob.includes("public")) return "public_sector";
  if (industryBlob.includes("energy") || industryBlob.includes("utility")) return "energy";
  return "retail";
}

export function parseIndustryStack(industryStack: string): {
  industryPhrase: string;
  stackPhrase: string;
} {
  const raw = industryStack.trim();
  if (!raw) {
    return { industryPhrase: "your industry", stackPhrase: "your core cloud stack" };
  }
  const parts = raw.split(/\s*[·|•–]\s*|\s+-\s+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 1) {
    return { industryPhrase: parts[0], stackPhrase: "M365, Google Cloud, and line-of-business apps" };
  }
  return {
    industryPhrase: parts[0],
    stackPhrase: parts.slice(1).join(" · "),
  };
}

export function buildIntakeContext(intake: IntakeTailoring): IntakeContext {
  const { industryPhrase, stackPhrase } = parseIndustryStack(intake.industryStack);
  return {
    customer: intake.customerName.trim() || "the customer",
    industryPhrase,
    stackPhrase,
    pain: intake.painPoint.trim() || "the priority pain you described",
    outcome: intake.cxoOutcome.trim() || "the executive outcome you are targeting",
    vertical: resolveVerticalFromIntake(intake),
  };
}

type Template = {
  title: (ctx: IntakeContext) => string;
  summary: (ctx: IntakeContext) => string;
  tags: string[];
  valueScore: number;
  feasibilityScore: number;
  riskScore: number;
};

function anchorTemplates(): Template[] {
  return [
    {
      title: (ctx) => `Priority: ${truncate(ctx.pain, 52)}`,
      summary: (ctx) =>
        `Primary agent workflow for ${ctx.customer} (${ctx.industryPhrase}) on ${ctx.stackPhrase} — built to resolve the pain that booked this session.`,
      tags: ["priority pain", "intake anchor"],
      valueScore: 94,
      feasibilityScore: 76,
      riskScore: 30,
    },
    {
      title: (ctx) => `Executive outcome: ${truncate(ctx.outcome, 48)}`,
      summary: (ctx) =>
        `Value narrative and pilot KPIs for ${ctx.customer}'s ${ctx.industryPhrase} leadership team, tied to: ${ctx.outcome}.`,
      tags: ["CXO", "value"],
      valueScore: 92,
      feasibilityScore: 72,
      riskScore: 32,
    },
    {
      title: (ctx) => `${ctx.stackPhrase} enablement for ${ctx.industryPhrase}`,
      summary: (ctx) =>
        `Governed copilot and automation layer across ${ctx.stackPhrase} so ${ctx.customer} can move from exploration to controlled production.`,
      tags: ["platform", "governance"],
      valueScore: 86,
      feasibilityScore: 80,
      riskScore: 26,
    },
  ];
}

const VERTICAL_TEMPLATES: Record<IndustryKey, Template[]> = {
  retail: [
    {
      title: (c) => `Store associate copilot — ${c.industryPhrase}`,
      summary: (c) =>
        `Register-ready answers on inventory, promos, and returns for ${c.customer} using ${c.stackPhrase}.`,
      tags: ["store ops", "CX"],
      valueScore: 88,
      feasibilityScore: 82,
      riskScore: 22,
    },
    {
      title: (c) => `Omnichannel demand signal — ${c.customer}`,
      summary: (c) =>
        `Blend digital and store signals for ${c.industryPhrase} to reduce stockouts on priority SKUs.`,
      tags: ["supply chain"],
      valueScore: 90,
      feasibilityScore: 74,
      riskScore: 34,
    },
    {
      title: (c) => `Loyalty & personalization — ${c.industryPhrase}`,
      summary: (c) =>
        `Segment-specific offers for ${c.industryPhrase} shoppers; supports outcome: ${truncate(c.outcome, 60)}.`,
      tags: ["marketing"],
      valueScore: 85,
      feasibilityScore: 78,
      riskScore: 28,
    },
    {
      title: (c) => `Contact center intelligence — ${c.customer}`,
      summary: (c) =>
        `Summarize and route ${c.industryPhrase} service conversations; reduces handle time on ${truncate(c.pain, 50)}.`,
      tags: ["CX"],
      valueScore: 83,
      feasibilityScore: 86,
      riskScore: 20,
    },
    {
      title: (c) => `Vendor & co-op claims — ${c.industryPhrase}`,
      summary: (c) =>
        `Extract and reconcile ${c.industryPhrase} vendor invoices from email and PDF for ${c.customer}.`,
      tags: ["finance"],
      valueScore: 79,
      feasibilityScore: 84,
      riskScore: 18,
    },
    {
      title: (c) => `Planogram / compliance vision — ${c.customer}`,
      summary: (c) =>
        `Photo audit of in-store execution for ${c.customer} ${c.industryPhrase} locations.`,
      tags: ["operations"],
      valueScore: 77,
      feasibilityScore: 66,
      riskScore: 40,
    },
    {
      title: (c) => `Shrink & exception triage — ${c.industryPhrase}`,
      summary: (c) =>
        `Rank loss exceptions with explainable drivers for ${c.industryPhrase} operations.`,
      tags: ["risk"],
      valueScore: 86,
      feasibilityScore: 70,
      riskScore: 36,
    },
  ],
  manufacturing: [
    {
      title: (c) => `Predictive maintenance briefings — ${c.industryPhrase}`,
      summary: (c) =>
        `Turn telemetry into shift-ready work orders for ${c.customer} plants on ${c.stackPhrase}.`,
      tags: ["plant"],
      valueScore: 92,
      feasibilityScore: 71,
      riskScore: 36,
    },
    {
      title: (c) => `Quality escape root-cause — ${c.customer}`,
      summary: (c) =>
        `Correlate lot data and operator notes after defects — addresses ${truncate(c.pain, 55)}.`,
      tags: ["quality"],
      valueScore: 87,
      feasibilityScore: 68,
      riskScore: 40,
    },
    {
      title: (c) => `RFQ & configure-to-order — ${c.industryPhrase}`,
      summary: (c) =>
        `Draft compliant quotes for ${c.industryPhrase} using historical BOMs and capacity.`,
      tags: ["sales"],
      valueScore: 84,
      feasibilityScore: 75,
      riskScore: 28,
    },
    {
      title: (c) => `Field service copilot — ${c.customer}`,
      summary: (c) =>
        `Guided troubleshooting from manuals and fix history for ${c.industryPhrase} technicians.`,
      tags: ["service"],
      valueScore: 89,
      feasibilityScore: 77,
      riskScore: 25,
    },
    {
      title: (c) => `Supplier risk monitor — ${c.customer}`,
      summary: (c) =>
        `Watch disruptions affecting ${c.customer} ${c.industryPhrase} supply network.`,
      tags: ["supply chain"],
      valueScore: 80,
      feasibilityScore: 72,
      riskScore: 33,
    },
    {
      title: (c) => `Engineering change (ECO) — ${c.industryPhrase}`,
      summary: (c) =>
        `Summarize change packets and flag cross-plant impacts for ${c.industryPhrase}.`,
      tags: ["engineering"],
      valueScore: 76,
      feasibilityScore: 79,
      riskScore: 26,
    },
    {
      title: (c) => `Energy & sustainability — ${c.customer}`,
      summary: (c) =>
        `Load-shift recommendations aligned to ${c.customer} production and tariff data.`,
      tags: ["sustainability"],
      valueScore: 74,
      feasibilityScore: 70,
      riskScore: 30,
    },
  ],
  healthcare: [
    {
      title: (c) => `Prior authorization prep — ${c.industryPhrase}`,
      summary: (c) =>
        `Assemble payer-specific packets for ${c.customer} from clinical notes on ${c.stackPhrase}.`,
      tags: ["revenue cycle"],
      valueScore: 90,
      feasibilityScore: 69,
      riskScore: 44,
    },
    {
      title: (c) => `Care team handoff — ${c.customer}`,
      summary: (c) =>
        `Structured shift-change summaries with citations for ${c.industryPhrase} clinicians.`,
      tags: ["clinical"],
      valueScore: 86,
      feasibilityScore: 76,
      riskScore: 38,
    },
    {
      title: (c) => `Patient access & intake — ${c.industryPhrase}`,
      summary: (c) =>
        `Multilingual intake routing for ${c.customer}; targets ${truncate(c.pain, 50)}.`,
      tags: ["access"],
      valueScore: 82,
      feasibilityScore: 80,
      riskScore: 35,
    },
    {
      title: (c) => `Denial management — ${c.customer}`,
      summary: (c) =>
        `Cluster denial codes and recommend appeals for ${c.industryPhrase} finance teams.`,
      tags: ["finance"],
      valueScore: 88,
      feasibilityScore: 72,
      riskScore: 36,
    },
    {
      title: (c) => `Policy & compliance Q&A — ${c.industryPhrase}`,
      summary: (c) =>
        `Governed staff answers for ${c.customer} ${c.industryPhrase} workflows.`,
      tags: ["compliance"],
      valueScore: 75,
      feasibilityScore: 85,
      riskScore: 30,
    },
    {
      title: (c) => `Referral loop — ${c.customer}`,
      summary: (c) =>
        `Track specialist referrals and close the loop with PCPs for ${c.industryPhrase}.`,
      tags: ["care coordination"],
      valueScore: 79,
      feasibilityScore: 78,
      riskScore: 32,
    },
    {
      title: (c) => `Executive quality narrative — ${c.industryPhrase}`,
      summary: (c) =>
        `Board-ready readout for ${c.customer} on safety, throughput, and margin — ${truncate(c.outcome, 45)}.`,
      tags: ["CXO"],
      valueScore: 91,
      feasibilityScore: 70,
      riskScore: 40,
    },
  ],
  financial: [
    {
      title: (c) => `Loan & onboarding document intake — ${c.industryPhrase}`,
      summary: (c) =>
        `Extract, validate, and route lending documents for ${c.customer} on ${c.stackPhrase}.`,
      tags: ["lending"],
      valueScore: 90,
      feasibilityScore: 74,
      riskScore: 38,
    },
    {
      title: (c) => `Fraud & AML triage — ${c.customer}`,
      summary: (c) =>
        `Prioritize alerts with explainable narratives for ${c.industryPhrase} investigators.`,
      tags: ["risk"],
      valueScore: 88,
      feasibilityScore: 70,
      riskScore: 42,
    },
    {
      title: (c) => `Regulatory exam prep — ${c.industryPhrase}`,
      summary: (c) =>
        `Assemble evidence packs for ${c.customer} ${c.industryPhrase} compliance teams.`,
      tags: ["compliance"],
      valueScore: 86,
      feasibilityScore: 72,
      riskScore: 35,
    },
    {
      title: (c) => `Claims adjudication — ${c.customer}`,
      summary: (c) =>
        `Support adjusters on ${truncate(c.pain, 55)} with governed policy retrieval.`,
      tags: ["insurance"],
      valueScore: 87,
      feasibilityScore: 68,
      riskScore: 40,
    },
    {
      title: (c) => `Wealth advisor prep — ${c.industryPhrase}`,
      summary: (c) =>
        `Client briefings and portfolio talking points for ${c.industryPhrase} advisors at ${c.customer}.`,
      tags: ["wealth"],
      valueScore: 84,
      feasibilityScore: 80,
      riskScore: 28,
    },
    {
      title: (c) => `Commercial banking insights — ${c.customer}`,
      summary: (c) =>
        `Summarize exposures and opportunities; aligns to ${truncate(c.outcome, 55)}.`,
      tags: ["commercial banking"],
      valueScore: 85,
      feasibilityScore: 75,
      riskScore: 30,
    },
    {
      title: (c) => `KYC / entity verification — ${c.industryPhrase}`,
      summary: (c) =>
        `Accelerate onboarding checks for ${c.customer} ${c.industryPhrase} operations.`,
      tags: ["operations"],
      valueScore: 82,
      feasibilityScore: 78,
      riskScore: 32,
    },
  ],
  technology: [
    {
      title: (c) => `Developer productivity copilot — ${c.industryPhrase}`,
      summary: (c) =>
        `Code, docs, and incident context across ${c.stackPhrase} for ${c.customer} engineering.`,
      tags: ["engineering"],
      valueScore: 88,
      feasibilityScore: 84,
      riskScore: 24,
    },
    {
      title: (c) => `Support deflection — ${c.customer}`,
      summary: (c) =>
        `Tier-1 resolution for ${c.industryPhrase} SaaS users; targets ${truncate(c.pain, 50)}.`,
      tags: ["CX"],
      valueScore: 86,
      feasibilityScore: 82,
      riskScore: 26,
    },
    {
      title: (c) => `Sales engineering demos — ${c.industryPhrase}`,
      summary: (c) =>
        `Tailored demos and POC scripts for ${c.customer} ${c.industryPhrase} prospects.`,
      tags: ["sales"],
      valueScore: 90,
      feasibilityScore: 76,
      riskScore: 30,
    },
    {
      title: (c) => `SecOps summarization — ${c.customer}`,
      summary: (c) =>
        `Correlate alerts and recommend response playbooks on ${c.stackPhrase}.`,
      tags: ["security"],
      valueScore: 87,
      feasibilityScore: 72,
      riskScore: 38,
    },
    {
      title: (c) => `Product feedback synthesis — ${c.industryPhrase}`,
      summary: (c) =>
        `Cluster requests and roadmap themes for ${c.industryPhrase} product teams.`,
      tags: ["product"],
      valueScore: 83,
      feasibilityScore: 80,
      riskScore: 22,
    },
    {
      title: (c) => `RevOps pipeline hygiene — ${c.customer}`,
      summary: (c) =>
        `Clean CRM data and forecast narratives for ${c.customer}; supports ${truncate(c.outcome, 45)}.`,
      tags: ["revops"],
      valueScore: 85,
      feasibilityScore: 78,
      riskScore: 28,
    },
    {
      title: (c) => `PS scoping — ${c.industryPhrase}`,
      summary: (c) =>
        `Draft SOWs and statements of work for ${c.industryPhrase} implementations.`,
      tags: ["services"],
      valueScore: 81,
      feasibilityScore: 77,
      riskScore: 26,
    },
  ],
  public_sector: [
    {
      title: (c) => `Citizen service request triage — ${c.industryPhrase}`,
      summary: (c) =>
        `Route and respond to constituent inquiries for ${c.customer} on ${c.stackPhrase}.`,
      tags: ["citizen services"],
      valueScore: 86,
      feasibilityScore: 78,
      riskScore: 30,
    },
    {
      title: (c) => `Grant & procurement review — ${c.customer}`,
      summary: (c) =>
        `Accelerate ${c.industryPhrase} RFP and grant analysis with audit-friendly citations.`,
      tags: ["procurement"],
      valueScore: 84,
      feasibilityScore: 74,
      riskScore: 34,
    },
    {
      title: (c) => `Field inspector briefings — ${c.industryPhrase}`,
      summary: (c) =>
        `Offline-capable checklists and policy Q&A for ${c.customer} field staff.`,
      tags: ["operations"],
      valueScore: 80,
      feasibilityScore: 76,
      riskScore: 28,
    },
    {
      title: (c) => `FOIA response — ${c.customer}`,
      summary: (c) =>
        `Draft compliant responses for ${c.industryPhrase} records requests.`,
      tags: ["compliance"],
      valueScore: 82,
      feasibilityScore: 70,
      riskScore: 40,
    },
    {
      title: (c) => `Agency workforce onboarding — ${c.industryPhrase}`,
      summary: (c) =>
        `Role-based learning paths for ${c.customer}; addresses ${truncate(c.pain, 50)}.`,
      tags: ["HR"],
      valueScore: 78,
      feasibilityScore: 82,
      riskScore: 22,
    },
    {
      title: (c) => `Program outcome reporting — ${c.customer}`,
      summary: (c) =>
        `Executive dashboards tied to ${truncate(c.outcome, 55)} for ${c.industryPhrase} leadership.`,
      tags: ["CXO"],
      valueScore: 88,
      feasibilityScore: 72,
      riskScore: 32,
    },
    {
      title: (c) => `Cyber incident coordination — ${c.industryPhrase}`,
      summary: (c) =>
        `Summarize incidents and stakeholder comms for ${c.customer} IT and security.`,
      tags: ["security"],
      valueScore: 85,
      feasibilityScore: 68,
      riskScore: 42,
    },
  ],
  energy: [
    {
      title: (c) => `Grid operations shift briefings — ${c.industryPhrase}`,
      summary: (c) =>
        `Consolidate SCADA notes and outages for ${c.customer} control centers.`,
      tags: ["grid"],
      valueScore: 90,
      feasibilityScore: 68,
      riskScore: 40,
    },
    {
      title: (c) => `Field technician copilot — ${c.customer}`,
      summary: (c) =>
        `Guided repairs and parts lookup for ${c.industryPhrase} crews on ${c.stackPhrase}.`,
      tags: ["field service"],
      valueScore: 88,
      feasibilityScore: 76,
      riskScore: 32,
    },
    {
      title: (c) => `Asset inspection vision — ${c.industryPhrase}`,
      summary: (c) =>
        `Photo-based defect detection for ${c.customer} ${c.industryPhrase} assets.`,
      tags: ["maintenance"],
      valueScore: 86,
      feasibilityScore: 70,
      riskScore: 38,
    },
    {
      title: (c) => `Trading & margin narrative — ${c.customer}`,
      summary: (c) =>
        `Explain market moves and margin impact; supports ${truncate(c.outcome, 50)}.`,
      tags: ["trading"],
      valueScore: 84,
      feasibilityScore: 66,
      riskScore: 44,
    },
    {
      title: (c) => `Permitting & environmental — ${c.industryPhrase}`,
      summary: (c) =>
        `Track submissions and regulatory deadlines for ${c.industryPhrase} projects.`,
      tags: ["compliance"],
      valueScore: 82,
      feasibilityScore: 74,
      riskScore: 34,
    },
    {
      title: (c) => `Outage communications — ${c.customer}`,
      summary: (c) =>
        `Proactive messaging for ${c.customer} utility customers during events.`,
      tags: ["CX"],
      valueScore: 80,
      feasibilityScore: 80,
      riskScore: 26,
    },
    {
      title: (c) => `Renewable production forecasting — ${c.industryPhrase}`,
      summary: (c) =>
        `Blend weather and telemetry for ${c.industryPhrase} generation planning.`,
      tags: ["renewables"],
      valueScore: 87,
      feasibilityScore: 72,
      riskScore: 36,
    },
  ],
};

function materialize(template: Template, ctx: IntakeContext, id: string): UseCaseCandidate {
  return {
    id,
    title: template.title(ctx),
    summary: template.summary(ctx),
    tags: [...template.tags, ctx.industryPhrase.split(/\s+/)[0]?.toLowerCase() ?? "vertical"],
    valueScore: template.valueScore,
    feasibilityScore: template.feasibilityScore,
    riskScore: template.riskScore,
  };
}

/** Build ten intake-specific use cases (anchors + vertical library). */
export function generateIntakeUseCases(intake: IntakeTailoring): {
  vertical: IndustryKey;
  industryPhrase: string;
  pool: UseCaseCandidate[];
} {
  const ctx = buildIntakeContext(intake);
  const anchors = anchorTemplates().map((t, i) =>
    materialize(t, ctx, `${ctx.vertical}-anchor-${i}`)
  );
  const verticalPool = VERTICAL_TEMPLATES[ctx.vertical].map((t, i) =>
    materialize(t, ctx, `${ctx.vertical}-tpl-${i}`)
  );

  const merged = [...anchors, ...verticalPool]
    .sort((a, b) => compositeScore(b) - compositeScore(a))
    .slice(0, 10);

  return {
    vertical: ctx.vertical,
    industryPhrase: ctx.industryPhrase,
    pool: merged,
  };
}

export function tailorUseCasePool(intake: IntakeTailoring): {
  industry: IndustryKey;
  industryPhrase: string;
  pool: UseCaseCandidate[];
} {
  const { vertical, industryPhrase, pool } = generateIntakeUseCases(intake);
  return { industry: vertical, industryPhrase, pool };
}
