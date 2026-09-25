# Business-case next actions + Catalyst ledger restyle — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After format choice in the business-case modal, show next actions (schedule / DAF / partner session), demo pre-seed for faster demos, and Catalyst-style Ghost Ledger Run UI on `/customer/ghost-ledger`.

**Architecture:** Two-step `BusinessCaseModal`; `HackathonSchedulerModal` builds Google/Outlook compose URLs; demo pre-seed helper writes staged + journey seeds without wiping via `startSession`; restyle `TickingLedger` (+ customer run chrome).

**Tech Stack:** React, React Router 6, Vite, Playwright, existing `dl-*` tokens / Google blue on customer landing.

## Global Constraints

- Keep `/customer/ghost-ledger` (no Catalyst iframe).
- Calendar: compose URLs only (no OAuth).
- DAF → `/funding` only (POC).
- Pre-seed must not be wiped by `startSession` when demo toggle is on.
- Spec: `docs/superpowers/specs/2026-09-25-business-case-next-actions-design.md`

## File map

| File | Responsibility |
|------|----------------|
| `src/customer/data/demoPreseed.ts` | Build staged session + journey seed payloads; apply to storage |
| `src/customer/utils/calendarCompose.ts` | Google + Outlook compose URL builders |
| `src/customer/components/HackathonSchedulerModal.tsx` | Scheduler dialog |
| `src/customer/components/BusinessCaseModal.tsx` | Two-step format → next actions |
| `src/customer/pages/GeminiEnterpriseLookalike.tsx` | Demo pre-seed toggle |
| `src/customer/pages/CustomerDashboardPage.tsx` | Honor `preserveSeed` / skip reset |
| `src/ghost-ledger/components/TickingLedger.tsx` | Catalyst-style hero ticker |
| `e2e/customer-gemini.spec.ts` | Next actions, schedule, DAF, pre-seed |
| `e2e/customer-stages.spec.ts` | Adjust if modal no longer auto-navigates on format click |

---

### Task 1: Calendar compose helpers + demo preseed data

**Files:**
- Create: `src/customer/utils/calendarCompose.ts`
- Create: `src/customer/data/demoPreseed.ts`

**Interfaces:**
- Produces:
  - `buildGoogleCalendarUrl(opts: { title: string; details: string; start: Date; end: Date }): string`
  - `buildOutlookCalendarUrl(opts: { title: string; details: string; start: Date; end: Date }): string`
  - `DEMO_PRESEED_STORAGE_KEY = "customer-demo-preseed-v1"`
  - `isDemoPreseedEnabled(): boolean`
  - `setDemoPreseedEnabled(on: boolean): void`
  - `applyDemoPreseed(format: "draft" | "ledger"): void` — writes `customer-staged-session-v1` + `customer-session-seed-v1`

- [ ] **Step 1: Implement calendarCompose.ts**

```ts
function toGoogleDates(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
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
```

- [ ] **Step 2: Implement demoPreseed.ts**

Use `MOCK_CRM_ACCOUNTS` heartland id, `simulateLinkedInProfile`, `DEFAULT_FUNDING_CLAIM`. Stage `"plan"`. Journey seed shape matches Task 7 `CustomerSessionSeed`.

```ts
export const DEMO_PRESEED_STORAGE_KEY = "customer-demo-preseed-v1";
export const STAGED_SESSION_KEY = "customer-staged-session-v1";
export const JOURNEY_SEED_KEY = "customer-session-seed-v1";

export function isDemoPreseedEnabled(): boolean {
  return sessionStorage.getItem(DEMO_PRESEED_STORAGE_KEY) === "1";
}

export function setDemoPreseedEnabled(on: boolean): void {
  sessionStorage.setItem(DEMO_PRESEED_STORAGE_KEY, on ? "1" : "0");
}

export function applyDemoPreseed(format: "draft" | "ledger"): void {
  // build CustomerSessionState at stage plan + write localStorage
  // build journey seed + write sessionStorage
}
```

- [ ] **Step 3: `npx tsc -b --pretty false`** — pass

- [ ] **Step 4: Commit**

```bash
git add src/customer/utils/calendarCompose.ts src/customer/data/demoPreseed.ts
git commit -m "Add calendar compose helpers and demo preseed payloads."
```

---

### Task 2: HackathonSchedulerModal + two-step BusinessCaseModal

**Files:**
- Create: `src/customer/components/HackathonSchedulerModal.tsx`
- Modify: `src/customer/components/BusinessCaseModal.tsx`
- Modify: `src/customer/pages/CustomerDashboardPage.tsx` — support `preserveSeed`

