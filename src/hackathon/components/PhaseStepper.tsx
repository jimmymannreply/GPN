import { type HackathonPhase } from "@/hackathon/hooks/useHackathonDraft";

const STEPS: { id: HackathonPhase; label: string }[] = [
  { id: "intake", label: "Intake" },
  { id: "plan", label: "Plan" },
  { id: "draft", label: "Run" },
  { id: "outcome", label: "Outcome" },
  { id: "handoff", label: "Handoff" },
];

const order: HackathonPhase[] = ["intake", "plan", "draft", "outcome", "handoff"];

export function PhaseStepper({ phase }: { phase: HackathonPhase }) {
  const activeIndex = order.indexOf(phase);

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Hackathon progress">
      {STEPS.map((step, i) => {
        const done = i < activeIndex;
        const active = step.id === phase;
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
