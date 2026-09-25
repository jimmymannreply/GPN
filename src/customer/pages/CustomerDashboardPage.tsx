import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  useCustomerSession,
  type SessionFormat,
  type SessionStage,
} from "@/customer/hooks/useCustomerSession";

function formatLabel(format: SessionFormat): string {
  return format === "ledger" ? "Ghost ledger" : "Value sprint";
}

function stageLabel(stage: SessionStage): string {
  const labels: Record<SessionStage, string> = {
    crm: "CRM",
    scope: "Scope",
    plan: "Plan",
    run: "Run",
    artifacts: "Produce artifacts",
    complete: "Complete",
  };
  return labels[stage];
}

type DashboardNavState = {
  format?: SessionFormat;
  startSession?: boolean;
};

export function CustomerDashboardPage() {
  const { state, startSession } = useCustomerSession();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const nav = (location.state ?? {}) as DashboardNavState;
    if (!nav.startSession) return;
    const format: SessionFormat = nav.format === "ledger" ? "ledger" : "draft";
    startSession(format);
    navigate(".", { replace: true, state: {} });
  }, [location.state, navigate, startSession]);

  const partner =
    state.crmAccount?.partnerOfRecord ?? "Partner of record pending";

  return (
    <div className="min-h-screen bg-dl-page text-dl-text" data-testid="customer-dashboard">
      <header className="border-b border-dl-border bg-dl-surface px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-dl-text-secondary">
              Customer · Value session
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Your session dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-dl-text-secondary">
              Session progress and funding for this engagement only—no partner cohort telemetry.
            </p>
          </div>
          <Link to="/customer" className="text-sm text-dl-brand hover:underline">
            Back to campaign
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <section className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card">
          <h2 className="text-lg font-semibold">Current session</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-dl-text-secondary">Format</dt>
              <dd className="mt-1 text-sm font-medium" data-testid="session-format">
                {formatLabel(state.format)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-dl-text-secondary">Stage</dt>
              <dd className="mt-1 text-sm font-medium" data-testid="session-stage">
                {stageLabel(state.stage)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-dl-text-secondary">Partner</dt>
              <dd className="mt-1 text-sm font-medium" data-testid="session-partner">
                {partner}
              </dd>
            </div>
          </dl>
          <div className="mt-6">
            <Link
              to="/customer/session"
              className="rounded-dl bg-dl-brand px-4 py-2 text-sm font-medium text-white"
              data-testid="continue-session"
            >
              Continue session
            </Link>
          </div>
        </section>

        <section className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Funding</h2>
              <p className="mt-1 text-sm text-dl-text-secondary">
                Claim status and estimated annual value for this session.
              </p>
            </div>
            <span
              className="rounded-full border border-dl-border bg-dl-page px-3 py-1 text-sm font-medium"
              data-testid="dashboard-funding-status"
            >
              {state.fundingStatus}
            </span>
          </div>
          <p className="mt-4 text-sm font-medium" data-testid="dashboard-funding-value">
            {state.fundingValueLabel}
          </p>
          <div className="mt-6">
            <Link
              to="/funding"
              className="rounded-dl border border-dl-border px-4 py-2 text-sm font-medium"
              data-testid="open-funding"
            >
              View funding pack
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
