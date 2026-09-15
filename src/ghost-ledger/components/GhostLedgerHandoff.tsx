import { CheckCircle2, ExternalLink, Send } from "lucide-react";
import { formatUsd } from "@/ghost-ledger/data/costModel";
import { useGhostLedger } from "@/ghost-ledger/hooks/useGhostLedger";

export function GhostLedgerHandoff() {
  const { state, setHandoffAudience, submitDaf } = useGhostLedger();
  const option = state.freezeOptions.find((o) => o.id === state.selectedFreezeId);

  return (
    <div className="space-y-6">
      <div className="rounded-dl border border-dl-border bg-dl-surface p-4 shadow-card">
        <p className="text-sm font-semibold text-dl-text">Audience-aware handoff</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="ghost-handoff-partner"
            onClick={() => setHandoffAudience("partner")}
            className={`rounded-dl px-4 py-2 text-sm font-medium ${
              state.handoffAudience === "partner"
                ? "bg-dl-brand text-white"
                : "border border-dl-border bg-dl-page text-dl-text"
            }`}
          >
            Partner pre-sales
          </button>
          <button
            type="button"
            data-testid="ghost-handoff-customer"
            onClick={() => setHandoffAudience("customer")}
            className={`rounded-dl px-4 py-2 text-sm font-medium ${
              state.handoffAudience === "customer"
                ? "bg-dl-brand text-white"
                : "border border-dl-border bg-dl-page text-dl-text"
            }`}
          >
            Customer stakeholder
          </button>
        </div>
      </div>

      {state.handoffAudience === "partner" && (
        <div className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card">
          <h3 className="text-lg font-semibold text-dl-text">Value justification &amp; DAF</h3>
          <p className="mt-2 text-sm text-dl-text-secondary">
            Frozen session loss: <strong>{formatUsd(state.frozenLossUsd)}</strong> · Monthly reversal
            target: <strong>{formatUsd(state.committedMonthlySavings)}</strong>
            {option ? ` via ${option.title}` : ""} for {state.intake.customerName}.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-dl-text">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-dl-success" />
              Frozen ledger filed as value-justification number (POC)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-dl-success" />
              Pilot registration stub for {state.brandName}
            </li>
          </ul>
          <button
            type="button"
            data-testid="ghost-daf-apply"
            onClick={submitDaf}
            disabled={state.dafSubmitted}
            className="mt-6 inline-flex items-center gap-2 rounded-dl bg-[#1a73e8] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1765cc] disabled:opacity-60"
          >
            <ExternalLink className="h-4 w-4" />
            {state.dafSubmitted ? "DAF application submitted (POC)" : "Apply for DAF funds"}
          </button>
        </div>
      )}

      {state.handoffAudience === "customer" && (
        <div className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card">
          <h3 className="text-lg font-semibold text-dl-text">Send frozen ledger to PDM</h3>
          <p className="mt-2 text-sm text-dl-text-secondary">
            Routes {formatUsd(state.frozenLossUsd)} session loss and{" "}
            {formatUsd(state.committedMonthlySavings)}/mo reversal plan to their Google PDM.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-dl border border-dl-border bg-dl-page px-4 py-2 text-sm"
          >
            <Send className="h-4 w-4 text-dl-brand" />
            Notify PDM (POC)
          </button>
        </div>
      )}
    </div>
  );
}
