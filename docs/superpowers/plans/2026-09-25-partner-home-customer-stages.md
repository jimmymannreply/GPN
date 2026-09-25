# Partner Home + Customer Staged Session Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Catalyst-style partner/PDM home at `/`, a funding page, a thin customer dashboard, and a staged customer session (CRM → Scope → Plan → Run → Produce artifacts) that hands off into our existing Gemini multi–business-case journeys—while keeping our `/telemetry` as the partner roll-up.

**Architecture:** New `src/partner-home/` and `src/customer/` pages plus a `CustomerSessionProvider` (localStorage) that owns stage state. Partner home replaces `/`; old V1 landing moves to `/v1`. Produce-artifacts seeds draft/ledger hooks then navigates to existing customer journeys at plan/draft (not full re-intake when CRM+Scope done). Visuals use existing `dl-*` tokens—no Kartik clone.

**Tech Stack:** React 18, React Router 6, Vite, Tailwind `dl-*`, Playwright, TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-25-partner-home-customer-stages-design.md`

## Global Constraints

- `/` = partner/PDM home; `/customer` stays Gemini lookalike campaign entry.
- Customer staged shell: **CRM → Scope → Plan → Run → Produce artifacts**.
- CRM = simulated account find/add **then** LinkedIn person enrichment (reuse existing helpers).
- Produce artifacts = our Use-Case Draft / Ghost Ledger Gemini boards (not Kartik UI).
- Partners use our `/telemetry`; customers never see cohort telemetry.
- Visual system: existing Fluid Design / `dl-*` tokens.
- No real CRM/LinkedIn network calls.
- Keep `/hackathon*` deep links working.

## Scope note

Tasks 1–3 (partner home, funding, routing) are independently demoable. Tasks 4–7 (customer dashboard + staged session + seed handoff) build on that. Prefer shipping in order.

## File map

| File | Responsibility |
|------|----------------|
| `src/partner-home/pages/PartnerHomePage.tsx` | Partner/PDM home at `/` |
| `src/partner-home/pages/FundingPage.tsx` | Simulated DAF pack |
| `src/partner-home/data/mockFunding.ts` | Mock funding claim |
| `src/customer/hooks/useCustomerSession.tsx` | Stage state + persistence |
| `src/customer/data/mockCrm.ts` | Simulated CRM accounts |
| `src/customer/pages/CustomerDashboardPage.tsx` | Funding + session only |
| `src/customer/pages/CustomerSessionPage.tsx` | Staged stepper shell |
| `src/customer/components/CrmFindStep.tsx` | CRM find/add UI |
| `src/customer/components/SessionStageStepper.tsx` | Stage chrome |
| `src/customer/components/BusinessCaseModal.tsx` | Route to dashboard/session |
| `src/App.tsx` | Routes: `/`, `/v1`, `/funding`, `/customer/dashboard`, `/customer/session` |
| `.github/workflows/deploy-pages.yml` | SPA copies for new paths |
| `e2e/partner-home.spec.ts`, `e2e/customer-stages.spec.ts` | Coverage |

---

### Task 1: Move V1 root to `/v1` and add PartnerHomePage at `/`

**Files:**
- Create: `src/partner-home/pages/PartnerHomePage.tsx`
- Modify: `src/App.tsx`
- Test: `e2e/partner-home.spec.ts` (scaffold; expand in Task 3)

**Interfaces:**
- Produces: `PartnerHomePage` with `data-testid="partner-home"`
- Lens state local: `"partner" | "pdm"`
- Tiles link to `/hackathon`, `/hackathon/ghost-ledger`, `/funding`, `/telemetry`

- [ ] **Step 1: Create PartnerHomePage**

```tsx
// src/partner-home/pages/PartnerHomePage.tsx
import { useState } from "react";
import { Link } from "react-router-dom";

const LENSES = [
  { id: "partner" as const, label: "Partner lens" },
  { id: "pdm" as const, label: "PDM lens" },
];

