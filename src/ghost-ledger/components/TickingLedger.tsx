import { formatUsd } from "@/ghost-ledger/data/costModel";

export function TickingLedger({
  liveLossUsd,
  perHour,
  frozen,
  frozenLossUsd,
}: {
  liveLossUsd: number;
  perHour: number;
  frozen: boolean;
  frozenLossUsd: number;
}) {
  const display = frozen ? frozenLossUsd : liveLossUsd;

  return (
    <div
      className={`rounded-dl border p-6 text-center shadow-card ${
        frozen
          ? "border-dl-success bg-dl-success-bg"
          : "border-dl-danger/40 bg-gradient-to-b from-[#1a1a1a] to-[#2d1215] text-white"
      }`}
      data-testid="ghost-ledger-counter"
    >
      <p className={`text-xs font-semibold uppercase tracking-widest ${frozen ? "text-dl-success" : "text-red-200"}`}>
        {frozen ? "Ledger frozen" : "Cost of inaction — live"}
      </p>
      <p
        className={`mt-2 font-mono text-4xl font-bold tabular-nums sm:text-5xl ${
          frozen ? "text-dl-text" : "text-red-400"
        }`}
      >
        {formatUsd(display)}
      </p>
      <p className={`mt-2 text-sm ${frozen ? "text-dl-text-secondary" : "text-red-100/80"}`}>
        {frozen
          ? "Session loss captured at freeze"
          : `Bleeding ~${formatUsd(perHour)} per hour while the room waits`}
      </p>
    </div>
  );
}
