import { compositeScore, type UseCaseCandidate } from "@/hackathon/data/useCaseLibrary";

export function UseCaseCard({
  useCase,
  onPick,
  disabled,
  highlight,
}: {
  useCase: UseCaseCandidate;
  onPick?: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  const score = compositeScore(useCase);

  return (
    <article
      className={`rounded-dl border bg-dl-surface p-4 shadow-card transition ${
        highlight ? "border-dl-brand ring-2 ring-dl-brand/20" : "border-dl-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-dl-text">{useCase.title}</h3>
        <span className="rounded-full bg-dl-page px-2 py-0.5 text-xs font-medium text-dl-brand">
          {score}
        </span>
      </div>
      <p className="mt-2 text-xs text-dl-text-secondary">{useCase.summary}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {useCase.tags.map((t) => (
          <span key={t} className="rounded bg-dl-page px-1.5 py-0.5 text-[10px] text-dl-text-secondary">
            {t}
          </span>
        ))}
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-dl-text-secondary">
        <div>
          <dt className="font-medium">Value</dt>
          <dd>{useCase.valueScore}</dd>
        </div>
        <div>
          <dt className="font-medium">Feasibility</dt>
          <dd>{useCase.feasibilityScore}</dd>
        </div>
        <div>
          <dt className="font-medium">Risk</dt>
          <dd>{useCase.riskScore}</dd>
        </div>
      </dl>
      {onPick && (
        <button
          type="button"
          disabled={disabled}
          onClick={onPick}
          className="mt-4 w-full rounded-dl bg-dl-brand px-3 py-2 text-xs font-semibold text-white hover:bg-dl-brand-hover disabled:opacity-40"
        >
          Draft this use case
        </button>
      )}
    </article>
  );
}
