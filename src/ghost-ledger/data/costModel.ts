import type { GeminiBlueprint } from "@/shared/gemini/geminiBlueprint";
import { buildGeminiBlueprint } from "@/shared/gemini/geminiBlueprint";
import type { AttendeeProfile } from "@/shared/attendees/types";

export interface LedgerIntake {
  customerName: string;
  industryStack: string;
  headcount: number;
  attendees: AttendeeProfile[];
  monthlyToolSpend: number;
  ticketsPerMonth: number;
  minutesPerTicket: number;
  hoursLostPerWeek: number;
  hourlyLoadedCost: number;
  monthlyChurnRevenue: number;
}

export interface CostBreakdown {
  toolDrag: number;
  ticketLabor: number;
  manualLabor: number;
  churn: number;
  monthlyTotal: number;
  perHour: number;
  perSecond: number;
  annualTotal: number;
}

export function computeCostOfInaction(intake: LedgerIntake): CostBreakdown {
  const toolDrag = intake.monthlyToolSpend * 0.22;
  const ticketLabor =
    (intake.ticketsPerMonth * (intake.minutesPerTicket / 60)) * intake.hourlyLoadedCost;
  const manualLabor = intake.hoursLostPerWeek * 4.33 * intake.hourlyLoadedCost;
  const churn = intake.monthlyChurnRevenue;
  const monthlyTotal = toolDrag + ticketLabor + manualLabor + churn;
  const hoursPerMonth = 30 * 24;
  const perHour = monthlyTotal / hoursPerMonth;
  const perSecond = monthlyTotal / (hoursPerMonth * 3600);
  return {
    toolDrag,
    ticketLabor,
    manualLabor,
    churn,
    monthlyTotal,
    perHour,
    perSecond,
    annualTotal: monthlyTotal * 12,
  };
}

export interface FreezeOption {
  id: string;
  title: string;
  summary: string;
  savingsPercent: number;
  geminiBlueprint: GeminiBlueprint;
}

function freezeOption(
  intake: LedgerIntake,
  id: string,
  title: string,
  summary: string,
  savingsPercent: number,
  tags: string[]
): FreezeOption {
  const stack = intake.industryStack.split(/[·|]/).slice(1).join(" · ") || intake.industryStack;
  return {
    id,
    title,
    summary,
    savingsPercent,
    geminiBlueprint: buildGeminiBlueprint(title, summary, tags, stack),
  };
}

export function buildFreezeOptions(intake: LedgerIntake): FreezeOption[] {
  const industry = intake.industryStack.split(/[·|]/)[0]?.trim() || "operations";
  return [
    freezeOption(
      intake,
      "agent-deflect",
      `Gemini agent deflection for ${industry} support`,
      `Automate tier-1 on ${intake.industryStack} — targets ticket volume and handle time.`,
      0.35,
      ["support", "CX"]
    ),
    freezeOption(
      intake,
      "process-copilot",
      `Gemini work copilot — ${intake.customerName}`,
      `Remove repeat steps driving ${intake.hoursLostPerWeek}h/week of manual work.`,
      0.42,
      ["operations", "productivity"]
    ),
    freezeOption(
      intake,
      "retention-agent",
      `Gemini churn early-warning & save plays`,
      `Intervene before revenue walks — addresses $${intake.monthlyChurnRevenue.toLocaleString()}/mo churn exposure.`,
      0.28,
      ["analytics", "CX"]
    ),
  ];
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
