import { Link } from "react-router-dom";
import { useHackathonDraft } from "@/hackathon/hooks/useHackathonDraft";

const journeyPath = "/hackathon/journey";

const BRAND_PRESETS = [
  { name: "Softchoice", accent: "#0078D4" },
  { name: "CDW", accent: "#CC0000" },
  { name: "SoftwareOne", accent: "#6B2C91" },
];

export function LandingPageHackathon() {
  const { setBrand, state } = useHackathonDraft();

  return (
    <div className="min-h-screen bg-dl-page text-dl-text">
      <header className="border-b border-dl-border bg-dl-surface px-6 py-4 shadow-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-dl-text-secondary">
              Stage-fit hackathons
            </p>
            <p className="text-lg font-semibold">Use-Case Draft · Concept 2</p>
          </div>
          <div className="flex gap-3 text-sm">
            <Link to="/hackathon/ghost-ledger" className="text-dl-brand hover:underline">
              Ghost Ledger
            </Link>
            <Link to="/v3" className="text-dl-brand hover:underline">
              Partner Story V3
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-dl border border-dl-border bg-dl-surface p-8 shadow-card">
          <h1 className="text-3xl font-semibold leading-tight">
            Turn an open brainstorm into a forced, prioritized commitment.
          </h1>
          <p className="mt-4 text-dl-text-secondary">
            Agent-guided, virtual-first hackathon for partner pre-sales — each drafted use case ships
            with a <strong>Gemini on Google Cloud</strong> blueprint (agents, grounding, pilot path)
            plus audience-aware handoff with DAF at the partner seam.
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

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to={journeyPath}
              data-testid="hackathon-start"
              className="inline-flex rounded-dl px-8 py-3 text-sm font-semibold text-white shadow-card"
              style={{ backgroundColor: state.brandAccent }}
            >
              Start Use-Case Draft
            </Link>
          </div>
          <p className="mt-6 text-center text-xs text-dl-text-secondary">
            You focus on your customers — Co-sell, Services, and Technology run through one engine.
          </p>
        </div>
      </main>
    </div>
  );
}
