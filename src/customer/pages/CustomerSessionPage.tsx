import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CrmFindStep } from "@/customer/components/CrmFindStep";
import { NextActionsPanel } from "@/customer/components/NextActionsPanel";
import { SessionStageStepper } from "@/customer/components/SessionStageStepper";
import { scopeFromCrmAccount } from "@/customer/data/mockCrm";
import { useCustomerSession } from "@/customer/hooks/useCustomerSession";
import type { CrmAccount } from "@/customer/hooks/useCustomerSession";

export function CustomerSessionPage() {
  const navigate = useNavigate();
  const { state, setCrmAccount, setAttendees, updateScope, setStage } = useCustomerSession();
  const [roomAligned, setRoomAligned] = useState(false);
  const [ranksReady, setRanksReady] = useState(false);

  const scopeReady =
    state.scope.painPoint.trim() &&
    state.scope.cxoOutcome.trim() &&
    state.scope.constraints.trim();

  const produceArtifacts = () => {
    setStage("artifacts");
    const seed = {
      customerName: state.crmAccount?.company ?? "Customer",
      industryStack: state.crmAccount
        ? `${state.crmAccount.industry} · ${state.crmAccount.segment}`
        : "",
      painPoint: state.scope.painPoint,
      cxoOutcome: state.scope.cxoOutcome,
      headcount: Math.max(state.attendees.length, 4),
      attendees: state.attendees,
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
              Walk CRM → Scope → Plan → Run, then choose next actions.
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
            <CrmFindStep
              selectedAccount={state.crmAccount}
              attendees={state.attendees}
              onSelectAccount={(account: CrmAccount) => {
                setCrmAccount(account);
                updateScope(scopeFromCrmAccount(account));
              }}
              onAttendeesChange={setAttendees}
              onNext={() => {
                if (!state.crmAccount) return;
                setStage("scope");
              }}
            />
          )}

          {state.stage === "scope" && (
            <div className="space-y-6" data-testid="stage-scope">
              <div>
                <h2 className="text-lg font-semibold">Scope the engagement</h2>
                <p className="mt-1 text-sm text-dl-text-secondary">
                  Prefills from the CRM account when available — edit or extend anything before
                  you continue.
                </p>
              </div>
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
                  Review CRM, attendees, and scope before the run beat.
                </p>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-dl-text-secondary">Account</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {state.crmAccount?.company ?? "—"}
                  </dd>
                  <dd className="mt-0.5 text-xs text-dl-text-secondary">
                    {state.crmAccount
                      ? `${state.crmAccount.partnerOfRecord} · ${state.crmAccount.industry}`
                      : null}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-dl-text-secondary">
                    Attendees
                  </dt>
                  <dd className="mt-1 text-sm">
                    {state.attendees.length === 0
                      ? "None yet"
                      : state.attendees.map((a) => `${a.name} (${a.role})`).join(", ")}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wider text-dl-text-secondary">Scope</dt>
                  <dd className="mt-1 space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Pain:</span> {state.scope.painPoint || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Outcome:</span> {state.scope.cxoOutcome || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Constraints:</span>{" "}
                      {state.scope.constraints || "—"}
                    </p>
                  </dd>
                </div>
              </dl>
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
                      Keep the room light: advance when the cost-of-waiting beat is ready, then
                      produce artifacts on the Ghost Ledger board.
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
                      Align the room and confirm ranks before producing use-case artifacts.
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
