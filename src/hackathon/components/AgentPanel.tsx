import { Sparkles } from "lucide-react";

export function AgentPanel({ message, accent }: { message: string; accent: string }) {
  return (
    <div
      className="rounded-dl border border-dl-border bg-dl-surface p-4 shadow-card"
      style={{ borderLeftWidth: 4, borderLeftColor: accent }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-dl text-white"
          style={{ background: `linear-gradient(135deg, ${accent}, #2F6F4E)` }}
        >
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-dl-text-secondary">
            Hackathon agent
          </p>
          <p className="mt-1 text-sm leading-relaxed text-dl-text">{message}</p>
        </div>
      </div>
    </div>
  );
}
