# Business-case next actions + Catalyst ledger restyle — Design Spec

**Date:** 2026-09-25  
**Status:** Approved (conversation); pending file review  
**App:** `partner-story-bot`

## Goal

After a customer picks a business-case format (Use-Case Draft vs Ghost Ledger), present clear **next actions** (schedule hackathon, apply for DAF, partner-facilitated session). Restyle the customer Ghost Ledger **Run** UI toward Karthick’s Catalyst look while keeping our route and data model. Offer a **demo pre-seed** so walkthroughs skip empty CRM/scope.

## Non-goals

- Deep-linking or iframe to `karthikreply.github.io/catalyst-poc-v2`
- Real calendar OAuth / booked-meeting backends
- Replacing partner `/hackathon/ghost-ledger` with a separate product
- Real DAF portal submission (POC navigate to `/funding` only)
- Pixel-perfect clone of Catalyst telemetry charts

## Decisions (locked)

| Topic | Choice |
|--------|--------|
| Ghost Ledger | Keep `/customer/ghost-ledger`; restyle Run/ticker/freeze toward Catalyst |
| Next-actions placement | Step 2 of `BusinessCaseModal`, immediately after format choice |
| Modal structure | Two-step modal (format → next actions) |
| Schedule hackathon | Scheduler popup → Google Calendar **or** Outlook compose URL (prefilled) |
| Apply for DAF | Navigate to `/funding` |
| Partner facilitated session | Navigate to `/customer/dashboard`; start or preserve session per pre-seed |
| Demo pre-seed | Toggle on Gemini landing; seeds staged session + journey seed on Partner CTA |

## Flow

```
/customer → Build my business case
  → Step 1: format (draft | ledger)
  → Step 2: next actions
       ├─ Schedule a hackathon… → HackathonSchedulerModal → Calendar/Outlook compose
       ├─ Choose one and apply for DAF now → /funding
       └─ Have my Partner run a facilitated session → /customer/dashboard
```

Optional: **Pre-fill demo data** on `/customer` before or while opening the modal.

**Partner CTA + pre-seed interaction (explicit):**  
`startSession(format)` currently resets to empty CRM. Do **not** wipe demo data:

- Pre-seed **off:** navigate `{ format, startSession: true }` (unchanged).
- Pre-seed **on:** write seeded `customer-staged-session-v1` (and `customer-session-seed-v1`), then navigate `{ format, startSession: false }` **or** `{ format, startSession: true, preserveSeed: true }` where dashboard skips reset when seed already present with matching format.

## Components

### `BusinessCaseModal`

- Internal step: `"format" | "next"`.
- Step 1: existing `choose-use-case-draft` / `choose-ghost-ledger` set `format` and advance to `"next"` (no navigate yet).
- Step 2 CTAs (`data-testid`):
  - `next-schedule-hackathon`
  - `next-apply-daf`
  - `next-partner-session`
- Back control returns to step 1.
- Close/Escape resets step and closes.

### `HackathonSchedulerModal`

- Fields: date, start time, duration (defaults OK for demo).
- Actions: **Google Calendar**, **Outlook** — open compose links in a new tab.
- Prefill:
  - Title: e.g. `Gemini value hackathon — Value sprint` or `… — Ghost ledger`
  - Body: format + demo customer name if pre-seeded
- `data-testid="hackathon-scheduler"`; Escape/Close.

Compose URL construction is client-side only (no API keys). Prefer well-known patterns:

- Google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=…&details=…`
- Outlook web: `https://outlook.live.com/calendar/0/action/compose?subject=…&startdt=…&enddt=…&body=…`

### Demo pre-seed

- Control on `GeminiEnterpriseLookalike` near Build CTA: `data-testid="demo-preseed"` (checkbox or toggle).
- Preference in `sessionStorage` key `customer-demo-preseed-v1` (`"1"` / `"0"`).
- When **on** and user clicks **Partner facilitated session**:
  - Write `customer-staged-session-v1` with Heartland Mutual (`MOCK_CRM_ACCOUNTS` heartland id), 1–2 attendees with simulated LinkedIn, filled scope, **`stage: "plan"`**, `format` matching chosen format, funding from `DEFAULT_FUNDING_CLAIM`.
  - Always also write `customer-session-seed-v1` from that session so Produce artifacts can land on plan without intake.
- When **off:** no seed writes; Partner CTA uses empty `startSession` as today.
- Label copy: clear **Demo** wording.

### Ghost Ledger Run restyle (customer)

- Scope: `TickingLedger` and Run/outcome chrome used from `JourneyPageGhostLedger` when `customerMode`.
- Visual direction (Catalyst-inspired, our tokens):
  - Stronger live-loss hero (larger figure, clearer “cost of waiting” hierarchy)
  - Denser program-shell header treatment for the run beat
  - Keep freeze option cards and handoff; no cohort telemetry
- Partner path may share component polish if zero-cost; do not break partner branding.

## Data / storage

| Key | Role |
|-----|------|
| `customer-demo-preseed-v1` | sessionStorage — demo toggle |
| `customer-staged-session-v1` | localStorage — staged session (existing); pre-seed writes here |
| `customer-session-seed-v1` | sessionStorage — journey seed (existing); optional on pre-seed |

## Testing

- `e2e/customer-gemini.spec.ts`: after format click, expect next-action test ids (not immediate `/customer/dashboard`).
- Partner CTA → dashboard with session started.
- DAF CTA → `/funding`.
- Schedule → scheduler visible; Calendar/Outlook anchors include expected hosts.
- Pre-seed on → Partner path shows Heartland (or seeded company) on dashboard/session.
- Manual: customer Ghost Ledger Run visual check.
- `npm run build` + relevant Playwright suites green.

## Spec coverage checklist

| Item | Covered |
|------|---------|
| Two-step modal after format choice | Yes |
| Three next actions + destinations | Yes |
| Scheduler → Calendar/Outlook compose | Yes |
| Catalyst-style Run restyle, keep route | Yes |
| Demo pre-seed | Yes |
| No Kartik iframe / no real OAuth | Yes |
