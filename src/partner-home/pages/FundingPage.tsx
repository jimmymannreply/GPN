import { useState } from "react";
import { Link } from "react-router-dom";
import {
  DEFAULT_FUNDING_CLAIM,
  nextFundingStatus,
  type FundingStatus,
  type MockFundingClaim,
} from "@/partner-home/data/mockFunding";

function statusBadgeClass(status: FundingStatus): string {
  if (status === "Submitted") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (status === "Ready to submit") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-dl-border bg-dl-page text-dl-text-secondary";
}

export function FundingPage() {
  const [claim, setClaim] = useState<MockFundingClaim>(DEFAULT_FUNDING_CLAIM);

  const advanceStatus = () => {
    setClaim((c) => ({ ...c, status: nextFundingStatus(c.status) }));
  };

  const canAdvance = claim.status !== "Submitted";

  return (
    <div className="min-h-screen bg-dl-page text-dl-text" data-testid="funding-page">
      <header className="border-b border-dl-border bg-dl-surface px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-dl-text-secondary">
              Partner network · Funding substantiation
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Funding claim review</h1>
            <p className="mt-2 max-w-2xl text-sm text-dl-text-secondary">
              Simulated substantiation pack for partner-led value session outcomes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link to="/" className="text-dl-brand hover:underline">
              Home
            </Link>
            <Link to="/customer/dashboard" className="text-dl-brand hover:underline">
              Customer dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <section className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{claim.customer}</h2>
            <span
              className={`rounded-full border px-3 py-1 text-sm font-medium ${statusBadgeClass(claim.status)}`}
              data-testid="funding-status"
            >
              {claim.status}
            </span>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-dl-text-secondary">Use case</dt>
              <dd className="mt-1 text-sm">{claim.useCase}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-dl-text-secondary">
                Annual value
              </dt>
              <dd className="mt-1 text-sm font-medium">{claim.annualValueLabel}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-dl-text-secondary">Format</dt>
              <dd className="mt-1 text-sm">{claim.format}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-dl-text-secondary">
                Partner sponsor
              </dt>
              <dd className="mt-1 text-sm">{claim.partnerSponsor}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wider text-dl-text-secondary">Claim ID</dt>
              <dd className="mt-1 font-mono text-sm text-dl-text-secondary">{claim.id}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card">
          <h2 className="text-lg font-semibold">Attributed notes</h2>
          <ul className="mt-4 space-y-4">
            {claim.notes.map((note) => (
              <li key={note.who} className="border-l-2 border-dl-brand/40 pl-4">
                <p className="text-sm font-medium">{note.who}</p>
                <p className="mt-1 text-sm text-dl-text-secondary">{note.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={advanceStatus}
            disabled={!canAdvance}
            className="rounded-dl bg-dl-brand px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="advance-funding-status"
          >
            {claim.status === "Draft"
              ? "Mark ready to submit"
              : claim.status === "Ready to submit"
                ? "Submit claim"
                : "Submitted"}
          </button>
          <Link
            to="/"
            className="rounded-dl border border-dl-border px-4 py-2 text-sm font-medium"
          >
            Back to home
          </Link>
        </section>
      </main>
    </div>
  );
}
