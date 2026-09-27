import type { ConversationalStep } from "@/shared/conversational/ConversationalIntake";
import { parsePlainText } from "@/shared/conversational/parseIntakeReply";

export const CUSTOMER_SESSION_INTAKE_OPENING =
  "Company is set from CRM. Next I'll capture pain, outcome, and constraints, then enrich who's in the room from LinkedIn.";

export const CUSTOMER_SESSION_NEW_ACCOUNT_OPENING =
  "No problem — we'll add your account here. I'll ask for your organization, then pain, outcome, constraints, and who's in the room.";

export const customerSessionNewAccountPrefixSteps: ConversationalStep[] = [
  {
    id: "customerName",
    prompt: "What's your organization called?",
    placeholder: "e.g. Northwind Retail Group",
    parse: parsePlainText,
  },
  {
    id: "industryStack",
    prompt:
      "What industry are you in, and who is your Google partner of record if you know it? (Softchoice, CDW, or SHI.)",
    placeholder: "Insurance · CDW",
    parse: parsePlainText,
  },
  {
    id: "painPoint",
    prompt: "What pain are you trying to solve with Gemini Enterprise? Say it in plain language.",
    placeholder: "Work piles up because…",
    multiline: true,
    parse: parsePlainText,
  },
  {
    id: "cxoOutcome",
    prompt: "What outcome does your CXO need to see? Numbers welcome.",
    placeholder: "Cut cycle time 30% without adding headcount",
    parse: parsePlainText,
  },
  {
    id: "constraints",
    prompt: "Any hard constraints we should respect? (Timing, tools, compliance.)",
    placeholder: "Q2 window; stay on M365…",
    multiline: true,
    parse: parsePlainText,
  },
];

export const customerSessionIntakePrefixSteps: ConversationalStep[] = [
  {
    id: "painPoint",
    prompt: "What pain are you trying to solve with Gemini Enterprise? Say it in plain language.",
    placeholder: "Work piles up because…",
    multiline: true,
    parse: parsePlainText,
  },
  {
    id: "cxoOutcome",
    prompt: "What outcome does your CXO need to see? Numbers welcome.",
    placeholder: "Cut cycle time 30% without adding headcount",
    parse: parsePlainText,
  },
  {
    id: "constraints",
    prompt: "Any hard constraints we should respect? (Timing, tools, compliance, partner.)",
    placeholder: "Q2 window; stay on M365; partner of record leads…",
    multiline: true,
    parse: parsePlainText,
  },
];

export const CUSTOMER_SESSION_HEADCOUNT_PROMPT =
  "How many stakeholders should we enrich from LinkedIn for this session? (1–3)";

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
