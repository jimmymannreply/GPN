import type { ConversationalStep } from "@/shared/conversational/ConversationalIntake";
import { parsePlainText } from "@/shared/conversational/parseIntakeReply";

export const DRAFT_INTAKE_OPENING =
  "I'm running your first Use-Case Draft — tell me about the account in your own words. I'll ask a few follow-ups, then build the board.";

export const DRAFT_CUSTOMER_INTAKE_OPENING =
  "Let's build your business case. I'll learn about your organization, pull LinkedIn context on who's in the room, then draft and prioritize Gemini-ready use cases.";

export const draftPrefixSteps: ConversationalStep[] = [
  {
    id: "customerName",
    prompt: "Who's the customer we're running this hackathon for?",
    placeholder: "e.g. Northwind Retail Group",
    parse: parsePlainText,
  },
  {
    id: "industryStack",
    prompt:
      "What industry are they in, and what does their stack look like? (Apps, cloud, data — whatever you'd tell a PDM.)",
    placeholder: "Retail · M365 + Google Cloud + Salesforce",
    parse: parsePlainText,
  },
  {
    id: "painPoint",
    prompt: "What pain actually booked this meeting? Say it like you'd say it in the room.",
    placeholder: "Store teams can't get trusted answers at the register…",
    multiline: true,
    parse: parsePlainText,
  },
  {
    id: "cxoOutcome",
    prompt: "What outcome is the CXO trying to buy? Numbers welcome.",
    placeholder: "Lift same-store sales 3% without adding labor hours",
    parse: parsePlainText,
  },
];

/** Customer entry path — same fields, first-person / business-case voice */
export const draftCustomerPrefixSteps: ConversationalStep[] = [
  {
    id: "customerName",
    prompt: "What's your organization called?",
    placeholder: "e.g. Northwind Retail Group",
    parse: parsePlainText,
  },
  {
    id: "industryStack",
    prompt:
      "What industry are you in, and what does your stack look like? (Apps, cloud, data.)",
    placeholder: "Retail · M365 + Google Cloud + Salesforce",
    parse: parsePlainText,
  },
  {
    id: "painPoint",
    prompt: "What pain are you trying to solve with Gemini Enterprise? Say it in plain language.",
    placeholder: "Store teams can't get trusted answers at the register…",
    multiline: true,
    parse: parsePlainText,
  },
  {
    id: "cxoOutcome",
    prompt: "What outcome does your CXO need to see? Numbers welcome.",
    placeholder: "Lift same-store sales 3% without adding labor hours",
    parse: parsePlainText,
  },
];

export const DRAFT_HEADCOUNT_PROMPT =
  "How many people in the session — including at least one CXO? (4–8)";

export const DRAFT_CUSTOMER_HEADCOUNT_PROMPT =
  "How many stakeholders should we enrich from LinkedIn for this session — including at least one CXO? (4–8)";

export const draftSuffixSteps: ConversationalStep[] = [];
