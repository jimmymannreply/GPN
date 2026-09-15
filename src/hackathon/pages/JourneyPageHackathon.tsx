import { Link } from "react-router-dom";
import { Activity, User } from "lucide-react";
import { AgentPanel } from "@/hackathon/components/AgentPanel";
import { GoogleSignInGate } from "@/hackathon/components/GoogleSignInGate";
import { HandoffPanel } from "@/hackathon/components/HandoffPanel";
import { PhaseStepper } from "@/hackathon/components/PhaseStepper";
import { OutcomeDocDownloads } from "@/hackathon/components/OutcomeDocDownloads";
import { UseCaseCard } from "@/hackathon/components/UseCaseCard";
import { industryLabel } from "@/hackathon/data/useCaseLibrary";
import { useHackathonDraft } from "@/hackathon/hooks/useHackathonDraft";
import { GeminiFlowMini, GeminiStackRibbon } from "@/shared/gemini/GeminiShowcase";

export function JourneyPageHackathon() {
  const {
    state,
    updateIntake,
    completeIntake,
    returnToIntake,
    startDraft,
    pickUseCase,
    setHandoffAudience,
    advanceToOutcome,
    rankedShortlist,
    currentPicker,
    availableCases,
    agentMessage,
    resetHackathon,
  } = useHackathonDraft();

  const intakeValid =
    state.intake.customerName.trim() &&
    state.intake.industryStack.trim() &&
    state.intake.painPoint.trim() &&
    state.intake.cxoOutcome.trim() &&
    state.intake.headcount >= 4;

  return (
    <GoogleSignInGate>
      <div className="min-h-screen bg-dl-page text-dl-text">
        <header
          className="border-b border-dl-border bg-dl-surface px-6 py-3 shadow-card"
          style={{ borderTop: `3px solid ${state.brandAccent}` }}
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-dl-text-secondary">{state.brandName} · Use-Case Draft</p>
              <p className="font-semibold">{state.intake.customerName || "New hackathon"}</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {state.user && (
                <span className="flex items-center gap-2 text-dl-text-secondary">
                  <User className="h-4 w-4" />
                  {state.user.name}
                </span>
              )}
              <button type="button" onClick={resetHackathon} className="text-xs text-dl-brand underline">
                Reset
              </button>
              <Link to="/hackathon" className="text-xs text-dl-text-secondary hover:underline">
                Home
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <PhaseStepper phase={state.phase} />
            {state.phase !== "intake" && (
              <GeminiStackRibbon
                stackPhrase={
                  state.intake.industryStack.split(/[·|]/).slice(1).join(" · ") ||
                  state.intake.industryStack
                }
              />
            )}
            {state.phase !== "intake" && <GeminiFlowMini />}
            <AgentPanel message={agentMessage} accent={state.brandAccent} />

            {state.phase === "intake" && (
              <section className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card">
                <h2 className="text-lg font-semibold">Intake &amp; scoping</h2>
                <p className="mt-1 text-sm text-dl-text-secondary">
                  Three questions plus headcount — same spine as Business Value Sprint, sized for the
                  draft board.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm sm:col-span-2">
                    <span className="font-medium">Customer</span>
                    <input
                      className="mt-1 w-full rounded-dl border border-dl-border px-3 py-2 text-sm"
                      value={state.intake.customerName}
                      onChange={(e) => updateIntake({ customerName: e.target.value })}
                      placeholder="Northwind Retail Group"
                      data-testid="intake-customer"
                    />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="font-medium">Industry &amp; stack</span>
                    <input
                      className="mt-1 w-full rounded-dl border border-dl-border px-3 py-2 text-sm"
                      value={state.intake.industryStack}
                      onChange={(e) => updateIntake({ industryStack: e.target.value })}
                      placeholder="Financial Services · M365 + Google Cloud"
                    />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="font-medium">Pain that booked the meeting</span>
                    <textarea
                      className="mt-1 w-full rounded-dl border border-dl-border px-3 py-2 text-sm"
                      rows={2}
                      value={state.intake.painPoint}
                      onChange={(e) => updateIntake({ painPoint: e.target.value })}
                      placeholder="Store associates can't get trusted answers at the register."
                    />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="font-medium">CXO outcome being chased</span>
                    <input
                      className="mt-1 w-full rounded-dl border border-dl-border px-3 py-2 text-sm"
                      value={state.intake.cxoOutcome}
                      onChange={(e) => updateIntake({ cxoOutcome: e.target.value })}
                      placeholder="Lift same-store sales 3% without adding labor hours"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium">Headcount (4–8)</span>
                    <input
                      type="number"
                      min={4}
                      max={8}
                      className="mt-1 w-full rounded-dl border border-dl-border px-3 py-2 text-sm"
                      value={state.intake.headcount}
                      onChange={(e) =>
                        updateIntake({ headcount: Number(e.target.value) || 6 })
                      }
                    />
                  </label>
                </div>
                <button
                  type="button"
                  disabled={!intakeValid}
                  onClick={completeIntake}
                  data-testid="intake-continue"
                  className="mt-6 rounded-dl bg-dl-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                >
                  Generate draft plan
                </button>
              </section>
            )}

            {state.phase === "plan" && (
              <section className="space-y-4">
                <div className="rounded-dl border border-dl-border bg-dl-surface p-4 shadow-card">
                  <h2 className="text-lg font-semibold">Plan generation</h2>
                  {state.curatedIndustry && (
                    <p className="mt-2 text-xs font-medium text-dl-brand">
                      {state.curatedIndustryPhrase} · {industryLabel(state.curatedIndustry)} —
                      use cases generated from your pain, outcome, and stack
                    </p>
                  )}
                  <p className="mt-1 text-sm text-dl-text-secondary">
                    Ten pre-scored use cases · snake order for {state.participants.length}{" "}
                    participants · {state.snakeOrder.length} picks
                  </p>
                  <button
                    type="button"
                    onClick={returnToIntake}
                    className="mt-3 text-xs font-medium text-dl-brand underline"
                  >
                    Edit intake &amp; regenerate board
                  </button>
                  <p className="mt-2 text-xs text-dl-text-secondary">
                    Order: {state.participants.join(" → ")} (snake reverses each round)
                  </p>
                  <button
                    type="button"
                    onClick={startDraft}
                    data-testid="start-draft"
                    className="mt-4 rounded-dl bg-dl-brand px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Enter live draft
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {state.pool.map((uc) => (
                    <UseCaseCard key={uc.id} useCase={uc} />
                  ))}
                </div>
              </section>
            )}

            {state.phase === "draft" && (
              <section className="space-y-4">
                <div
                  className="rounded-dl border border-dl-brand/30 bg-dl-warning-bg px-4 py-3 text-sm text-dl-warning"
                  data-testid="draft-on-clock"
                >
                  On the clock: <strong>{currentPicker}</strong> — pick one available use case.
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {availableCases.map((uc) => (
                    <UseCaseCard
                      key={uc.id}
                      useCase={uc}
                      highlight
                      onPick={() => pickUseCase(uc.id)}
                    />
                  ))}
                </div>
                {availableCases.length === 0 && state.picks.length > 0 && state.phase === "draft" && (
                  <div className="rounded-dl border border-dl-border bg-dl-surface p-4">
                    <p className="text-sm text-dl-text-secondary">
                      All use cases drafted — review the ranked shortlist.
                    </p>
                    <button
                      type="button"
                      data-testid="view-outcome"
                      onClick={advanceToOutcome}
                      className="mt-3 rounded-dl bg-dl-brand px-4 py-2 text-sm font-semibold text-white"
                    >
                      View outcome
                    </button>
                  </div>
                )}
              </section>
            )}

            {state.phase === "outcome" && (
              <section className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card">
                <h2 className="text-lg font-semibold">Outcome capture</h2>
                <p className="mt-1 text-sm text-dl-text-secondary">
                  Ranked shortlist with named owners · contested picks:{" "}
                  {state.picks.filter((p) => p.contested).length}
                </p>
                <ol className="mt-4 space-y-3">
                  {rankedShortlist.map((item, i) => (
                    <li
                      key={item.useCase.id}
                      className="flex gap-3 rounded-dl border border-dl-border bg-dl-page p-3 text-sm"
                    >
                      <span className="font-bold text-dl-brand">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{item.useCase.title}</p>
                        <p className="text-xs text-dl-text-secondary">Owner: {item.owner}</p>
                        {item.useCase.geminiBlueprint && (
                          <p className="mt-1 text-[10px] text-[#1a73e8]">
                            {item.useCase.geminiBlueprint.patternName} · fit{" "}
                            {item.useCase.geminiBlueprint.geminiFit}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                <OutcomeDocDownloads />
                <button
                  type="button"
                  onClick={() => setHandoffAudience("partner")}
                  data-testid="go-handoff"
                  className="mt-6 rounded-dl bg-dl-brand px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Continue to handoff
                </button>
              </section>
            )}

            {state.phase === "handoff" && (
              <>
                <OutcomeDocDownloads />
                <HandoffPanel />
              </>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-dl border border-dl-border bg-dl-surface p-4 shadow-card">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Activity className="h-4 w-4 text-dl-brand" />
                Telemetry (POC)
              </div>
              <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-[11px] text-dl-text-secondary">
                {state.telemetry.length === 0 && <li>No events yet.</li>}
                {state.telemetry
                  .slice()
                  .reverse()
                  .map((t, i) => (
                    <li key={`${t.at}-${i}`}>
                      <span className="font-medium text-dl-text">{t.event}</span>
                      {t.detail ? ` · ${t.detail}` : ""}
                    </li>
                  ))}
              </ul>
            </div>
            <div className="rounded-dl border border-dl-border bg-dl-surface p-4 text-xs text-dl-text-secondary shadow-card">
              <p className="font-semibold text-dl-text">Pillars</p>
              <ul className="mt-2 space-y-1">
                <li>Co-sell — funding &amp; pilot seam</li>
                <li>Services — facilitator playbooks</li>
                <li>Technology — scored use-case library</li>
              </ul>
            </div>
          </aside>
        </main>
      </div>
    </GoogleSignInGate>
  );
}
