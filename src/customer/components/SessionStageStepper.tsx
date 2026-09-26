import type { SessionStage } from "@/customer/hooks/useCustomerSession";

const STEPS: { id: SessionStage; label: string }[] = [
  { id: "crm", label: "CRM" },
  { id: "scope", label: "Scope" },
  { id: "plan", label: "Plan" },
  { id: "run", label: "Run" },
  { id: "artifacts", label: "Next steps" },
];

const order: SessionStage[] = ["crm", "scope", "plan", "run", "artifacts", "complete"];

export function SessionStageStepper({ stage }: { stage: SessionStage }) {
  const activeIndex = order.indexOf(stage);

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Session progress" data-testid="session-stage-stepper">
      {STEPS.map((step, i) => {
        const done = i < activeIndex;
        const active = step.id === stage || (stage === "complete" && step.id === "artifacts");
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
            aria-current={active ? "step" : undefined}
          >
            {step.label}
          </span>
        );
      })}
    </nav>
  );
}
