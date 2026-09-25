import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HackathonSchedulerModal } from "@/customer/components/HackathonSchedulerModal";
import {
  applyDemoPreseed,
  isDemoPreseedEnabled,
} from "@/customer/data/demoPreseed";
import type { SessionFormat } from "@/customer/hooks/useCustomerSession";

export function BusinessCaseModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState<"format" | "next">("format");
  const [format, setFormat] = useState<SessionFormat>("draft");
  const [schedulerOpen, setSchedulerOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("format");
      setSchedulerOpen(false);
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (schedulerOpen) setSchedulerOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, schedulerOpen]);

  if (!open) return null;

  const pickFormat = (next: SessionFormat) => {
    setFormat(next);
    setStep("next");
  };

  const goPartnerSession = () => {
    if (isDemoPreseedEnabled()) {
      applyDemoPreseed(format);
      navigate("/customer/dashboard", {
        state: { format, startSession: false, preserveSeed: true },
      });
    } else {
      navigate("/customer/dashboard", {
        state: { format, startSession: true },
      });
    }
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="business-case-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <h2 id="business-case-title" className="text-xl font-medium text-gray-900">
              {step === "format" ? "Build my business case" : "What should we do next?"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-800"
              aria-label="Close"
            >
              Close
            </button>
          </div>

          {step === "format" ? (
            <>
              <p className="mt-2 text-sm text-gray-600">
                Choose how you want to make the case for Gemini Enterprise with your team.
              </p>
              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  data-testid="choose-use-case-draft"
                  className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-[#1a73e8] hover:bg-blue-50/50"
                  onClick={() => pickFormat("draft")}
                >
                  <p className="font-medium text-gray-900">Prioritize my use cases</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Meet your stakeholders (LinkedIn-enriched), then draft and rank Gemini-ready
                    use cases with the team.
                  </p>
                </button>
                <button
                  type="button"
                  data-testid="choose-ghost-ledger"
                  className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-[#1a73e8] hover:bg-blue-50/50"
                  onClick={() => pickFormat("ledger")}
                >
                  <p className="font-medium text-gray-900">Show me the cost of waiting</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Enrich who&apos;s in the room from LinkedIn, watch the cost of inaction tick,
                    then freeze a Gemini reversal play.
                  </p>
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-gray-600">
                You chose{" "}
                <strong>
                  {format === "ledger" ? "cost of waiting" : "use-case prioritization"}
                </strong>
                . Pick a next action.
              </p>
              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  data-testid="next-schedule-hackathon"
                  className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-[#1a73e8] hover:bg-blue-50/50"
                  onClick={() => setSchedulerOpen(true)}
                >
                  <p className="font-medium text-gray-900">
                    Schedule a hackathon to work these solutions
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Open a calendar invite for a facilitated Gemini value session.
                  </p>
                </button>
                <button
                  type="button"
                  data-testid="next-apply-daf"
                  className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-[#1a73e8] hover:bg-blue-50/50"
                  onClick={() => {
                    navigate("/funding");
                    onClose();
                  }}
                >
                  <p className="font-medium text-gray-900">Choose one and apply for DAF now</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Review the funding substantiation pack and advance the claim.
                  </p>
                </button>
                <button
                  type="button"
                  data-testid="next-partner-session"
                  className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-[#1a73e8] hover:bg-blue-50/50"
                  onClick={goPartnerSession}
                >
                  <p className="font-medium text-gray-900">
                    Have my Partner run a facilitated session
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Continue into the staged CRM → Scope → Plan → Run path with your partner.
                  </p>
                </button>
              </div>
              <button
                type="button"
                className="mt-4 text-sm text-[#1a73e8] hover:underline"
                onClick={() => setStep("format")}
                data-testid="next-actions-back"
              >
                Back to format choice
              </button>
            </>
          )}
        </div>
      </div>

      <HackathonSchedulerModal
        open={schedulerOpen}
        format={format}
        onClose={() => setSchedulerOpen(false)}
      />
    </>
  );
}
