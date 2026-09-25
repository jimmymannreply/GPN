function toGoogleDates(start: Date, end: Date): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return `${fmt(start)}/${fmt(end)}`;
}

export function buildGoogleCalendarUrl(opts: {
  title: string;
  details: string;
  start: Date;
  end: Date;
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    details: opts.details,
    dates: toGoogleDates(opts.start, opts.end),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function buildOutlookCalendarUrl(opts: {
  title: string;
  details: string;
  start: Date;
  end: Date;
}): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: opts.title,
    body: opts.details,
    startdt: opts.start.toISOString(),
    enddt: opts.end.toISOString(),
  });
  return `https://outlook.live.com/calendar/0/action/compose?${params}`;
}
