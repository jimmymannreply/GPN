import type { SessionFormat } from "@/customer/hooks/useCustomerSession";

export function buildSessionAgenda(
  format: SessionFormat,
  company: string,
): string[] {
  if (format === "ledger") {
    return [
      `Welcome & confirm ${company} numbers for cost of inaction`,
      "Live ledger run — watch the cost of waiting tick",
      "Freeze a Gemini reversal play the room can own",
      "Capture next actions (hackathon, DAF, or produce artifacts)",
    ];
  }
  return [
    `Welcome & align on ${company} outcomes`,
    "Review LinkedIn-enriched attendees and roles",
    "Draft and snake-rank Gemini-ready use cases",
    "Confirm top pick and next actions (hackathon, DAF, or produce artifacts)",
  ];
}
