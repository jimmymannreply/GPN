import type { ConversationalStep } from "@/shared/conversational/ConversationalIntake";
import {
  parseDollars,
  parseHourlyCost,
  parsePlainText,
  parsePositiveInt,
} from "@/shared/conversational/parseIntakeReply";

export const LEDGER_INTAKE_OPENING =
  "Ghost Ledger mode — we'll use their real numbers, not benchmarks. I'll ask for spend, volume, and churn; then we'll start the clock.";

export const LEDGER_CUSTOMER_INTAKE_OPENING =
  "Let's show the cost of waiting. I'll identify who's in the room (with a LinkedIn lookup), capture your real numbers, then start the clock.";

export const ledgerPrefixSteps: ConversationalStep[] = [
  {
    id: "customerName",
    prompt: "Which customer is in the room for this session?",
    placeholder: "Contoso Financial",
    parse: parsePlainText,
  },
  {
    id: "industryStack",
    prompt: "What industry and tool stack are we costing against?",
    placeholder: "Financial Services · M365 + ServiceNow",
    parse: parsePlainText,
  },
];

export const ledgerCustomerPrefixSteps: ConversationalStep[] = [
  {
    id: "customerName",
    prompt: "What's your organization called?",
    placeholder: "Contoso Financial",
    parse: parsePlainText,
  },
  {
    id: "industryStack",
    prompt: "What industry and tool stack should we cost against?",
    placeholder: "Financial Services · M365 + ServiceNow",
    parse: parsePlainText,
  },
];

export const LEDGER_HEADCOUNT_PROMPT =
  "How many people are in the room for this session? (2–5)";

export const LEDGER_CUSTOMER_HEADCOUNT_PROMPT =
  "How many stakeholders should we look up on LinkedIn for this session? (2–5)";

export const ledgerSuffixSteps: ConversationalStep[] = [
  {
    id: "monthlyToolSpend",
    prompt: "Roughly what do they spend per month on the tools we're trying to get more value from?",
    placeholder: "250000 or $250k",
    parse: (raw) => {
      const r = parseDollars(raw);
      return { valid: r.valid, value: r.value, error: r.error };
    },
  },
  {
    id: "ticketsPerMonth",
    prompt: "How many support (or ops) tickets are they handling per month?",
    placeholder: "4200",
    parse: (raw) => {
      const r = parsePositiveInt(raw, "ticket count");
      return { valid: r.valid, value: r.value, error: r.error };
    },
  },
  {
    id: "minutesPerTicket",
    prompt: "On average, how many minutes does each ticket burn?",
    placeholder: "12 (or say 'about 15')",
    parse: (raw) => {
      const r = parsePositiveInt(raw.replace(/about/i, ""), "minute value");
      return { valid: r.valid, value: r.value, error: r.error };
    },
  },
  {
    id: "hoursLostPerWeek",
    prompt: "How many hours per week are lost to manual work the room already knows should be automated?",
    placeholder: "120",
    parse: (raw) => {
      const r = parsePositiveInt(raw, "hour count");
      return { valid: r.valid, value: r.value, error: r.error };
    },
  },
  {
    id: "hourlyLoadedCost",
    prompt: "Loaded hourly cost for those teams? (Say 'default' for $85/hr if you don't have it.)",
    placeholder: "85 or default",
    parse: (raw) => {
      const r = parseHourlyCost(raw);
      return { valid: r.valid, value: r.value, error: r.error };
    },
  },
  {
    id: "monthlyChurnRevenue",
    prompt: "Lastly — monthly revenue at risk from churn if nothing changes? (0 if N/A.)",
    placeholder: "80000 or 0",
    parse: (raw) => {
      const trimmed = raw.trim().toLowerCase();
      if (trimmed === "0" || trimmed === "n/a" || trimmed === "na" || trimmed === "none") {
        return { valid: true, value: 0 };
      }
      const r = parseDollars(raw);
      return { valid: r.valid, value: r.value, error: r.error };
    },
  },
];
