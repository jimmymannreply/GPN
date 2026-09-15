import { type HackathonPhase } from "@/hackathon/hooks/useHackathonDraft";

/** Shared five-step spine; `run` is the Ghost Ledger live session (same slot as Use-Case Draft `draft`). */
export type SpinePhase = HackathonPhase | "run";

const STEPS: { id: SpinePhase; label: string }[] = [
  { id: "intake", label: "Intake" },
  { id: "plan", label: "Plan" },
  { id: "draft", label: "Run" },
  { id: "outcome", label: "Outcome" },
  { id: "handoff", label: "Handoff" },
];

const order: SpinePhase[] = ["intake", "plan", "draft", "outcome", "handoff"];

function phaseIndex(phase: SpinePhase): number {
  if (phase === "run") return 2;
  return order.indexOf(phase);
}

export function PhaseStepper({ phase }: { phase: SpinePhase }) {
  const activeIndex = phaseIndex(phase);

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Hackathon progress">
      {STEPS.map((step, i) => {
        const done = i < activeIndex;
        const active =
          step.id === phase || (step.id === "draft" && phase === "run");
        return (
          <span
            key={step.id}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              active
                ? "bg-dl-brand text-white shadow-stage-active"
                : done
                  ? "bg-dl-success-bg text-dl-success"
                  : "bg-dl-page text-dl-text-secondary"
            }`}
          >
            {step.label}
          </span>
        );
      })}
    </nav>
  );
}
