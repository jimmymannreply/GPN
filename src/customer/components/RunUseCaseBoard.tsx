import { UseCaseCard } from "@/hackathon/components/UseCaseCard";
import type { UseCaseCandidate } from "@/hackathon/data/useCaseLibrary";

export function RunUseCaseBoard({
  painPoint,
  candidates,
  rankedTop3,
  onRankedChange,
  onStartHackathonDraft,
  onSaveAndContinue,
}: {
  painPoint: string;
  candidates: UseCaseCandidate[];
  rankedTop3: string[];
  onRankedChange: (ids: string[]) => void;
  onStartHackathonDraft: () => void;
  onSaveAndContinue: () => void;
}) {
  const ready = rankedTop3.length === 3;
  const rankedCases = rankedTop3
    .map((id) => candidates.find((c) => c.id === id))
    .filter(Boolean) as UseCaseCandidate[];

  const addToRank = (id: string) => {
    if (rankedTop3.includes(id) || rankedTop3.length >= 3) return;
    onRankedChange([...rankedTop3, id]);
  };

  const removeFromRank = (id: string) => {
    onRankedChange(rankedTop3.filter((x) => x !== id));
  };

  const move = (index: number, delta: number) => {
    const next = index + delta;
    if (next < 0 || next >= rankedTop3.length) return;
    const copy = [...rankedTop3];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    onRankedChange(copy);
  };

  return (
    <div className="space-y-6" data-testid="stage-run">
      <div>
        <h2 className="text-lg font-semibold">Rank Gemini pilots for your pain</h2>
        <p className="mt-1 text-sm text-dl-text-secondary">
          Here are {candidates.length} Gemini Enterprise scenarios tailored to your session. Build an
          ordered top 3 — then start a hackathon draft or save and continue.
        </p>
        {painPoint ? (
          <p className="mt-2 rounded-dl border border-dl-border bg-dl-page px-3 py-2 text-sm" data-testid="run-pain-snapshot">
            <span className="font-medium">Pain:</span> {painPoint}
          </p>
        ) : null}
      </div>

      <div
        className="rounded-dl border border-dl-border bg-dl-page p-4"
        data-testid="run-ranked-strip"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-dl-text-secondary">
          Your top 3 {ready ? "· locked" : `· ${rankedTop3.length}/3`}
        </p>
        {rankedCases.length === 0 ? (
          <p className="mt-2 text-sm text-dl-text-secondary">
            Add three candidates from the board below.
          </p>
        ) : (
          <ol className="mt-3 space-y-2">
            {rankedCases.map((uc, i) => (
              <li
                key={uc.id}
                className="flex flex-wrap items-center gap-2 rounded-dl border border-dl-border bg-dl-surface px-3 py-2 text-sm"
                data-testid={`run-rank-${i + 1}`}
              >
                <span className="font-bold text-dl-brand">#{i + 1}</span>
                <span className="min-w-0 flex-1 font-medium">{uc.title}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="rounded border border-dl-border px-2 py-0.5 text-xs disabled:opacity-40"
                    disabled={i === 0}
                    aria-label={`Move ${uc.title} up`}
                    onClick={() => move(i, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="rounded border border-dl-border px-2 py-0.5 text-xs disabled:opacity-40"
                    disabled={i === rankedCases.length - 1}
                    aria-label={`Move ${uc.title} down`}
                    onClick={() => move(i, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="rounded border border-dl-border px-2 py-0.5 text-xs"
                    aria-label={`Remove ${uc.title}`}
                    onClick={() => removeFromRank(uc.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2" data-testid="run-candidate-grid">
        {candidates.map((uc) => {
          const rankIndex = rankedTop3.indexOf(uc.id);
          const selected = rankIndex >= 0;
          return (
            <div key={uc.id} data-testid={`run-candidate-${uc.id}`}>
              <UseCaseCard useCase={uc} highlight={selected} />
              <button
                type="button"
                disabled={selected || rankedTop3.length >= 3}
                className="mt-2 w-full rounded-dl border border-dl-border px-3 py-2 text-xs font-semibold disabled:opacity-40"
                data-testid={`run-add-${uc.id}`}
                onClick={() => addToRank(uc.id)}
              >
                {selected ? `In shortlist (#${rankIndex + 1})` : "Add to top 3"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!ready}
          data-testid="run-start-hackathon-draft"
          onClick={onStartHackathonDraft}
          className="rounded-dl bg-dl-brand px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start hackathon draft now
        </button>
        <button
          type="button"
          disabled={!ready}
          data-testid="run-save-continue"
          onClick={onSaveAndContinue}
          className="rounded-dl border border-dl-border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save &amp; continue to next steps
        </button>
      </div>
    </div>
  );
}
