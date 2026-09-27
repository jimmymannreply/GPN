import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CustomerCrmStep } from "@/customer/components/CustomerCrmStep";
import { CustomerIntakeStep } from "@/customer/components/CustomerIntakeStep";
import { NextActionsPanel } from "@/customer/components/NextActionsPanel";
import { SessionStageStepper } from "@/customer/components/SessionStageStepper";
import {
  enrichmentFromMock,
  toCrmIdentity,
  type MockCrmAccount,
} from "@/customer/data/mockCrm";
import { buildSessionAgenda } from "@/customer/data/sessionAgenda";
import {
  useCustomerSession,
  type CrmAccount,
  type LedgerFields,
} from "@/customer/hooks/useCustomerSession";

const emptyLedger: LedgerFields = {
  monthlyToolSpend: null,
  ticketsPerMonth: null,
  minutesPerTicket: null,
  hoursLostPerWeek: null,
  hourlyLoadedCost: null,
  monthlyChurnRevenue: null,
};

export function CustomerSessionPage() {
  const navigate = useNavigate();
  const {
    state,
    setCrmAccount,
    setTechStack,
    setAttendees,
    updateScope,
    updateLedger,
    setStage,
  } = useCustomerSession();
  const [roomAligned, setRoomAligned] = useState(false);
  const [ranksReady, setRanksReady] = useState(false);
  const [addingViaChat, setAddingViaChat] = useState(false);

  const scopeReady =
    state.scope.painPoint.trim() &&
    state.scope.cxoOutcome.trim() &&
    state.scope.constraints.trim();

  const agenda = buildSessionAgenda(
    state.format,
    state.crmAccount?.company ?? "your organization",
  );

  const selectCrmAccount = (account: MockCrmAccount) => {
    const enrichment = enrichmentFromMock(account);
    setCrmAccount(toCrmIdentity(account));
    setTechStack(enrichment.techStack);
    updateScope(enrichment.scope);
    updateLedger({ ...emptyLedger, ...enrichment.ledger });
    setAttendees(enrichment.attendees);
  };

  const clearEnrichment = () => {
    setCrmAccount(null);
    setTechStack("");
    updateScope({ painPoint: "", cxoOutcome: "", constraints: "" });
    updateLedger({ ...emptyLedger });
    setAttendees([]);
  };

  const finishIntake = () => {
    setAddingViaChat(false);
    setStage("scope");
  };

  const produceArtifacts = () => {
    setStage("artifacts");
    const stack = state.techStack.trim();
    const industryStack = state.crmAccount
      ? [state.crmAccount.industry, stack || state.crmAccount.segment].filter(Boolean).join(" · ")
      : stack;
    const seed = {
      customerName: state.crmAccount?.company ?? "Customer",
      industryStack,
      painPoint: state.scope.painPoint,
      cxoOutcome: state.scope.cxoOutcome,
      headcount: Math.max(state.attendees.length, 4),
      attendees: state.attendees,
      ledger: {
        monthlyToolSpend: state.ledger.monthlyToolSpend,
        ticketsPerMonth: state.ledger.ticketsPerMonth,
        minutesPerTicket: state.ledger.minutesPerTicket,
        hoursLostPerWeek: state.ledger.hoursLostPerWeek,
        hourlyLoadedCost: state.ledger.hourlyLoadedCost,
        monthlyChurnRevenue: state.ledger.monthlyChurnRevenue,
      },
    };
    sessionStorage.setItem("customer-session-seed-v1", JSON.stringify(seed));
    if (state.format === "draft") navigate("/customer/use-case-draft");
    else navigate("/customer/ghost-ledger");
  };

  return (
    <div className="min-h-screen bg-dl-page text-dl-text" data-testid="customer-session">
      <header className="border-b border-dl-border bg-dl-surface px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-dl-text-secondary">
              Customer · Staged session
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Value session</h1>
            <p className="mt-2 max-w-2xl text-sm text-dl-text-secondary">
              CRM → Intake → Scope → Plan → Run, then choose next actions.
            </p>
            <div className="mt-4">
              <SessionStageStepper stage={state.stage} />
            </div>
          </div>
          <Link to="/customer/dashboard" className="text-sm text-dl-brand hover:underline">
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <section className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card">
          {state.stage === "crm" && (
            <CustomerCrmStep
              selectedAccount={state.crmAccount?.company ? state.crmAccount : null}
              onSelectAccount={(account) => {
                setAddingViaChat(false);
                selectCrmAccount(account);
              }}
              onNext={() => {
                if (!state.crmAccount?.company) return;
                setAddingViaChat(false);
                setStage("intake");
              }}
              onAddViaChat={() => {
                setAddingViaChat(true);
                clearEnrichment();
                setStage("intake");
              }}
            />
          )}

          {state.stage === "intake" && (state.crmAccount?.company || addingViaChat) && (
            <CustomerIntakeStep
              format={state.format}
              account={addingViaChat ? null : state.crmAccount}
              scope={state.scope}
              techStack={state.techStack}
              ledger={state.ledger}
              attendees={state.attendees}
              addingViaChat={addingViaChat}
              onApplyScopeField={updateScope}
              onTechStack={setTechStack}
              onUpdateLedger={updateLedger}
              onCreateAccount={(account: CrmAccount) => {
                setCrmAccount(account);
              }}
              onAttendeesChange={setAttendees}
              onComplete={() => finishIntake()}
              onSkipWithCrmDefaults={() => finishIntake()}
            />
          )}

          {state.stage === "scope" && (
            <div className="space-y-6" data-testid="stage-scope">
              <div>
                <h2 className="text-lg font-semibold">Scope the engagement</h2>
                <p className="mt-1 text-sm text-dl-text-secondary">
                  Prefills from intake chat and CRM — edit or extend anything before you continue.
                </p>
              </div>

              {state.crmAccount?.company && (
                <div
                  className="rounded-dl border border-dl-border bg-dl-page p-3 text-sm"
                  data-testid="scope-identity"
                >
                  <p className="text-xs uppercase tracking-wider text-dl-text-secondary">
                    Identification
                  </p>
                  <p className="mt-1 font-medium">{state.crmAccount.company}</p>
                  <p className="text-xs text-dl-text-secondary">
                    {state.crmAccount.industry} · Contact: {state.crmAccount.contact.name} (
                    {state.crmAccount.contact.role})
                  </p>
                  {state.techStack ? (
                    <p className="mt-1 text-xs text-dl-text-secondary" data-testid="scope-tech-stack">
                      Stack: {state.techStack}
                    </p>
                  ) : null}
                </div>
              )}

              <label className="block text-sm">
                <span className="text-dl-text-secondary">Pain point</span>
                <textarea
                  value={state.scope.painPoint}
                  onChange={(e) => updateScope({ painPoint: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-dl border border-dl-border bg-dl-page px-3 py-2"
                  data-testid="scope-pain"
                />
              </label>
              <label className="block text-sm">
                <span className="text-dl-text-secondary">CXO outcome</span>
                <textarea
                  value={state.scope.cxoOutcome}
                  onChange={(e) => updateScope({ cxoOutcome: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-dl border border-dl-border bg-dl-page px-3 py-2"
                  data-testid="scope-outcome"
                />
              </label>
              <label className="block text-sm">
                <span className="text-dl-text-secondary">Constraints</span>
                <textarea
                  value={state.scope.constraints}
                  onChange={(e) => updateScope({ constraints: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-dl border border-dl-border bg-dl-page px-3 py-2"
                  data-testid="scope-constraints"
                />
              </label>
              <button
                type="button"
                disabled={!scopeReady}
                onClick={() => setStage("plan")}
                className="rounded-dl bg-dl-brand px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="scope-next"
              >
                Next: Plan
              </button>
            </div>
          )}

          {state.stage === "plan" && (
            <div className="space-y-6" data-testid="stage-plan">
              <div>
                <h2 className="text-lg font-semibold">Confirm the plan</h2>
                <p className="mt-1 text-sm text-dl-text-secondary">
                  Attendees from CRM / intake and the session agenda for{" "}
                  {state.format === "ledger" ? "Ghost ledger" : "use-case draft"}.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Account</h3>
                <p className="mt-1 text-sm" data-testid="plan-account">
                  {state.crmAccount?.company ?? "—"}
                  {state.crmAccount
                    ? ` · ${state.crmAccount.industry} · Contact: ${state.crmAccount.contact.name}`
                    : ""}
                </p>
                {state.techStack ? (
                  <p className="mt-1 text-xs text-dl-text-secondary" data-testid="plan-tech-stack">
                    Stack: {state.techStack}
                  </p>
                ) : null}
              </div>

              <div>
                <h3 className="text-sm font-semibold">Attendees</h3>
                {state.attendees.length === 0 ? (
                  <p className="mt-1 text-sm text-dl-text-secondary">None captured yet</p>
                ) : (
                  <ul className="mt-2 space-y-2" data-testid="plan-attendees">
                    {state.attendees.map((a) => (
                      <li
                        key={`${a.name}-${a.role}`}
                        className="rounded-dl border border-dl-border bg-dl-page px-3 py-2 text-sm"
                      >
                        <p className="font-medium">
                          {a.name} · {a.role}
                        </p>
                        <p className="text-xs text-dl-text-secondary">{a.linkedIn.headline}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold">Agenda</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm" data-testid="plan-agenda">
                  {agenda.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Scope snapshot</h3>
                <div className="mt-1 space-y-1 text-sm text-dl-text-secondary">
                  <p>
                    <span className="font-medium text-dl-text">Pain:</span>{" "}
                    {state.scope.painPoint || "—"}
                  </p>
                  <p>
                    <span className="font-medium text-dl-text">Outcome:</span>{" "}
                    {state.scope.cxoOutcome || "—"}
                  </p>
                  <p>
                    <span className="font-medium text-dl-text">Constraints:</span>{" "}
                    {state.scope.constraints || "—"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStage("run")}
                className="rounded-dl bg-dl-brand px-4 py-2 text-sm font-medium text-white"
                data-testid="plan-confirm"
              >
                Confirm → Run
              </button>
            </div>
          )}

          {state.stage === "run" && (
            <div className="space-y-6" data-testid="stage-run">
              {state.format === "ledger" ? (
                <>
                  <div>
                    <h2 className="text-lg font-semibold">Live ledger run</h2>
                    <p className="mt-1 text-sm text-dl-text-secondary">
                      Advance when the cost-of-waiting beat is ready, then choose next actions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStage("artifacts")}
                    className="rounded-dl bg-dl-brand px-4 py-2 text-sm font-medium text-white"
                    data-testid="run-open-ledger"
                  >
                    Finish run → next steps
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-lg font-semibold">Facilitated run checklist</h2>
                    <p className="mt-1 text-sm text-dl-text-secondary">
                      Align the room and confirm ranks before next actions.
                    </p>
                  </div>
                  <ul className="space-y-3">
                    <li>
                      <label className="flex items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={roomAligned}
                          onChange={(e) => setRoomAligned(e.target.checked)}
                          data-testid="run-room-aligned"
                        />
                        Room aligned
                      </label>
                    </li>
                    <li>
                      <label className="flex items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={ranksReady}
                          onChange={(e) => setRanksReady(e.target.checked)}
                          data-testid="run-ranks-ready"
                        />
                        Ranks ready
                      </label>
                    </li>
                  </ul>
                  <button
                    type="button"
                    disabled={!roomAligned || !ranksReady}
                    onClick={() => setStage("artifacts")}
                    className="rounded-dl bg-dl-brand px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid="run-continue"
                  >
                    Finish run → next steps
                  </button>
                </>
              )}
            </div>
          )}

          {(state.stage === "artifacts" || state.stage === "complete") && (
            <NextActionsPanel format={state.format} onProduceArtifacts={produceArtifacts} />
          )}
        </section>
      </main>
    </div>
  );
}
