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
  const hourShare = Math.min(1, perHour > 0 ? display / (perHour * 8) : 0);

  return (
    <div
      className={`overflow-hidden rounded-dl border shadow-card ${
        frozen
          ? "border-dl-success bg-dl-success-bg"
          : "border-[#3c1218] bg-gradient-to-br from-[#141414] via-[#1c1012] to-[#2a0f14] text-white"
      }`}
      data-testid="ghost-ledger-counter"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-2.5">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
            frozen ? "text-dl-success" : "text-red-200/90"
          }`}
        >
          Partner network · Value session
        </p>
        <p className={`text-[11px] ${frozen ? "text-dl-text-secondary" : "text-red-100/70"}`}>
          {frozen ? "Frozen" : "Live ledger"}
        </p>
      </div>

      <div className="px-5 py-8 text-center sm:px-8">
        <p
          className={`text-xs font-semibold uppercase tracking-widest ${
            frozen ? "text-dl-success" : "text-red-200"
          }`}
        >
          {frozen ? "Ledger frozen" : "Cost of inaction"}
        </p>
        <p
          className={`mt-3 font-mono text-5xl font-bold tabular-nums tracking-tight sm:text-6xl ${
            frozen ? "text-dl-text" : "text-red-400"
          }`}
        >
          {formatUsd(display)}
        </p>
        <p className={`mt-3 text-sm ${frozen ? "text-dl-text-secondary" : "text-red-100/80"}`}>
          {frozen
            ? "Session loss captured at freeze"
            : `Bleeding ~${formatUsd(perHour)} per hour while the room waits`}
        </p>

        {!frozen && (
          <div className="mx-auto mt-6 h-1.5 max-w-md overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-400 transition-[width] duration-1000"
              style={{ width: `${Math.max(8, hourShare * 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