export function PartnerHomePage() {
  const [lens, setLens] = useState<"partner" | "pdm">("partner");
  const greeting = lens === "pdm" ? "Hello, Google PDM" : "Hello, partner facilitator";

  return (
    <div className="min-h-screen bg-dl-page text-dl-text" data-testid="partner-home">
      <header className="border-b border-dl-border bg-dl-surface px-6 py-4">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-wider text-dl-text-secondary">
            Partner network · Value sessions
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{greeting}</h1>
          <p className="mt-2 max-w-2xl text-sm text-dl-text-secondary">
            Launch and govern partner-led value sessions. Evidence and document ownership stay with
            the partner; program telemetry stays on our roll-up.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {LENSES.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLens(l.id)}
                className={`rounded-dl border px-3 py-1.5 text-sm ${
                  lens === l.id
                    ? "border-dl-brand bg-dl-brand/10 font-medium text-dl-brand"
                    : "border-dl-border bg-dl-page"
                }`}
                data-testid={`lens-${l.id}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-4 px-6 py-10 sm:grid-cols-2">
        <section className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card sm:col-span-2">
          <h2 className="text-lg font-semibold">Open value sessions</h2>
          <p className="mt-1 text-sm text-dl-text-secondary">
            Partner-branded Concept 2 and Concept 4 flows.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/hackathon"
              className="rounded-dl bg-dl-brand px-4 py-2 text-sm font-medium text-white"
              data-testid="open-use-case-draft"
            >
              Use-Case Draft (Value sprint)
            </Link>
            <Link
              to="/hackathon/ghost-ledger"
              className="rounded-dl border border-dl-border px-4 py-2 text-sm font-medium"
              data-testid="open-ghost-ledger"
            >
              Ghost Ledger
            </Link>
          </div>
        </section>

        <Link
          to="/funding"
          className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card hover:border-dl-brand"
          data-testid="tile-funding"
        >
          <h2 className="text-lg font-semibold">Funding</h2>
          <p className="mt-1 text-sm text-dl-text-secondary">
            Review the substantiation pack behind a partner claim.
          </p>
        </Link>

        <Link
          to="/telemetry"
          className="rounded-dl border border-dl-border bg-dl-surface p-6 shadow-card hover:border-dl-brand"
          data-testid="tile-telemetry"
        >
          <h2 className="text-lg font-semibold">Telemetry</h2>
          <p className="mt-1 text-sm text-dl-text-secondary">
            Conversion, qualification, and funded-pilot performance (our roll-up).
          </p>
        </Link>

        <div className="rounded-dl border border-dashed border-dl-border bg-dl-page p-6 opacity-70">
          <h2 className="text-lg font-semibold">Programs</h2>
          <p className="mt-1 text-sm text-dl-text-secondary">Illustrative · unavailable</p>
        </div>
        <div className="rounded-dl border border-dashed border-dl-border bg-dl-page p-6 opacity-70">
          <h2 className="text-lg font-semibold">Support</h2>
          <p className="mt-1 text-sm text-dl-text-secondary">Illustrative · unavailable</p>
        </div>

        <p className="sm:col-span-2 text-center text-xs text-dl-text-secondary">
          <Link to="/customer" className="text-dl-brand hover:underline">
            Customer campaign entry
          </Link>
          {" · "}
          <Link to="/v1" className="text-dl-brand hover:underline">
            Legacy V1 landing
          </Link>
        </p>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Wire App routes**

In `App.tsx`:
- Import `PartnerHomePage`
- Change V1 shell: `path="/"` → `path="/v1"` for `LandingPage`
- Add `<Route path="/" element={<PartnerHomePage />} />` **outside** V1Shell (no JourneyProvider required)

- [ ] **Step 3: Smoke e2e**

Create `e2e/partner-home.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("partner home shows tiles and opens telemetry", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("partner-home")).toBeVisible();
  await page.getByTestId("tile-telemetry").click();
  await expect(page).toHaveURL(/\/telemetry/);
  await expect(page.getByTestId("pcm-telemetry")).toBeVisible();
});
```

Run: `npx playwright test e2e/partner-home.spec.ts`  
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/partner-home/pages/PartnerHomePage.tsx src/App.tsx e2e/partner-home.spec.ts
git commit -m "Add partner/PDM home at root; move V1 landing to /v1."
```

---

### Task 2: Funding page

**Files:**
- Create: `src/partner-home/data/mockFunding.ts`
- Create: `src/partner-home/pages/FundingPage.tsx`
- Modify: `src/App.tsx` (add `/funding`)
- Modify: `src/telemetry/pages/TelemetryPage.tsx` header — add link Home → `/`

**Interfaces:**
- `MockFundingClaim` with customer, useCase, annualValueLabel, format, notes[], partnerSponsor, status
- `FundingPage` `data-testid="funding-page"`; demo buttons cycle status Draft → Ready → Submitted

- [ ] **Step 1: Mock data + page**

```ts
// mockFunding.ts
export type FundingStatus = "Draft" | "Ready to submit" | "Submitted";

export interface MockFundingClaim {
  id: string;
  customer: string;
  useCase: string;
  annualValueLabel: string;
  format: "Value sprint" | "Ghost ledger";
  partnerSponsor: string;
  notes: { who: string; text: string }[];
  status: FundingStatus;
}

export const DEFAULT_FUNDING_CLAIM: MockFundingClaim = {
  id: "heartland-2026-09",
  customer: "Heartland Mutual Insurance",
  useCase: "AI-assisted claims intake extraction",
  annualValueLabel: "$7,750,000 / year",
  format: "Value sprint",
  partnerSponsor: "Tom Brennan · CDW AI & Data Practice Lead",
  status: "Draft",
  notes: [
    { who: "Michelle Dorsey", text: "Intake sits six days, mostly manual PDF reading." },
    { who: "Dana Reyes", text: "We handled Q1 volume by paying overtime, not by hiring." },
  ],
};
```

Funding page: show claim fields, attributed notes, status badge, buttons to advance status (local state). Links back to `/` and `/customer/dashboard`.

- [ ] **Step 2: Route + build**

Add `<Route path="/funding" element={<FundingPage />} />`.  
Run: `npm run build` — success.

- [ ] **Step 3: Commit**

```bash
git add src/partner-home src/App.tsx src/telemetry/pages/TelemetryPage.tsx
git commit -m "Add simulated funding substantiation page."
```

---

### Task 3: Deploy SPA copies for new partner routes

**Files:**
- Modify: `.github/workflows/deploy-pages.yml`

- [ ] **Step 1: Extend SPA mkdir/cp**

Add:
- `dist/v1`
- `dist/funding`
- `dist/customer/dashboard`
- `dist/customer/session`

(and keep existing customer/telemetry/hackathon copies)

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy-pages.yml
git commit -m "Add Pages SPA fallbacks for partner home and customer stage routes."
```

---

### Task 4: CustomerSession provider + mock CRM

**Files:**
- Create: `src/customer/data/mockCrm.ts`
- Create: `src/customer/hooks/useCustomerSession.tsx`

**Interfaces:**

```ts
export type SessionFormat = "draft" | "ledger";
export type SessionStage = "crm" | "scope" | "plan" | "run" | "artifacts" | "complete";

export interface CrmAccount {
  id: string;
  company: string;
  partnerOfRecord: string; // Softchoice | CDW | SHI
  industry: string;
  segment: string;
}

export interface CustomerSessionState {
  format: SessionFormat;
  stage: SessionStage;
  crmAccount: CrmAccount | null;
  attendees: AttendeeProfile[];
  scope: { painPoint: string; cxoOutcome: string; constraints: string };
  fundingStatus: FundingStatus;
  fundingValueLabel: string;
}

// Provider API
startSession(format: SessionFormat): void
setCrmAccount(account: CrmAccount): void
setAttendees(attendees: AttendeeProfile[]): void
updateScope(patch: Partial<CustomerSessionState["scope"]>): void
setStage(stage: SessionStage): void
resetSession(): void
```

Storage key: `customer-staged-session-v1`.

Mock CRM: 5–8 accounts across Softchoice/CDW/SHI.

- [ ] **Step 1: Implement mockCrm + provider**
- [ ] **Step 2: `npx tsc -b --pretty false`** — pass
- [ ] **Step 3: Commit**

```bash
git add src/customer/data/mockCrm.ts src/customer/hooks/useCustomerSession.tsx
git commit -m "Add customer staged-session state and mock CRM accounts."
```

---

### Task 5: Customer dashboard + modal routing

**Files:**
- Create: `src/customer/pages/CustomerDashboardPage.tsx`
- Modify: `src/customer/components/BusinessCaseModal.tsx`
- Modify: `src/App.tsx` — wrap customer routes needing session in `CustomerSessionProvider`; add `/customer/dashboard`

**Behavior:**
- Modal choices navigate to `/customer/dashboard` with `state: { format: "draft" | "ledger", startSession: true }` OR call `startSession` then go dashboard.
- Dashboard shows session card (format, stage, partner) + funding strip; **no** telemetry charts.
- CTAs: Continue → `/customer/session`; Funding → `/funding`.
- `data-testid="customer-dashboard"`

- [ ] **Step 1: Implement dashboard + modal navigate**

Modal:
```ts
onClick={() => {
  navigate("/customer/dashboard", { state: { format: "draft", startSession: true } });
}}
```

Dashboard `useEffect`: if `startSession`, `startSession(format)` and clear state via `navigate(..., { replace: true, state: {} })`.

- [ ] **Step 2: e2e snippet in `e2e/customer-stages.spec.ts`**

```ts
test("campaign chooser lands on customer dashboard", async ({ page }) => {
  await page.goto("/customer");
  await page.getByTestId("build-business-case").click();
  await page.getByTestId("choose-use-case-draft").click();
  await expect(page).toHaveURL(/\/customer\/dashboard/);
  await expect(page.getByTestId("customer-dashboard")).toBeVisible();
  await expect(page.getByTestId("pcm-telemetry")).toHaveCount(0);
});
```

- [ ] **Step 3: Commit**

```bash
git add src/customer src/App.tsx e2e/customer-stages.spec.ts
git commit -m "Add customer dashboard and route campaign chooser through it."
```

---

### Task 6: Staged session shell (CRM → Scope → Plan → Run)

**Files:**
- Create: `src/customer/components/SessionStageStepper.tsx`
- Create: `src/customer/components/CrmFindStep.tsx`
- Create: `src/customer/pages/CustomerSessionPage.tsx`
- Modify: `src/App.tsx` — `/customer/session`

**Stage UI:**
1. **CRM** — search input filters `mockCrm`; pick account or “Add account” form; then reuse LinkedIn loop: either embed a slim name/role/`simulateLinkedInProfile` UI **or** mount `SessionIntakeWithAttendees` with empty prefix, headcount 2–5, empty suffix, applying only attendees into session. Prefer dedicated small CRM UI + 1–3 attendee LinkedIn beats for clarity.
2. **Scope** — chat or form for pain / outcome / constraints → `updateScope`; Next → `setStage("plan")`.
3. **Plan** — summary card of CRM + attendees + scope; Confirm → `setStage("run")`.
4. **Run** — if `format===ledger"`, show short copy + link/button “Open live ledger run” that advances to artifacts handoff; if draft, checklist “Room aligned / ranks ready” then continue. Keep light—do not rebuild Kartik’s full room.

`data-testid="customer-session"` and `data-testid="stage-{crm|scope|plan|run|artifacts}"`.

- [ ] **Step 1: Implement stepper + CRM + session page**
- [ ] **Step 2: e2e smoke** — CRM pick → advance to scope visible
- [ ] **Step 3: Commit**

```bash
git add src/customer src/App.tsx e2e/customer-stages.spec.ts
git commit -m "Add customer staged session shell through Run."
```

---

### Task 7: Produce artifacts handoff (seed + navigate)

**Files:**
- Modify: `src/hackathon/hooks/useHackathonDraft.tsx` — add `seedFromCustomerSession(seed: {...}): void` that sets intake, attendees, participants, runs `tailorUseCasePool`, sets `phase: "plan"`
- Modify: `src/ghost-ledger/hooks/useGhostLedger.tsx` — similar seed → `phase: "plan"` with breakdown if numbers present; else keep plan with defaults for demo
- Modify: `src/customer/pages/CustomerSessionPage.tsx` — Produce artifacts button
- Optionally modify journey pages to accept `location.state.seeded` and skip forceIntake

**Seed shape:**

```ts
{
  customerName: string;
  industryStack: string;
  painPoint: string;
  cxoOutcome: string;
  headcount: number;
  attendees: AttendeeProfile[];
}
```

For ledger, also set placeholder numeric intake if scope didn’t collect dollars (use costModel defaults) so plan renders.

Produce artifacts:
```ts
setStage("artifacts");
if (format === "draft") {
  // provider method must be callable — mount journey after navigate;
  // pass seed via sessionStorage key customer-session-seed-v1
  sessionStorage.setItem("customer-session-seed-v1", JSON.stringify(seed));
  navigate("/customer/use-case-draft");
} else {
  sessionStorage.setItem("customer-session-seed-v1", JSON.stringify(seed));
  navigate("/customer/ghost-ledger");
}
```

On customer journey mount (`customerMode`):
```ts
useEffect(() => {
  const raw = sessionStorage.getItem("customer-session-seed-v1");
  if (!raw) return;
  sessionStorage.removeItem("customer-session-seed-v1");
  seedFromCustomerSession(JSON.parse(raw));
}, []);
```

Do **not** pass `forceIntake: true` on this navigation.

- [ ] **Step 1: Implement seed APIs + journey consumers**
- [ ] **Step 2: e2e** — from session Produce artifacts → expect plan/generation UI (e.g. `Plan generation` or cost plan), not CRM-only

```ts
test("produce artifacts opens draft plan board", async ({ page }) => {
  // minimal: set localStorage session at stage run with crm+scope filled, goto session, click produce
  // assert URL customer/use-case-draft and Plan generation visible after demo sign-in
});
```

- [ ] **Step 3: `npm run build` + playwright customer-stages + partner-home + customer-gemini**
- [ ] **Step 4: Commit**

```bash
git add src/customer src/hackathon src/ghost-ledger e2e
git commit -m "Seed customer journeys from staged session for Produce artifacts."
```

---

### Task 8: Final verification

- [ ] **Step 1:** `npm run build`
- [ ] **Step 2:** `npx playwright test e2e/partner-home.spec.ts e2e/customer-stages.spec.ts e2e/customer-gemini.spec.ts`
- [ ] **Step 3:** Confirm `/` partner home, `/telemetry` our dashboard, `/customer` → dashboard → session → artifacts
- [ ] **Step 4:** Do not push unless user asks

---

## Spec coverage checklist

| Spec item | Task |
|-----------|------|
| `/` partner home | Task 1 |
| `/v1` old landing | Task 1 |
| `/funding` | Task 2 |
| SPA copies | Task 3 |
| Customer session state + CRM mocks | Task 4 |
| Customer dashboard (funding + session only) | Task 5 |
| Staged CRM→Run | Task 6 |
| Produce artifacts → our Gemini boards | Task 7 |
| Telemetry unchanged / partner-linked | Tasks 1–2 |
| No customer cohort telemetry | Task 5 |

## Placeholder / consistency self-review

- Routes match spec table
- Storage keys named explicitly
- Seed handoff avoids forceIntake when staged data exists
- No Kartik telemetry clone
