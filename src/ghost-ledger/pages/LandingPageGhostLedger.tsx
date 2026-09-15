import { Link } from "react-router-dom";
import { useGhostLedger } from "@/ghost-ledger/hooks/useGhostLedger";

const journeyPath = "/hackathon/ghost-ledger/journey";

const BRAND_PRESETS = [
  { name: "Softchoice", accent: "#0078D4" },
  { name: "CDW", accent: "#CC0000" },
  { name: "SoftwareOne", accent: "#6B2C91" },
];

export function LandingPageGhostLedger() {
  const { setBrand, state } = useGhostLedger();

  return (
    <div className="min-h-screen bg-dl-page text-dl-text">
      <header className="border-b border-dl-border bg-dl-surface px-6 py-4 shadow-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-dl-text-secondary">
              Stage-fit hackathons
            </p>
            <p className="text-lg font-semibold">The Ghost Ledger · Concept 4</p>
          </div>
          <Link to="/hackathon" className="text-sm text-dl-brand hover:underline">
            Use-Case Draft
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-dl border border-dl-border bg-dl-surface p-8 shadow-card">
          <h1 className="text-3xl font-semibold leading-tight">
            Loss aversion, not gain framing — watch money leave in real time.
          </h1>
          <p className="mt-4 text-dl-text-secondary">
            CXO-facing, 90-minute remote session. Real customer numbers drive a live cost-of-inaction
            ledger; the room freezes the counter by committing to a pilot use case, then hands off
            with DAF on the partner path.
          </p>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase text-dl-text-secondary">White-label</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {BRAND_PRESETS.map((b) => (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => setBrand(b.name, b.accent)}
                  className={`rounded-dl border px-3 py-1.5 text-sm ${
                    state.brandName === b.name
                      ? "border-dl-brand bg-dl-brand/10 font-medium"
                      : "border-dl-border bg-dl-page"
                  }`}
                  style={
                    state.brandName === b.name
                      ? { borderColor: b.accent, color: b.accent }
                      : undefined
                  }
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          <Link
            to={journeyPath}
            data-testid="ghost-ledger-start"
            className="mt-10 inline-flex rounded-dl px-8 py-3 text-sm font-semibold text-white shadow-card"
            style={{ backgroundColor: state.brandAccent }}
          >
            Start Ghost Ledger
          </Link>
        </div>
      </main>
    </div>
  );
}
