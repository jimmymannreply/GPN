import { Sparkles } from "lucide-react";
import type { GeminiBlueprint } from "@/shared/gemini/geminiBlueprint";

export function GeminiStackRibbon({ stackPhrase }: { stackPhrase?: string }) {
  return (
    <div
      className="rounded-dl border border-dl-border bg-gradient-to-r from-[#4285f4]/10 via-[#34a853]/10 to-[#fbbc04]/10 p-4 shadow-card"
      data-testid="gemini-stack-ribbon"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-dl bg-gradient-to-br from-[#4285f4] to-[#34a853] text-white"
        >
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-dl-text-secondary">
            Technology pillar · Gemini-ready outcomes
          </p>
          <p className="text-sm text-dl-text">
            Every use case maps to a <strong>Gemini on Google Cloud</strong> pattern — agents,
            grounding, and measurable pilots.{stackPhrase ? ` Stack: ${stackPhrase}.` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-1 text-[10px] font-medium text-dl-text-secondary">
          <span className="rounded-full bg-white/80 px-2 py-0.5">Co-sell</span>
          <span className="rounded-full bg-white/80 px-2 py-0.5">Services</span>
          <span className="rounded-full bg-[#4285f4]/15 px-2 py-0.5 text-[#1a73e8]">Technology</span>
        </div>
      </div>
    </div>
  );
}

export function GeminiBlueprintPanel({
  blueprint,
  compact,
}: {
  blueprint: GeminiBlueprint;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-dl border border-[#4285f4]/25 bg-gradient-to-br from-white to-[#e8f0fe] ${
        compact ? "p-2.5" : "p-3"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={`font-semibold text-[#1a73e8] ${compact ? "text-[11px]" : "text-xs"}`}>
          {blueprint.patternName}
        </p>
        <span className="rounded-full bg-[#1a73e8]/10 px-2 py-0.5 text-[10px] font-bold text-[#1a73e8]">
          Gemini fit {blueprint.geminiFit}
        </span>
      </div>
      <p className={`mt-1 text-dl-text-secondary ${compact ? "text-[10px] leading-snug" : "text-xs"}`}>
        {blueprint.pitch}
      </p>
      {!compact && (
        <>
          <p className="mt-2 text-[10px] font-medium uppercase text-dl-text-secondary">Google stack</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {blueprint.products.map((p) => (
              <span
                key={p}
                className="rounded bg-white px-1.5 py-0.5 text-[10px] text-dl-text shadow-sm"
              >
                {p}
              </span>
            ))}
          </div>
          <ol className="mt-2 list-decimal space-y-0.5 pl-4 text-[10px] text-dl-text-secondary">
            {blueprint.buildSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

export function GeminiFlowMini() {
  return (
    <div className="flex items-center justify-between gap-1 text-center text-[10px] text-dl-text-secondary">
      <span className="rounded-dl bg-dl-page px-2 py-1">Customer pain</span>
      <span className="text-[#1a73e8]">→</span>
      <span className="rounded-dl bg-[#e8f0fe] px-2 py-1 font-medium text-[#1a73e8]">Gemini agent</span>
      <span className="text-[#1a73e8]">→</span>
      <span className="rounded-dl bg-dl-success-bg px-2 py-1 text-dl-success">Pilot outcome</span>
    </div>
  );
}
