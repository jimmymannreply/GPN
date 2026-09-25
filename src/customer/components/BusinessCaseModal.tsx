import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function BusinessCaseModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
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
            Build my business case
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
        <p className="mt-2 text-sm text-gray-600">
          Choose how you want to make the case for Gemini Enterprise with your team.
        </p>
        <div className="mt-6 grid gap-3">
          <button
            type="button"
            data-testid="choose-use-case-draft"
            className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-[#1a73e8] hover:bg-blue-50/50"
            onClick={() =>
              navigate("/customer/dashboard", {
                state: { format: "draft", startSession: true },
              })
            }
          >
            <p className="font-medium text-gray-900">Prioritize my use cases</p>
            <p className="mt-1 text-sm text-gray-600">
              Meet your stakeholders (LinkedIn-enriched), then draft and rank Gemini-ready use
              cases with the team.
            </p>
          </button>
          <button
            type="button"
            data-testid="choose-ghost-ledger"
            className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-[#1a73e8] hover:bg-blue-50/50"
            onClick={() =>
              navigate("/customer/dashboard", {
                state: { format: "ledger", startSession: true },
              })
            }
          >
            <p className="font-medium text-gray-900">Show me the cost of waiting</p>
            <p className="mt-1 text-sm text-gray-600">
              Enrich who&apos;s in the room from LinkedIn, watch the cost of inaction tick, then
              freeze a Gemini reversal play.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
