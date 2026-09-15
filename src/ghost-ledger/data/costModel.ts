export interface LedgerIntake {
  customerName: string;
  industryStack: string;
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
}

export function buildFreezeOptions(intake: LedgerIntake): FreezeOption[] {
  const industry = intake.industryStack.split(/[·|]/)[0]?.trim() || "operations";
  return [
    {
      id: "agent-deflect",
      title: `Agent deflection for ${industry} support`,
      summary: `Automate tier-1 on ${intake.industryStack} — targets ticket volume and handle time.`,
      savingsPercent: 0.35,
    },
    {
      id: "process-copilot",
      title: `Manual work copilot — ${intake.customerName}`,
      summary: `Remove repeat steps driving ${intake.hoursLostPerWeek}h/week of manual work.`,
      savingsPercent: 0.42,
    },
    {
      id: "retention-agent",
      title: `Churn early-warning & save plays`,
      summary: `Intervene before revenue walks — addresses $${intake.monthlyChurnRevenue.toLocaleString()}/mo churn exposure.`,
      savingsPercent: 0.28,
    },
  ];
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
