import { CheckCircle2, ExternalLink, Send } from "lucide-react";
import { useHackathonDraft } from "@/hackathon/hooks/useHackathonDraft";

export function HandoffPanel() {
  const { state, setHandoffAudience, submitDaf, rankedShortlist } = useHackathonDraft();
  const top = rankedShortlist[0];

  return (
    <div className="space-y-6">
      <div className="rounded-dl border border-dl-border bg-dl-surface p-4 shadow-card">
        <p className="text-sm font-semibold text-dl-text">Audience-aware handoff</p>
        <p className="mt-1 text-xs text-dl-text-secondary">
          Same spine as the pitch — partner gets funding actions; customer routes to their PDM.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="handoff-partner"
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
            data-testid="handoff-customer"
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
        <div className="rounded-dl border border-dl-border bg-gradient-to-br from-white to-dl-page p-6 shadow-card">
          <h3 className="text-lg font-semibold text-dl-text">Pilot registration &amp; funding</h3>
          <p className="mt-2 text-sm text-dl-text-secondary">
            Submit the ranked shortlist for {state.intake.customerName}. Top pick:{" "}
            <strong>{top?.useCase.title ?? "—"}</strong> (owner: {top?.owner ?? "—"}).
          </p>
          <ul className="mt-4 space-y-2 text-sm text-dl-text">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-dl-success" />
              Shortlist packaged for {state.brandName} systems
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-dl-success" />
              Pilot scope stub — 90-day discovery-to-pilot motion
            </li>
          </ul>
          <button
            type="button"
            data-testid="daf-apply"
            onClick={submitDaf}
            disabled={state.dafSubmitted}
            className="mt-6 inline-flex items-center gap-2 rounded-dl bg-[#1a73e8] px-5 py-3 text-sm font-semibold text-white shadow-card hover:bg-[#1765cc] disabled:opacity-60"
          >
            <ExternalLink className="h-4 w-4" />
            {state.dafSubmitted ? "DAF application submitted (POC)" : "Apply for DAF funds"}
          </button>
          {state.dafSubmitted && (
            <p className="mt-3 text-xs text-dl-success">
              Seam fired — in production this deep-links to Deal Acceleration Funds with telemetry
              correlation ID.
            </p>
          )}
        </div>
      )}

      {state.handoffAudience === "customer" && (
        <div className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card">
          <h3 className="text-lg font-semibold text-dl-text">Route to Google PDM</h3>
          <p className="mt-2 text-sm text-dl-text-secondary">
            Sends the ranked shortlist with <strong>{top?.useCase.title}</strong> as the proposed
            next step — no funding button on the customer branch.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-dl border border-dl-border bg-dl-page px-4 py-2 text-sm font-medium text-dl-text"
          >
            <Send className="h-4 w-4 text-dl-brand" />
            Notify PDM (POC)
          </button>
        </div>
      )}
    </div>
  );
}
