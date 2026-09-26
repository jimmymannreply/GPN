import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HackathonSchedulerModal } from "@/customer/components/HackathonSchedulerModal";
import type { SessionFormat } from "@/customer/hooks/useCustomerSession";

export function NextActionsPanel({
  format,
  onProduceArtifacts,
}: {
  format: SessionFormat;
  onProduceArtifacts: () => void;
}) {
  const navigate = useNavigate();
  const [schedulerOpen, setSchedulerOpen] = useState(false);

  return (
    <div className="space-y-4" data-testid="stage-artifacts">
      <div>
        <h2 className="text-lg font-semibold">What should we do next?</h2>
        <p className="mt-1 text-sm text-dl-text-secondary">
          The run beat is done. Schedule a follow-up, advance funding, or produce Gemini artifacts
          from this session.
        </p>
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          data-testid="next-schedule-hackathon"
          className="rounded-dl border border-dl-border bg-dl-page p-4 text-left transition hover:border-dl-brand"
          onClick={() => setSchedulerOpen(true)}
        >
          <p className="font-medium">Schedule a hackathon to work these solutions</p>
          <p className="mt-1 text-sm text-dl-text-secondary">
            Open a calendar invite for a facilitated Gemini value session.
          </p>
        </button>
        <button
          type="button"
          data-testid="next-apply-daf"
          className="rounded-dl border border-dl-border bg-dl-page p-4 text-left transition hover:border-dl-brand"
          onClick={() => navigate("/funding")}
        >
          <p className="font-medium">Choose one and apply for DAF now</p>
          <p className="mt-1 text-sm text-dl-text-secondary">
            Review the funding substantiation pack and advance the claim.
          </p>
        </button>
        <button
          type="button"
          data-testid="produce-artifacts"
          className="rounded-dl border border-dl-border bg-dl-page p-4 text-left transition hover:border-dl-brand"
          onClick={onProduceArtifacts}
        >
          <p className="font-medium">
            Produce artifacts on the{" "}
            {format === "ledger" ? "Ghost Ledger" : "Use-Case Draft"} board
          </p>
          <p className="mt-1 text-sm text-dl-text-secondary">
            Open the Gemini board with CRM and scope applied — land on plan, not intake.
          </p>
        </button>
      </div>

      <HackathonSchedulerModal
        open={schedulerOpen}
        format={format}
        onClose={() => setSchedulerOpen(false)}
      />
    </div>
  );
}