**Interfaces:**
- Consumes: `buildGoogleCalendarUrl`, `buildOutlookCalendarUrl`, `isDemoPreseedEnabled`, `applyDemoPreseed`
- Produces: modal steps `"format" | "next"`; test ids `next-schedule-hackathon`, `next-apply-daf`, `next-partner-session`, `hackathon-scheduler`

- [ ] **Step 1: Update e2e expectations (fail first)**

In `e2e/customer-gemini.spec.ts`, change format-click tests to expect next-action buttons (not immediate dashboard). Add Partner → dashboard, DAF → funding, schedule dialog tests.

Also update `e2e/customer-stages.spec.ts` campaign chooser tests to click `next-partner-session` after format choice.

- [ ] **Step 2: Run Playwright — expect FAIL on old navigate-on-format**

Run: `npx playwright test e2e/customer-gemini.spec.ts e2e/customer-stages.spec.ts`

- [ ] **Step 3: Implement HackathonSchedulerModal**

Date/time/duration inputs; links `data-testid="scheduler-google"` / `scheduler-outlook"` with hrefs from helpers; open in new tab.

- [ ] **Step 4: Implement two-step BusinessCaseModal**

- Format buttons set local `format` state → step `"next"` (no navigate).
- Schedule → open scheduler (pass format label).
- DAF → `navigate("/funding")`.
- Partner → if `isDemoPreseedEnabled()` then `applyDemoPreseed(format)` and `navigate("/customer/dashboard", { state: { format, startSession: false, preserveSeed: true } })`; else `{ format, startSession: true }`.
- Back → step format; Close/Escape reset.

- [ ] **Step 5: Dashboard preserveSeed**

```ts
type DashboardNavState = {
  format?: SessionFormat;
  startSession?: boolean;
  preserveSeed?: boolean;
};
// if startSession && !preserveSeed → startSession(format)
// if preserveSeed only → do not call startSession; clear nav state
```

- [ ] **Step 6: Playwright pass + commit**

```bash
git add src/customer e2e/customer-gemini.spec.ts e2e/customer-stages.spec.ts
git commit -m "Add next-action step, hackathon scheduler, and dashboard seed preserve."
```

---

### Task 3: Demo pre-seed toggle on Gemini landing

**Files:**
- Modify: `src/customer/pages/GeminiEnterpriseLookalike.tsx`
- Modify: `e2e/customer-gemini.spec.ts` — pre-seed → Partner → Heartland on dashboard

- [ ] **Step 1: Add checkbox** `data-testid="demo-preseed"` near Build CTA; sync with `isDemoPreseedEnabled` / `setDemoPreseedEnabled`.

- [ ] **Step 2: E2e** enable preseed → format draft → partner session → expect dashboard text `/Heartland/i`.

- [ ] **Step 3: Commit**

```bash
git add src/customer/pages/GeminiEnterpriseLookalike.tsx e2e/customer-gemini.spec.ts
git commit -m "Add demo pre-seed toggle on customer Gemini landing."
```

---

### Task 4: Catalyst-style Ghost Ledger Run restyle

**Files:**
- Modify: `src/ghost-ledger/components/TickingLedger.tsx`
- Modify: `src/ghost-ledger/pages/JourneyPageGhostLedger.tsx` (customerMode run section chrome if needed)

- [ ] **Step 1: Restyle ticker** — larger hero figure (`text-5xl`/`text-6xl`), denser uppercase eyebrow, optional thin progress/bleed bar; keep `data-testid="ghost-ledger-counter"`.

- [ ] **Step 2: Customer run header** — when `customerMode && phase === "run"`, denser program-shell copy (“Partner network · Value session” style) without breaking partner brand.

- [ ] **Step 3: `npm run build` + playwright gemini/stages**

- [ ] **Step 4: Commit**

```bash
git add src/ghost-ledger
git commit -m "Restyle Ghost Ledger Run ticker toward Catalyst look."
```

---

### Task 5: Final verification

- [ ] **Step 1:** `npm run build`
- [ ] **Step 2:** `npx playwright test e2e/customer-gemini.spec.ts e2e/customer-stages.spec.ts e2e/partner-home.spec.ts`
- [ ] **Step 3:** Do not push unless user asks

## Spec coverage

| Spec item | Task |
|-----------|------|
| Two-step modal | 2 |
| Three next actions | 2 |
| Scheduler Calendar/Outlook | 1–2 |
| DAF → funding | 2 |
| Partner → dashboard | 2 |
| Pre-seed preserve | 1–3 |
| Catalyst Run restyle | 4 |
| E2e | 2–5 |
