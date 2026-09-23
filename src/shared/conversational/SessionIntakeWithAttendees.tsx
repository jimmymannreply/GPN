import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { AttendeeProfile, LinkedInSimulation } from "../attendees/types";
import {
  formatLinkedInBubble,
  simulateLinkedInProfile,
} from "../attendees/simulateLinkedIn";
import type { ConversationalStep } from "./ConversationalIntake";
import { parseHeadcountInRange, parsePlainText } from "./parseIntakeReply";

type IntakePhase =
  | "prefix"
  | "headcount"
  | "name"
  | "linkedin"
  | "role"
  | "suffix"
  | "done";

export interface ChatTurn {
  role: "agent" | "user";
  text: string;
  testId?: string;
}

export interface SessionIntakeWithAttendeesProps {
  sessionKey: number;
  openingLine: string;
  accent: string;
  companyHint: string;
  prefixSteps: ConversationalStep[];
  headcountMin: number;
  headcountMax: number;
  headcountPrompt: string;
  suffixSteps: ConversationalStep[];
  onApplyField: (stepId: string, value: unknown) => void;
  onAttendeesChange: (attendees: AttendeeProfile[]) => void;
  onComplete: () => void;
}

function attendeeNamePrompt(index: number, count: number): string {
  return `Who's attendee ${index + 1} of ${count}? Full name.`;
}

const ROLE_PROMPT =
  "What's their role in this session? (For example: CXO sponsor, VP Ops, or IT director.)";

