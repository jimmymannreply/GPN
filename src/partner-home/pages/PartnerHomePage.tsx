import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { setCrmAudienceFromPartnerLens } from "@/customer/data/crmAudience";

const LENSES = [
  { id: "partner" as const, label: "Partner lens" },
  { id: "pdm" as const, label: "PDM lens" },
];

export function PartnerHomePage() {
  const [lens, setLens] = useState<"partner" | "pdm">("partner");
  const greeting = lens === "pdm" ? "Hello, Google PDM" : "Hello, partner facilitator";

  useEffect(() => {
    setCrmAudienceFromPartnerLens(lens, "CDW");
  }, [lens]);

  return (
    <div className="min-h-screen bg-dl-page text-dl-text" data-testid="partner-home">
      <header className="border-b border-dl-border bg-dl-surface px-6 py-4">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-wider text-dl-text-secondary">
            Partner network · Value sessions
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{greeting}</h1>
          <p className="mt-2 max-w-2xl text-sm text-dl-text-secondary">
            Launch and govern partner-led value sessions. Evidence and document ownership stay with
            the partner; program telemetry stays on our roll-up.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {LENSES.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLens(l.id)}
                className={`rounded-dl border px-3 py-1.5 text-sm ${
                  lens === l.id
                    ? "border-dl-brand bg-dl-brand/10 font-medium text-dl-brand"
                    : "border-dl-border bg-dl-page"
                }`}
                data-testid={`lens-${l.id}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-4 px-6 py-10 sm:grid-cols-2">
        <section className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card sm:col-span-2">
          <h2 className="text-lg font-semibold">Open value sessions</h2>
          <p className="mt-1 text-sm text-dl-text-secondary">
            Partner-branded Concept 2 and Concept 4 flows.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/hackathon"
              className="rounded-dl bg-dl-brand px-4 py-2 text-sm font-medium text-white"
              data-testid="open-use-case-draft"
            >
              Use-Case Draft (Value sprint)
            </Link>
            <Link
              to="/hackathon/ghost-ledger"
              className="rounded-dl border border-dl-border px-4 py-2 text-sm font-medium"
              data-testid="open-ghost-ledger"
            >
              Ghost Ledger
            </Link>
          </div>
        </section>

        <Link
          to="/funding"
          className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card hover:border-dl-brand"
          data-testid="tile-funding"
        >
          <h2 className="text-lg font-semibold">Funding</h2>
          <p className="mt-1 text-sm text-dl-text-secondary">
            Review the substantiation pack behind a partner claim.
          </p>
        </Link>

        <Link
          to="/telemetry"
          className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card hover:border-dl-brand"
          data-testid="tile-telemetry"
        >
          <h2 className="text-lg font-semibold">Telemetry</h2>
          <p className="mt-1 text-sm text-dl-text-secondary">
            Conversion, qualification, and funded-pilot performance (our roll-up).
          </p>
        </Link>

        <div className="rounded-dl border border-dashed border-dl-border bg-dl-page p-6 opacity-70">
          <h2 className="text-lg font-semibold">Programs</h2>
          <p className="mt-1 text-sm text-dl-text-secondary">Illustrative · unavailable</p>
        </div>
        <div className="rounded-dl border border-dashed border-dl-border bg-dl-page p-6 opacity-70">
          <h2 className="text-lg font-semibold">Support</h2>
          <p className="mt-1 text-sm text-dl-text-secondary">Illustrative · unavailable</p>
        </div>

        <p className="sm:col-span-2 text-center text-xs text-dl-text-secondary">
          <Link to="/customer" className="text-dl-brand hover:underline">
            Customer campaign entry
          </Link>
          {" · "}
          <Link to="/v1" className="text-dl-brand hover:underline">
            Legacy V1 landing
          </Link>
        </p>
      </main>
    </div>
  );
}
