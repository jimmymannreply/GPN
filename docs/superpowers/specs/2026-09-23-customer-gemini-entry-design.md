# Customer Gemini Enterprise Entry — Design Spec

**Date:** 2026-09-23  
**Status:** Approved (conversation); pending file review  
**App:** `partner-story-bot`

## Goal

Give a **customer** a demo path that starts on a **lookalike** of the [Gemini Enterprise](https://cloud.google.com/gemini-enterprise) marketing page. The only intentional CTA change vs that page’s trial path: replace trial with **Build my business case**, then let them choose Concept 2 or Concept 4 under **customer-friendly names**, and enter the existing conversational agents on **customer-specific routes** (no partner white-label landings).

## Non-goals

- Pixel-perfect clone or iframe of cloud.google.com
- Changing partner paths (`/hackathon`, `/hackathon/ghost-ledger`)
- New agent logic beyond reuse of existing Use-Case Draft and Ghost Ledger flows
- Real Google Trial / billing integration

## Decisions (locked)

| Topic | Choice |
|--------|--------|
| Page fidelity | Lookalike: hero + key sections (not full-page recreation, not iframe) |
| Choice labels | Customer-friendly: **Prioritize my use cases** / **Show me the cost of waiting** |
| After choice | Customer-specific routes; reuse agents; strip partner marketing chrome |
| CTA UX | Modal on the lookalike page |

## User flow

1. Customer opens `/customer`.
2. Sees Gemini Enterprise–style lookalike (Google Cloud blue/white, hero, short feature strips, pricing-ish section).
3. Clicks **Build my business case** (where Trial would appear on the real page — at least hero primary CTA; also on edition cards if present).
4. Modal opens with two options:
   - **Prioritize my use cases** → Concept 2 (Use-Case Draft)
   - **Show me the cost of waiting** → Concept 4 (Ghost Ledger)
5. Selection navigates to the matching customer journey and starts conversational intake.

Partner demo landings remain available at existing URLs for sales/partner use.

## Routes

| Path | Purpose |
|------|---------|
| `/customer` | Gemini Enterprise lookalike + Build my business case modal |
| `/customer/use-case-draft` | Customer Use-Case Draft journey (Concept 2 agent) |
| `/customer/ghost-ledger` | Customer Ghost Ledger journey (Concept 4 agent) |

Existing:

| Path | Purpose |
|------|---------|
| `/hackathon` | Partner landing — Use-Case Draft |
| `/hackathon/journey` | Partner journey — Use-Case Draft |
| `/hackathon/ghost-ledger` | Partner landing — Ghost Ledger |
| `/hackathon/ghost-ledger/journey` | Partner journey — Ghost Ledger |

## UI details

### Lookalike page (`/customer`)

- Visual direction: Google Cloud marketing feel (white/light gray, Google blue primary, clean sans, generous hero).
- Content: hero headline/subcopy inspired by Gemini Enterprise; 2–4 short feature sections; optional simplified “editions” strip with the same CTA.
- Primary CTA label: **Build my business case** (not “Start 30-day trial”).
- Optional secondary links (Contact sales, etc.) may be non-functional or `#` stubs for demo.

### Modal

- Title: **Build my business case**
- Two large choices (cards or buttons), each with:
  - Customer-friendly title
  - One-line blurb (no “Concept 2/4” jargon on this surface)
- Escape / close without navigating

Suggested blurbs:

- **Prioritize my use cases** — “Draft and rank Gemini-ready use cases with your team in the room.”
- **Show me the cost of waiting** — “Watch the cost of inaction tick, then freeze a Gemini reversal play.”

### Customer journeys

- Reuse `HackathonDraftProvider` / `GhostLedgerProvider` and journey UI (conversational intake, plan, draft/run, outcome, handoff).
- **Do not** show Softchoice / CDW / SoftwareOne white-label picker.
- Light demo chrome only (e.g. product name + Reset); Google sign-in gate behavior may match existing journeys unless it blocks the customer demo — prefer allowing the same demo-without-client-id path already used.
- Deep-link from modal should land ready for intake (same as partner “Start” into journey).

## Implementation sketch

- New module under `src/customer/`:
  - `pages/GeminiEnterpriseLookalike.tsx` — lookalike + modal
  - `pages/CustomerUseCaseDraftJourney.tsx` — thin wrapper or route to shared journey with `customerMode`
  - `pages/CustomerGhostLedgerJourney.tsx` — same for Ghost Ledger
- Prefer **props / route flag** on existing journey pages over full duplication when small differences suffice (hide brand picker, adjust header copy).
- Wire routes in `App.tsx`.
- Update GitHub Pages SPA fallback copies for `/customer`, `/customer/use-case-draft`, `/customer/ghost-ledger` if the deploy workflow lists path copies.

## Telemetry / test IDs

- `data-testid="build-business-case"` on primary CTA
- `data-testid="choose-use-case-draft"` / `data-testid="choose-ghost-ledger"` on modal options
- `data-testid="customer-gemini-landing"` on lookalike root

## Success criteria

- From `/customer`, a customer can open the modal and reach either conversational agent without visiting partner landings.
- Partner `/hackathon*` flows unchanged.
- Production build passes; GPN Pages serves the new routes after deploy.

## Out of scope follow-ups

- True Google Docs API, voice intake
- Pixel-perfect section parity with the live Gemini Enterprise page
- Analytics beyond existing app patterns
