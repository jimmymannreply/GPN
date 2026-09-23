import { Link } from "react-router-dom";
import {
  FUNNEL,
  PCM_PERSONA,
  RECENT_SESSIONS,
  SESSIONS_BY_FORMAT,
  SESSIONS_BY_PARTNER,
  SESSIONS_BY_PATTERN,
  TELEMETRY_KPIS,
  type SessionOutcome,
} from "@/telemetry/data/mockCohort";

function outcomeClass(outcome: SessionOutcome): string {
  if (outcome === "Pilot proposed") return "bg-amber-100 text-amber-900";
  if (outcome === "Pilot funded") return "bg-emerald-100 text-emerald-900";
  if (outcome === "Run") return "bg-sky-100 text-sky-900";
  return "bg-gray-100 text-gray-700";
}

function BarRow({
  label,
  value,
  max,
  detail,
}: {
  label: string;
  value: number;
  max: number;
  detail?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-gray-800">{label}</span>
        <span className="shrink-0 font-medium text-gray-900">{detail ?? value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-[#1e3a5f]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function TelemetryPage() {
  const partnerMax = Math.max(...SESSIONS_BY_PARTNER.map((p) => p.sessions));
  const patternMax = Math.max(...SESSIONS_BY_PATTERN.map((p) => p.total));
  const formatMax = Math.max(...SESSIONS_BY_FORMAT.map((f) => f.total));

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-900" data-testid="pcm-telemetry">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <p className="text-xs font-medium text-gray-500">
              My partners — {PCM_PERSONA.name}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Partner value-session telemetry.</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-600">{TELEMETRY_KPIS.cohortNote}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link to="/hackathon" className="text-[#1a73e8] hover:underline">
              Use-Case Draft
            </Link>
            <Link to="/hackathon/ghost-ledger" className="text-[#1a73e8] hover:underline">
              Ghost Ledger
            </Link>
            <Link to="/customer" className="text-[#1a73e8] hover:underline">
              Customer entry
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Sessions run", value: TELEMETRY_KPIS.sessionsRun },
            { label: "Pilots proposed", value: TELEMETRY_KPIS.pilotsProposed },
            { label: "Pilots funded", value: TELEMETRY_KPIS.pilotsFunded },
            { label: "Funded pilot value", value: TELEMETRY_KPIS.fundedPilotValueLabel },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{kpi.label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{kpi.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Sessions by partner</h2>
            <div className="mt-4 space-y-3">
              {SESSIONS_BY_PARTNER.map((row) => (
                <BarRow key={row.partner} label={row.partner} value={row.sessions} max={partnerMax} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">
              Sessions by pattern · visible cohort n=251
            </h2>
            <div className="mt-4 space-y-3">
              {SESSIONS_BY_PATTERN.map((row) => (
                <BarRow
                  key={row.pattern}
                  label={row.pattern}
                  value={row.total}
                  max={patternMax}
                  detail={`${row.funded} funded of ${row.total}`}
                />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">
              Sessions by format · visible cohort n=251
            </h2>
            <div className="mt-4 space-y-3">
              {SESSIONS_BY_FORMAT.map((row) => {
                const conv = row.total ? Math.round((row.funded / row.total) * 100) : 0;
                return (
                  <BarRow
                    key={row.format}
                    label={row.format}
                    value={row.total}
                    max={formatMax}
                    detail={`${row.funded} funded of ${row.total} · ${conv}% conversion`}
                  />
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Conversion funnel</h2>
          <div className="mt-4 flex flex-wrap items-stretch gap-2">
            {FUNNEL.map((step, i) => (
              <div key={step.label} className="flex min-w-[7rem] flex-1 items-center gap-2">
                <div className="flex-1 rounded-lg bg-[#1e3a5f] px-3 py-3 text-center text-white">
                  <p className="text-[11px] uppercase tracking-wide text-white/80">{step.label}</p>
                  <p className="text-xl font-semibold tabular-nums">{step.count}</p>
                </div>
                {i < FUNNEL.length - 1 && (
                  <span className="hidden text-gray-400 sm:inline" aria-hidden>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent sessions</h2>
            <p className="text-xs text-gray-500">Live Heartland overlay shown first.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Partner</th>
                  <th className="px-4 py-3 font-medium">Industry segment</th>
                  <th className="px-4 py-3 font-medium">Pattern</th>
                  <th className="px-4 py-3 font-medium">Who ran it</th>
                  <th className="px-4 py-3 font-medium">Format</th>
                  <th className="px-4 py-3 font-medium">Qualification</th>
                  <th className="px-4 py-3 font-medium">Outcome</th>
                  <th className="px-4 py-3 font-medium">Quarter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {RECENT_SESSIONS.map((row, i) => (
                  <tr key={`${row.partner}-${row.quarter}-${i}`} className="bg-white">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.partner}
                      {row.liveOverlay && (
                        <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-rose-700">
                          Live
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{row.industry}</td>
                    <td className="px-4 py-3 text-gray-700">{row.pattern}</td>
                    <td className="px-4 py-3 text-gray-700">{row.whoRan}</td>
                    <td className="px-4 py-3 text-gray-700">{row.format}</td>
                    <td className="px-4 py-3 text-gray-700">{row.qualification}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${outcomeClass(row.outcome)}`}
                      >
                        {row.outcome}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gray-700">{row.quarter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="pb-8 text-center text-xs text-gray-500">
          Simulated cohort for Partner Channel Manager demo — not live production telemetry.
        </p>
      </main>
    </div>
  );
}
