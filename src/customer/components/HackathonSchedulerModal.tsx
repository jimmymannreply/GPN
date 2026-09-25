import { useEffect, useMemo, useState } from "react";
import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
} from "@/customer/utils/calendarCompose";
import type { SessionFormat } from "@/customer/hooks/useCustomerSession";
import { isDemoPreseedEnabled } from "@/customer/data/demoPreseed";

function defaultStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(10, 0, 0, 0);
  return d;
}

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function HackathonSchedulerModal({
  open,
  format,
  onClose,
}: {
  open: boolean;
  format: SessionFormat;
  onClose: () => void;
}) {
  const [startLocal, setStartLocal] = useState(() => toLocalInputValue(defaultStart()));
  const [durationHours, setDurationHours] = useState(2);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const formatLabel = format === "ledger" ? "Ghost ledger" : "Value sprint";
  const customerHint = isDemoPreseedEnabled() ? "Heartland Mutual Insurance" : "your account";

  const { googleHref, outlookHref } = useMemo(() => {
    const start = new Date(startLocal);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    const title = `Gemini value hackathon — ${formatLabel}`;
    const details = `Facilitated Gemini Enterprise session (${formatLabel}) for ${customerHint}.`;
    return {
      googleHref: buildGoogleCalendarUrl({ title, details, start, end }),
      outlookHref: buildOutlookCalendarUrl({ title, details, start, end }),
    };
  }, [startLocal, durationHours, formatLabel, customerHint]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hackathon-scheduler-title"
        data-testid="hackathon-scheduler"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="hackathon-scheduler-title" className="text-xl font-medium text-gray-900">
            Schedule a hackathon
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-800"
            aria-label="Close"
          >
            Close
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Pick a slot, then open Google Calendar or Outlook with the invite prefilled.
        </p>

        <label className="mt-6 block text-sm">
          <span className="text-gray-600">Start</span>
          <input
            type="datetime-local"
            value={startLocal}
            onChange={(e) => setStartLocal(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            data-testid="scheduler-start"
          />
        </label>
        <label className="mt-4 block text-sm">
          <span className="text-gray-600">Duration (hours)</span>
          <input
            type="number"
            min={1}
            max={8}
            value={durationHours}
            onChange={(e) => setDurationHours(Number(e.target.value) || 2)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            data-testid="scheduler-duration"
          />
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={googleHref}
            target="_blank"
            rel="noreferrer"
            data-testid="scheduler-google"
            className="rounded-full bg-[#1a73e8] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1765cc]"
          >
            Google Calendar
          </a>
          <a
            href={outlookHref}
            target="_blank"
            rel="noreferrer"
            data-testid="scheduler-outlook"
            className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Outlook
          </a>
        </div>
      </div>
    </div>
  );
}
