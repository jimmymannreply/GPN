# Partner Home + Customer Staged Session — Design Spec

**Date:** 2026-09-25  
**Status:** Approved (conversation); pending file review  
**App:** `partner-story-bot`  
**Inspiration:** [catalyst-poc-v2](https://karthikreply.github.io/catalyst-poc-v2/) home/run/funding/telemetry — **UI and telemetry defer to jimmymannreply**, not a Kartik clone.

## Goal

Give **Google Partners** (Softchoice, SHI, CDW) and **Google PDMs** a Catalyst-style program home, while **customers** get a thin dashboard (funding + session only) and a staged walkthrough that ends in **our** Gemini multi–business-case / pilot stack-rank behavior. Partner cohort telemetry remains **our** `/telemetry` page.

## Non-goals

- Pixel-faithful rebuild of Kartik’s run room or telemetry charts
- Real CRM / Salesforce / Dynamics integration
- Replacing existing `/hackathon*` partner deep links (they remain available)
- Showing partner cohort telemetry to customers

## Decisions (locked)

| Topic | Choice |
|--------|--------|
| Partner entry | `/` = partner/PDM home shell |
| Customer campaign entry | Keep `/customer` Gemini lookalike |
| Customer journey shape | New staged shell: CRM → Scope → Plan → Run → Produce artifacts |
| CRM | Simulated account find/add **then** LinkedIn person enrichment |
| Produce artifacts | Our Use-Case Draft board / Ghost Ledger freeze options (Gemini pilots) |
| Telemetry | Partners → our `/telemetry`; customers never |
| Visual system | Our existing Fluid Design / `dl-*` tokens |

## Routes

| Path | Audience | Purpose |
|------|----------|---------|
| `/` | Partner / PDM | Program home (sessions, funding, telemetry tiles) |
| `/telemetry` | Partner / PDM / PCM | Existing cohort roll-up (unchanged core) |
| `/funding` | Partner / PDM (+ customer deep links to own claim) | Simulated funding / DAF substantiation pack |
| `/customer` | Customer (campaign) | Gemini Enterprise lookalike |
| `/customer/dashboard` | Customer | Funding + session details only |
| `/customer/session` | Customer | Staged session shell (CRM…Produce artifacts) |
| `/customer/use-case-draft` | Customer | Existing journey (Produce artifacts path for Concept 2) |
| `/customer/ghost-ledger` | Customer | Existing journey (Produce artifacts path for Concept 4) |
| `/hackathon`, `/hackathon/ghost-ledger` | Partner | Existing concept landings / deep links |

Move today’s V1 `LandingPage` off `/` (or nest under `/v1`) so `/` can host the partner home without breaking demos that still need V1 — prefer `/v1` for the old root landing.

## Partner / PDM home (`/`)

Catalyst-inspired layout in **our** UI:

- Greeting + lens toggle: **Partner** | **PDM** (and optional CPM label) — filters copy/presets only (Softchoice / CDW / SHI / Softchoice-as-PDM).
- Primary tiles:
  - **Open value sessions** → list/links to `/hackathon` and `/hackathon/ghost-ledger` (and any in-progress mock sessions).
  - **Funding** → `/funding`
  - **Telemetry** → `/telemetry` (our dashboard, not Kartik’s)
- Secondary tiles (illustrative / disabled): Programs, Support — same idea as Catalyst “unavailable.”

## Customer dashboard (`/customer/dashboard`)

After campaign chooser (or sign-in), customer sees **only**:

- Current / recent **session** card(s): format (Value sprint / Ghost ledger), status (CRM…Produce artifacts / complete), partner of record.
- **Funding** strip: claim state (e.g. Draft / Submitted / Funded) and value figure when available — no partner cohort charts, no cross-customer funnel.

CTA: **Continue session** or **Start session** → `/customer/session?format=draft|ledger`.

## Customer staged session (`/customer/session`)

Explicit stepper (one job per stage):

1. **CRM** — Simulated CRM search/add by company (and optional contact). Mock hit list for Softchoice/CDW/SHI accounts. On confirm → LinkedIn person enrichment loop (reuse `SessionIntakeWithAttendees` / simulate LinkedIn helpers).
2. **Scope** — Conversational scoping (pain, outcome, constraints) in our chat UI; persists into session state.
3. **Plan** — Read-only / lightly editable plan summary (agreed scope, headcount/attendees, cost or use-case preview). Advance when customer confirms.
4. **Run** — Facilitated beat: for Ghost Ledger format, reuse ticking ledger; for Use-Case Draft, short facilitated checklist / snake-draft entry. Keep chrome light; defer visuals to existing components.
5. **Produce artifacts** — Hand off into existing customer journeys:
   - Format **Value sprint** → `/customer/use-case-draft` with `forceIntake` only if CRM/scope not yet done; preferred: land in **plan/draft** with session state prefilled so multi Gemini business cases appear for stack-rank.
   - Format **Ghost ledger** → `/customer/ghost-ledger` analogously for freeze / pilot options.

Prefer prefilling hooks from staged session state over forcing full re-intake when CRM+Scope already collected.

## Funding (`/funding`)

Simulated DAF / funding pack page inspired by Catalyst funding, styled with our tokens:

- Customer, use case, annual value, format, attributed room notes (from session), partner sponsor.
- States: Draft / Ready to submit / Submitted (demo toggles).
- Partner home and customer dashboard both deep-link here; customer view is **their** claim only.

## Telemetry

- Unchanged product: `TelemetryPage` + mock cohort at `/telemetry`.
- Partner home tile points here.
- No link from customer dashboard.

## Data (demo)

- Mock CRM accounts, mock funding claims, session stage persistence in `localStorage` (customer vs partner keys, same pattern as existing session scopes).
- No network CRM/LinkedIn.

## Success criteria

- Partner opens `/` and reaches our `/telemetry` and concept sessions without Kartik UI.
- Customer from `/customer` reaches a dashboard with only funding + session, then completes CRM → … → Produce artifacts using our Gemini multi-case behavior.
- Existing `/hackathon*` and `/telemetry` still work.
- Build + critical e2e (customer entry, telemetry route, staged session smoke) pass.

## Out of scope follow-ups

- Live CRM APIs
- True DAF portal submission
- Full Catalyst “attributed notes” capture UI parity
- Programs catalogue
