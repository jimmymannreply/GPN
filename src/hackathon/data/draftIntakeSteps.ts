import type { ConversationalStep } from "@/shared/conversational/ConversationalIntake";
import {
  parseHeadcount,
  parsePlainText,
} from "@/shared/conversational/parseIntakeReply";

export const DRAFT_INTAKE_OPENING =
  "I'm running your first Use-Case Draft — tell me about the account in your own words. I'll ask a few follow-ups, then build the board.";

export const draftIntakeSteps: ConversationalStep[] = [
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
  {
    id: "headcount",
    prompt: "How many people in the session — including at least one CXO? (4–8)",
    placeholder: "6",
    parse: (raw) => {
      const r = parseHeadcount(raw);
      return { valid: r.valid, value: r.value, error: r.error };
    },
  },
];
