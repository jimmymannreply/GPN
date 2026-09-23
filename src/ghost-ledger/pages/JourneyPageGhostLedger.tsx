import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { AgentPanel } from "@/hackathon/components/AgentPanel";
import { PhaseStepper } from "@/hackathon/components/PhaseStepper";
import { formatUsd } from "@/ghost-ledger/data/costModel";
import { GhostLedgerHandoff } from "@/ghost-ledger/components/GhostLedgerHandoff";
import { GoogleSignInGateGhost } from "@/ghost-ledger/components/GoogleSignInGateGhost";
import { TickingLedger } from "@/ghost-ledger/components/TickingLedger";
import { useGhostLedger } from "@/ghost-ledger/hooks/useGhostLedger";
import { GeminiBlueprintPanel, GeminiFlowMini, GeminiStackRibbon } from "@/shared/gemini/GeminiShowcase";
import { SessionIntakeWithAttendees } from "@/shared/conversational/SessionIntakeWithAttendees";
import {
  LEDGER_CUSTOMER_HEADCOUNT_PROMPT,
  LEDGER_CUSTOMER_INTAKE_OPENING,
  LEDGER_HEADCOUNT_PROMPT,
  LEDGER_INTAKE_OPENING,
  ledgerCustomerPrefixSteps,
  ledgerPrefixSteps,
  ledgerSuffixSteps,
} from "@/ghost-ledger/data/ledgerIntakeSteps";
import type { LedgerIntake } from "@/ghost-ledger/data/costModel";

