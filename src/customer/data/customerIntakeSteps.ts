import type { ConversationalStep } from "@/shared/conversational/ConversationalIntake";
import {
  parseDollars,
  parseHourlyCost,
  parsePlainText,
  parsePositiveInt,
} from "@/shared/conversational/parseIntakeReply";
import type {
  CrmAccount,
  CustomerSessionState,
  LedgerFields,
  SessionFormat,
} from "@/customer/hooks/useCustomerSession";
import { ledgerSuffixSteps } from "@/ghost-ledger/data/ledgerIntakeSteps";

export function parsePartnerFromIndustryStack(stack: string): string {
  const lower = stack.toLowerCase();
  if (lower.includes("softchoice")) return "Softchoice";
  if (lower.includes("cdw")) return "CDW";
  if (lower.includes("shi")) return "SHI";
  return "Partner";
}

export function parseIndustryFromStack(stack: string): string {
  const before = stack.split(/[·|,]/)[0]?.trim();
  return before || "General";
}

const identitySteps: ConversationalStep[] = [
  {
    id: "customerName",
    prompt: "What's your organization called?",
    placeholder: "e.g. Northwind Retail Group",
    parse: parsePlainText,
  },
  {
    id: "industry",
    prompt: "What industry are you in?",
    placeholder: "Insurance",
    parse: parsePlainText,
  },
  {
    id: "contactName",
    prompt: "Who is the primary contact for this session? Full name.",
    placeholder: "e.g. Michelle Dorsey",
    parse: parsePlainText,
  },
  {
    id: "contactRole",
    prompt: "What is their role?",
    placeholder: "e.g. VP Claims Operations",
    parse: parsePlainText,
  },
  {
    id: "partnerOfRecord",
    prompt: "Who is your Google partner of record? (Softchoice, CDW, or SHI — or say unknown.)",
    placeholder: "CDW",
    parse: parsePlainText,
  },
];

const painStep: ConversationalStep = {
  id: "painPoint",
  prompt: "What pain are you trying to solve with Gemini Enterprise? Say it in plain language.",
  placeholder: "Work piles up because…",
  multiline: true,
  parse: parsePlainText,
};

const techStackStep: ConversationalStep = {
  id: "techStack",
  prompt: "What does your technical stack look like? (Apps, cloud, data platforms.)",
  placeholder: "M365 · ServiceNow · Azure",
  parse: parsePlainText,
};

const outcomeStep: ConversationalStep = {
  id: "cxoOutcome",
  prompt: "What outcome does your CXO need to see? Numbers welcome.",
  placeholder: "Cut cycle time 30% without adding headcount",
  parse: parsePlainText,
};

const constraintsStep: ConversationalStep = {
  id: "constraints",
  prompt: "Any hard constraints we should respect? (Timing, tools, compliance.)",
  placeholder: "Q2 window; stay on M365…",
  multiline: true,
  parse: parsePlainText,
};

function ledgerFieldMissing(ledger: LedgerFields, id: keyof LedgerFields): boolean {
  return ledger[id] === null || ledger[id] === undefined;
}

export interface IntakePlan {
  openingLine: string;
  fieldSteps: ConversationalStep[];
  needAttendees: boolean;
  headcountPrompt: string;
}

/** Ask only for identification / enrichment not already supplied by CRM. */
export function buildCustomerIntakePlan(
  format: SessionFormat,
  account: CrmAccount | null,
  scope: CustomerSessionState["scope"],
  techStack: string,
  ledger: LedgerFields,
  attendeeCount: number,
  addingViaChat: boolean,
): IntakePlan {
  const fieldSteps: ConversationalStep[] = [];

  if (addingViaChat || !account?.company) {
    fieldSteps.push(...identitySteps);
  }

  if (!scope.painPoint.trim()) fieldSteps.push(painStep);
  if (!techStack.trim()) fieldSteps.push(techStackStep);
  if (!scope.cxoOutcome.trim()) fieldSteps.push(outcomeStep);
  if (!scope.constraints.trim()) fieldSteps.push(constraintsStep);

  if (format === "ledger") {
    for (const step of ledgerSuffixSteps) {
      const key = step.id as keyof LedgerFields;
      if (ledgerFieldMissing(ledger, key)) {
        fieldSteps.push({
          ...step,
          prompt: step.prompt
            .replace(/\bthey\b/gi, "you")
            .replace(/\btheir\b/gi, "your")
            .replace(/\bthem\b/gi, "you"),
        });
      }
    }
  }

  const needAttendees = attendeeCount === 0;

  const fromCrm = Boolean(account?.company) && !addingViaChat;
  const openingLine = fromCrm
    ? `I've got ${account!.company} on file (${account!.industry}; contact ${account!.contact.name}). I'll only ask for what CRM didn't already provide.`
    : "We'll add your account in chat — company, industry, and contact — then anything CRM didn't cover.";

  return {
    openingLine,
    fieldSteps,
    needAttendees,
    headcountPrompt:
      "How many people should attend the hackathon / session? We'll enrich each from LinkedIn. (1–3)",
  };
}

/** Map a ledger chat step id to a numeric patch. */
export function ledgerValueFromStep(
  stepId: string,
  value: unknown,
): Partial<LedgerFields> | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  switch (stepId) {
    case "monthlyToolSpend":
    case "ticketsPerMonth":
    case "minutesPerTicket":
    case "hoursLostPerWeek":
    case "hourlyLoadedCost":
    case "monthlyChurnRevenue":
      return { [stepId]: n };
    default:
      return null;
  }
}

// Re-export parsers used elsewhere
export { parseDollars, parseHourlyCost, parsePositiveInt };
