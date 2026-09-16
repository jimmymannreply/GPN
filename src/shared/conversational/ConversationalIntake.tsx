import { useEffect, useState } from "react";
import { Send } from "lucide-react";

export type IntakeParseResult = { valid: boolean; value: unknown; error?: string };

export interface ConversationalStep {
  id: string;
  prompt: string;
  placeholder?: string;
  multiline?: boolean;
  parse: (raw: string) => IntakeParseResult;
}

export interface ChatTurn {
  role: "agent" | "user";
  text: string;
}

export function ConversationalIntake({
  sessionKey,
  steps,
  onApply,
  onComplete,
  accent,
  openingLine,
}: {
  sessionKey: number;
  steps: ConversationalStep[];
  onApply: (stepId: string, value: unknown) => void;
  onComplete: () => void;
  accent: string;
  openingLine: string;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);

  useEffect(() => {
    setStepIndex(0);
    setDraft("");
    setError(null);
    setTurns([
      { role: "agent", text: openingLine },
      { role: "agent", text: steps[0]?.prompt ?? "" },
    ]);
  }, [sessionKey, openingLine, steps]);

  const current = steps[stepIndex];

  const submit = () => {
    if (!current) return;
    const result = current.parse(draft);
    if (!result.valid) {
      setError(result.error ?? "Try again.");
      return;
    }
    setError(null);
    onApply(current.id, result.value);
    const userText = draft.trim();
    setDraft("");
    const next = stepIndex + 1;
    setTurns((prev) => {
      const updated: ChatTurn[] = [...prev, { role: "user", text: userText }];
      if (next < steps.length) {
        updated.push({ role: "agent", text: steps[next].prompt });
      }
      return updated;
    });
    if (next >= steps.length) {
      onComplete();
    } else {
      setStepIndex(next);
    }
  };

  if (!current && stepIndex >= steps.length) {
    return null;
  }

  return (
    <section
      className="rounded-dl border border-dl-border bg-dl-surface shadow-card"
      data-testid="conversational-intake"
    >
      <div className="max-h-80 space-y-3 overflow-y-auto p-4">
        {turns.map((turn, i) => (
          <div
            key={i}
            className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-dl px-3 py-2 text-sm ${
                turn.role === "agent" ? "bg-dl-page text-dl-text" : "text-white"
              }`}
              style={turn.role === "user" ? { backgroundColor: accent } : undefined}
            >
              {turn.role === "agent" && (
                <p className="mb-1 text-[10px] font-semibold uppercase text-dl-text-secondary">
                  Agent
                </p>
              )}
              {turn.text}
            </div>
          </div>
        ))}
      </div>
      {stepIndex < steps.length && current && (
        <div className="border-t border-dl-border p-4">
          {error && <p className="mb-2 text-xs text-dl-danger">{error}</p>}
          <div className="flex gap-2">
            {current.multiline ? (
              <textarea
                className="min-h-[72px] flex-1 rounded-dl border border-dl-border px-3 py-2 text-sm"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={current.placeholder}
                data-testid={`intake-input-${current.id}`}
              />
            ) : (
              <input
                className="flex-1 rounded-dl border border-dl-border px-3 py-2 text-sm"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={current.placeholder}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
                data-testid={`intake-input-${current.id}`}
              />
            )}
            <button
              type="button"
              onClick={submit}
              className="inline-flex items-center gap-1 rounded-dl px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: accent }}
              data-testid="intake-send"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