export function JourneyPageGhostLedger({ customerMode = false }: { customerMode?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const gl = useGhostLedger();
  const { state, agentMessage, liveLossUsd, returnToIntake } = gl;

  useEffect(() => {
    if (customerMode) gl.setBrand("Google Cloud", "#1a73e8");
  }, [customerMode, gl.setBrand]);

  useEffect(() => {
    const st = location.state as { forceIntake?: boolean } | null;
    if (!st?.forceIntake) return;
    returnToIntake();
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate, returnToIntake]);

  const applyIntakeField = (stepId: string, value: unknown) => {
    gl.updateIntake({ [stepId]: value } as Partial<LedgerIntake>);
  };

  return (
    <GoogleSignInGateGhost customerMode={customerMode}>
      <div className="min-h-screen bg-dl-page text-dl-text">
        <header
          className="border-b border-dl-border bg-dl-surface px-6 py-3 shadow-card"
          style={{ borderTop: `3px solid ${state.brandAccent}` }}
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-dl-text-secondary">
                {customerMode
                  ? "Gemini Enterprise · Cost of waiting"
                  : `${state.brandName} · Ghost Ledger`}
              </p>
              <p className="font-semibold">{state.intake.customerName || "New session"}</p>
              {state.intake.attendees?.length > 0 && (
                <p className="text-xs text-dl-text-secondary">
                  Room: {state.intake.attendees.map((attendee) => attendee.name).join(" · ")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm">
              {state.user && (
                <span className="flex items-center gap-2 text-dl-text-secondary">
                  <User className="h-4 w-4" />
                  {state.user.name}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  gl.resetSession();
                  if (customerMode) gl.setBrand("Google Cloud", "#1a73e8");
                }}
                className="text-xs text-dl-brand underline"
              >
                Reset
              </button>
              <Link
                to={customerMode ? "/customer" : "/hackathon/ghost-ledger"}
                className="text-xs text-dl-text-secondary hover:underline"
              >
                Home
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
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
              <SessionIntakeWithAttendees
                sessionKey={state.intakeSessionKey}
                openingLine={
                  customerMode ? LEDGER_CUSTOMER_INTAKE_OPENING : LEDGER_INTAKE_OPENING
                }
                accent={state.brandAccent}
                companyHint={state.intake.customerName}
                prefixSteps={customerMode ? ledgerCustomerPrefixSteps : ledgerPrefixSteps}
                headcountMin={2}
                headcountMax={5}
                headcountPrompt={
                  customerMode ? LEDGER_CUSTOMER_HEADCOUNT_PROMPT : LEDGER_HEADCOUNT_PROMPT
                }
                suffixSteps={ledgerSuffixSteps}
                onApplyField={applyIntakeField}
                onAttendeesChange={(attendees) => gl.updateIntake({ attendees })}
                onComplete={gl.completeIntake}
              />
            )}

            {state.phase === "plan" && state.breakdown && (
              <section className="space-y-4">
                <div className="rounded-dl border border-dl-border bg-dl-surface p-4 shadow-card">
                  <h2 className="text-lg font-semibold">Plan — cost of inaction</h2>
                  <p className="mt-2 text-2xl font-semibold text-dl-danger">
                    {formatUsd(state.breakdown.monthlyTotal)}
                    <span className="text-sm font-normal text-dl-text-secondary"> / month</span>
                  </p>
                  <p className="text-sm text-dl-text-secondary">
                    {formatUsd(state.breakdown.annualTotal)} annualized ·{" "}
                    {formatUsd(state.breakdown.perHour)}/hour while you wait
                  </p>
                  <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                    <li>Tool drag (22%): {formatUsd(state.breakdown.toolDrag)}</li>
                    <li>Ticket labor: {formatUsd(state.breakdown.ticketLabor)}</li>
                    <li>Manual work: {formatUsd(state.breakdown.manualLabor)}</li>
                    <li>Churn exposure: {formatUsd(state.breakdown.churn)}</li>
                  </ul>
                  <button
                    type="button"
                    onClick={gl.returnToIntake}
                    className="mt-3 text-xs font-medium text-dl-brand underline"
                  >
                    Edit numbers
                  </button>
                  <button
                    type="button"
                    onClick={gl.startRun}
                    data-testid="ghost-start-run"
                    className="mt-4 rounded-dl bg-dl-brand px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Start live ledger
                  </button>
                </div>
              </section>
            )}

            {(state.phase === "run" || (state.frozen && state.phase === "outcome")) &&
              state.breakdown && (
                <section className="space-y-4">
                  <TickingLedger
                    liveLossUsd={liveLossUsd}
                    perHour={state.breakdown.perHour}
                    frozen={state.frozen}
                    frozenLossUsd={state.frozenLossUsd}
                  />
                  {state.phase === "run" && !state.frozen && (
                    <>
                      <p className="text-sm text-dl-text-secondary">
                        Freeze the ledger by committing to a use case with a monthly reversal figure.
                      </p>
                      <div className="grid gap-3">
                        {state.freezeOptions.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            data-testid={`freeze-${opt.id}`}
                            onClick={() => gl.freezeLedger(opt.id)}
                            className="rounded-dl border border-dl-border bg-dl-surface p-4 text-left shadow-card hover:border-dl-brand"
                          >
                            <p className="font-medium text-dl-text">{opt.title}</p>
                            <p className="mt-1 text-xs text-dl-text-secondary">{opt.summary}</p>
                            <p className="mt-2 text-sm font-semibold text-dl-success">
                              Reverses ~
                              {formatUsd(state.breakdown!.monthlyTotal * opt.savingsPercent)}/mo
                            </p>
                            <div className="mt-3">
                              <GeminiBlueprintPanel blueprint={opt.geminiBlueprint} compact />
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </section>
              )}

            {state.phase === "outcome" && state.frozen && (
              <section className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card">
                <h2 className="text-lg font-semibold">Outcome — ledger frozen</h2>
                <p className="mt-2 text-sm text-dl-text-secondary">
                  Session loss captured: <strong>{formatUsd(state.frozenLossUsd)}</strong> after{" "}
                  {state.frozenAtSeconds}s. Monthly reversal committed:{" "}
                  <strong>{formatUsd(state.committedMonthlySavings)}</strong>.
                </p>
                {state.freezeOptions.find((o) => o.id === state.selectedFreezeId)?.geminiBlueprint && (
                  <div className="mt-4">
                    <GeminiBlueprintPanel
                      blueprint={
                        state.freezeOptions.find((o) => o.id === state.selectedFreezeId)!
                          .geminiBlueprint
                      }
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={gl.goToHandoff}
                  data-testid="ghost-go-handoff"
                  className="mt-6 rounded-dl bg-dl-brand px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Continue to handoff
                </button>
              </section>
            )}

            {state.phase === "handoff" && <GhostLedgerHandoff />}
        </main>
      </div>
    </GoogleSignInGateGhost>
  );
}