export function SessionIntakeWithAttendees({
  sessionKey,
  openingLine,
  accent,
  companyHint,
  prefixSteps,
  headcountMin,
  headcountMax,
  headcountPrompt,
  suffixSteps,
  onApplyField,
  onAttendeesChange,
  onComplete,
}: SessionIntakeWithAttendeesProps) {
  const [phase, setPhase] = useState<IntakePhase>(
    prefixSteps.length > 0 ? "prefix" : "headcount"
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [targetCount, setTargetCount] = useState(0);
  const [attendeeIndex, setAttendeeIndex] = useState(0);
  const [attendees, setAttendees] = useState<AttendeeProfile[]>([]);
  const [pendingName, setPendingName] = useState("");
  const [pendingLinkedIn, setPendingLinkedIn] =
    useState<LinkedInSimulation | null>(null);
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    const startsWithPrefix = prefixSteps.length > 0;
    setPhase(startsWithPrefix ? "prefix" : "headcount");
    setStepIndex(0);
    setDraft("");
    setError(null);
    setTargetCount(0);
    setAttendeeIndex(0);
    setAttendees([]);
    setPendingName("");
    setPendingLinkedIn(null);
    onAttendeesChange([]);
    setTurns([
      { role: "agent", text: openingLine },
      {
        role: "agent",
        text: startsWithPrefix ? prefixSteps[0].prompt : headcountPrompt,
      },
    ]);

    return () => {
      if (lookupTimer.current) clearTimeout(lookupTimer.current);
    };
    // sessionKey is the explicit reset signal for an intake session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey]);

  const currentStep =
    phase === "prefix"
      ? prefixSteps[stepIndex]
      : phase === "suffix"
        ? suffixSteps[stepIndex]
        : undefined;

  const appendUserAndAgent = (userText: string, agentText?: string) => {
    setTurns((previous) => {
      const next: ChatTurn[] = [...previous, { role: "user", text: userText }];
      if (agentText) next.push({ role: "agent", text: agentText });
      return next;
    });
  };

  const finishOrStartSuffix = (userText: string) => {
    if (suffixSteps.length > 0) {
      appendUserAndAgent(userText, suffixSteps[0].prompt);
      setStepIndex(0);
      setPhase("suffix");
    } else {
      appendUserAndAgent(userText);
      setPhase("done");
      onComplete();
    }
  };

  const submitStaticStep = (step: ConversationalStep) => {
    const result = step.parse(draft);
    if (!result.valid) {
      setError(result.error ?? "Try again.");
      return;
    }

    const userText = draft.trim();
    const nextIndex = stepIndex + 1;
    setDraft("");
    setError(null);
    onApplyField(step.id, result.value);

    if (phase === "prefix") {
      if (nextIndex < prefixSteps.length) {
        appendUserAndAgent(userText, prefixSteps[nextIndex].prompt);
        setStepIndex(nextIndex);
      } else {
        appendUserAndAgent(userText, headcountPrompt);
        setStepIndex(0);
        setPhase("headcount");
      }
      return;
    }

    if (nextIndex < suffixSteps.length) {
      appendUserAndAgent(userText, suffixSteps[nextIndex].prompt);
      setStepIndex(nextIndex);
    } else {
      appendUserAndAgent(userText);
      setPhase("done");
      onComplete();
    }
  };

  const submit = () => {
    if (phase === "prefix" || phase === "suffix") {
      if (currentStep) submitStaticStep(currentStep);
      return;
    }

    if (phase === "headcount") {
      const result = parseHeadcountInRange(draft, headcountMin, headcountMax);
      if (!result.valid) {
        setError(result.error ?? "Try again.");
        return;
      }

      const count = result.value;
      const userText = draft.trim();
      setDraft("");
      setError(null);
      setTargetCount(count);
      setAttendeeIndex(0);
      onApplyField("headcount", count);
      appendUserAndAgent(userText, attendeeNamePrompt(0, count));
      setPhase("name");
      return;
    }

    if (phase === "name") {
      const result = parsePlainText(draft);
      if (!result.valid) {
        setError(result.error ?? "Try again.");
        return;
      }

      const name = result.value;
      const linkedIn = simulateLinkedInProfile(name, companyHint);
      setDraft("");
      setError(null);
      setPendingName(name);
      setPendingLinkedIn(linkedIn);
      appendUserAndAgent(name, `Checking LinkedIn for ${name}…`);
      setPhase("linkedin");

      lookupTimer.current = setTimeout(() => {
        setTurns((previous) => [
          ...previous,
          {
            role: "agent",
            text: formatLinkedInBubble(name, linkedIn),
            testId: "linkedin-profile-bubble",
          },
          { role: "agent", text: ROLE_PROMPT },
        ]);
        setPhase("role");
        lookupTimer.current = null;
      }, 1200);
      return;
    }

    if (phase === "role") {
      const result = parsePlainText(draft);
      if (!result.valid) {
        setError(result.error ?? "Try again.");
        return;
      }
      if (!pendingLinkedIn) return;

      const userText = result.value;
      const nextAttendees = [
        ...attendees,
        { name: pendingName, role: result.value, linkedIn: pendingLinkedIn },
      ];
      setDraft("");
      setError(null);
      setAttendees(nextAttendees);
      onAttendeesChange(nextAttendees);

      const nextAttendeeIndex = attendeeIndex + 1;
      if (nextAttendeeIndex < targetCount) {
        appendUserAndAgent(
          userText,
          attendeeNamePrompt(nextAttendeeIndex, targetCount)
        );
        setAttendeeIndex(nextAttendeeIndex);
        setPendingName("");
        setPendingLinkedIn(null);
        setPhase("name");
      } else {
        finishOrStartSuffix(userText);
      }
    }
  };

  const inputId =
    phase === "headcount"
      ? "headcount"
      : phase === "name"
        ? "attendee-name"
        : phase === "role"
          ? "attendee-role"
          : currentStep?.id;
  const placeholder =
    phase === "name"
      ? "Full name"
      : phase === "role"
        ? "Role in this session"
        : currentStep?.placeholder;
  const multiline = currentStep?.multiline ?? false;
  const acceptsInput =
    phase === "prefix" ||
    phase === "headcount" ||
    phase === "name" ||
    phase === "role" ||
    phase === "suffix";

  return (
    <section
      className="rounded-dl border border-dl-border bg-dl-surface shadow-card"
      data-testid="conversational-intake"
    >
      <div className="max-h-80 space-y-3 overflow-y-auto p-4">
        {turns.map((turn, index) => (
          <div
            key={index}
            className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] whitespace-pre-line rounded-dl px-3 py-2 text-sm ${
                turn.role === "agent" ? "bg-dl-page text-dl-text" : "text-white"
              }`}
              style={
                turn.role === "user" ? { backgroundColor: accent } : undefined
              }
              data-testid={turn.testId}
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
      {phase === "linkedin" && (
        <div className="border-t border-dl-border p-4 text-sm text-dl-text-secondary">
          Looking up…
        </div>
      )}
      {acceptsInput && inputId && (
        <div className="border-t border-dl-border p-4">
          {error && <p className="mb-2 text-xs text-dl-danger">{error}</p>}
          <div className="flex gap-2">
            {multiline ? (
              <textarea
                className="min-h-[72px] flex-1 rounded-dl border border-dl-border px-3 py-2 text-sm"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={placeholder}
                data-testid={`intake-input-${inputId}`}
              />
            ) : (
              <input
                className="flex-1 rounded-dl border border-dl-border px-3 py-2 text-sm"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={placeholder}
                onKeyDown={(event) =>
                  event.key === "Enter" && !event.shiftKey && submit()
                }
                data-testid={`intake-input-${inputId}`}
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
