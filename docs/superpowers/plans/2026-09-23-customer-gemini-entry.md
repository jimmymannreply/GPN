# Customer Gemini Enterprise Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a customer funnel at `/customer` that looks like Gemini Enterprise marketing, opens a **Build my business case** modal, and routes into Concept 2 / Concept 4 agents on customer-specific paths without partner white-label landings.

**Architecture:** New `src/customer/` module owns the lookalike page and modal. Existing `JourneyPageHackathon` and `JourneyPageGhostLedger` gain an optional `customerMode` prop that swaps header copy and Home link to `/customer`. Routes mount under the existing `HackathonDraftProvider` / `GhostLedgerProvider` shells in `App.tsx`. GitHub Pages SPA copies are extended for the new deep links.

**Tech Stack:** React 18, React Router 6, Vite, Tailwind (`dl-*` tokens + Google-blue accents on lookalike), Playwright e2e, TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-23-customer-gemini-entry-design.md`

## Global Constraints

- Customer-friendly labels only on customer UI: **Prioritize my use cases** / **Show me the cost of waiting** (no “Concept 2/4” jargon on modal).
- Partner routes `/hackathon*` must remain unchanged in behavior and URLs.
- Primary CTA text is exactly **Build my business case**.
- Test IDs: `customer-gemini-landing`, `build-business-case`, `choose-use-case-draft`, `choose-ghost-ledger`.
- Reuse existing conversational agents; do not duplicate agent logic.
- Lookalike fidelity: hero + key sections, not iframe / not pixel-perfect clone.

## File map

| File | Responsibility |
|------|----------------|
| `src/customer/components/BusinessCaseModal.tsx` | Modal with two choices |
| `src/customer/pages/GeminiEnterpriseLookalike.tsx` | Lookalike landing + CTA opens modal |
| `src/hackathon/pages/JourneyPageHackathon.tsx` | Add `customerMode?: boolean` header/home tweaks |
| `src/ghost-ledger/pages/JourneyPageGhostLedger.tsx` | Same `customerMode` |
| `src/App.tsx` | Routes `/customer`, `/customer/use-case-draft`, `/customer/ghost-ledger` |
| `.github/workflows/deploy-pages.yml` | SPA `index.html` copies for customer paths |
| `e2e/customer-gemini.spec.ts` | Playwright coverage of funnel |

---

### Task 1: BusinessCaseModal

**Files:**
- Create: `src/customer/components/BusinessCaseModal.tsx`
- Test: `e2e/customer-gemini.spec.ts` (scaffold in Task 5; smoke-check via build in this task)

**Interfaces:**
- Consumes: `react-router-dom` `useNavigate`
- Produces: `BusinessCaseModal({ open, onClose }: { open: boolean; onClose: () => void })`

- [ ] **Step 1: Create the modal component**

```tsx
import { useNavigate } from "react-router-dom";

export function BusinessCaseModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="business-case-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="business-case-title" className="text-xl font-medium text-gray-900">
            Build my business case
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
          Choose how you want to make the case for Gemini Enterprise with your team.
        </p>
        <div className="mt-6 grid gap-3">
          <button
            type="button"
            data-testid="choose-use-case-draft"
            className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-[#1a73e8] hover:bg-blue-50/50"
            onClick={() => navigate("/customer/use-case-draft")}
          >
            <p className="font-medium text-gray-900">Prioritize my use cases</p>
            <p className="mt-1 text-sm text-gray-600">
              Draft and rank Gemini-ready use cases with your team in the room.
            </p>
          </button>
          <button
            type="button"
            data-testid="choose-ghost-ledger"
            className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-[#1a73e8] hover:bg-blue-50/50"
            onClick={() => navigate("/customer/ghost-ledger")}
          >
            <p className="font-medium text-gray-900">Show me the cost of waiting</p>
            <p className="mt-1 text-sm text-gray-600">
              Watch the cost of inaction tick, then freeze a Gemini reversal play.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/customer/components/BusinessCaseModal.tsx
git commit -m "Add Build my business case modal for customer funnel."
```

---

### Task 2: Gemini Enterprise lookalike page

**Files:**
- Create: `src/customer/pages/GeminiEnterpriseLookalike.tsx`
- Consumes: `BusinessCaseModal` from Task 1

**Interfaces:**
- Produces: `GeminiEnterpriseLookalike` default export / named export used by App routes

- [ ] **Step 1: Create the lookalike page**

Include: top nav stub, hero with headline inspired by Gemini Enterprise, primary CTA **Build my business case**, 3 short feature cards, simplified editions strip with the same CTA on each card, footer stub. Use Google-blue `#1a73e8`. Root `data-testid="customer-gemini-landing"`. Hero CTA `data-testid="build-business-case"`.

```tsx
import { useState } from "react";
import { BusinessCaseModal } from "@/customer/components/BusinessCaseModal";

const FEATURES = [
  {
    title: "Grounded in your business data",
    body: "Securely connect to Microsoft 365, Google Workspace, and more so answers reflect your reality.",
  },
  {
    title: "Agents that automate real work",
    body: "Prebuilt and no-code agents for multi-step, multi-app workflows your teams already run.",
  },
  {
    title: "Enterprise control",
    body: "You control your data, permissions, and policies — with built-in safety and governance.",
  },
];

export function GeminiEnterpriseLookalike() {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);

  return (
    <div className="min-h-screen bg-white text-gray-900" data-testid="customer-gemini-landing">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-sm font-medium text-gray-700">Google Cloud · Gemini Enterprise</p>
          <a href="#editions" className="text-sm text-[#1a73e8] hover:underline">
            Editions
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <p className="text-sm font-medium text-[#1a73e8]">Gemini Enterprise app</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-normal tracking-tight text-gray-900 md:text-5xl">
          Best of Google AI for every employee
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-gray-600">
          Securely connect to your apps, deploy agents that automate multi-step workflows, and keep
          control of your data — then build the business case with your stakeholders.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            data-testid="build-business-case"
            onClick={openModal}
            className="rounded-full bg-[#1a73e8] px-6 py-3 text-sm font-medium text-white shadow hover:bg-[#1765cc]"
          >
            Build my business case
          </button>
          <a
            href="#features"
            className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Learn more
          </a>
        </div>
      </section>

      <section id="features" className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-medium text-gray-900">{f.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="editions" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-normal text-gray-900">Gemini Enterprise editions</h2>
        <p className="mt-2 text-sm text-gray-600">
          Demo surface — trial CTAs replaced with business-case entry.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {["Business", "Standard / Plus"].map((edition) => (
            <div key={edition} className="rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium">{edition}</h3>
              <p className="mt-2 text-sm text-gray-600">
                For teams ready to prove value with Gemini Enterprise in the room.
              </p>
              <button
                type="button"
                onClick={openModal}
                className="mt-6 rounded-full bg-[#1a73e8] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1765cc]"
              >
                Build my business case
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-xs text-gray-500">
        Demo lookalike for stage-fit hackathon — not an official Google Cloud page.
      </footer>

      <BusinessCaseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/customer/pages/GeminiEnterpriseLookalike.tsx
git commit -m "Add Gemini Enterprise lookalike customer landing."
```

---

### Task 3: Wire `/customer` and customer journey routes; enable `customerMode`

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/hackathon/pages/JourneyPageHackathon.tsx` (header block ~lines 16–64)
- Modify: `src/ghost-ledger/pages/JourneyPageGhostLedger.tsx` (header block ~lines 15–49)

**Interfaces:**
- `JourneyPageHackathon({ customerMode?: boolean })`
- `JourneyPageGhostLedger({ customerMode?: boolean })`
- When `customerMode`:
  - Header product line: `Gemini Enterprise · Prioritize my use cases` / `Gemini Enterprise · Cost of waiting`
  - Home `Link` → `/customer`
  - On mount: `setBrand("Google Cloud", "#1a73e8")` via `useEffect` (from each hook)

- [ ] **Step 1: Update `JourneyPageHackathon` signature and header**

Change export to accept props:

```tsx
import { useEffect } from "react";
// ...existing imports

export function JourneyPageHackathon({ customerMode = false }: { customerMode?: boolean }) {
  const {
    state,
    setBrand,
    // ...rest unchanged
  } = useHackathonDraft();

  useEffect(() => {
    if (customerMode) setBrand("Google Cloud", "#1a73e8");
  }, [customerMode, setBrand]);

  // in header:
  <p className="text-xs text-dl-text-secondary">
    {customerMode
      ? "Gemini Enterprise · Prioritize my use cases"
      : `${state.brandName} · Use-Case Draft`}
  </p>
  // Home link:
  <Link
    to={customerMode ? "/customer" : "/hackathon"}
    className="text-xs text-dl-text-secondary hover:underline"
  >
    Home
  </Link>
```

Confirm `setBrand` is exported from `useHackathonDraft` (it is used on the partner landing). If the hook dependency array warns, keep `setBrand` stable or call once with eslint disable for intentional mount branding.

- [ ] **Step 2: Update `JourneyPageGhostLedger` the same way**

```tsx
export function JourneyPageGhostLedger({ customerMode = false }: { customerMode?: boolean }) {
  const gl = useGhostLedger();
  useEffect(() => {
    if (customerMode) gl.setBrand("Google Cloud", "#1a73e8");
  }, [customerMode, gl.setBrand]);

  // header secondary: customerMode ? "Gemini Enterprise · Cost of waiting" : `${state.brandName} · Ghost Ledger`
  // Home to={customerMode ? "/customer" : "/hackathon/ghost-ledger"}
```

- [ ] **Step 3: Wire routes in `App.tsx`**

Import lookalike and nest customer journeys under the existing providers (reuse shells so storage/hooks work):

```tsx
import { GeminiEnterpriseLookalike } from "@/customer/pages/GeminiEnterpriseLookalike";

// Inside Routes, add lookalike outside providers OR inside either — lookalike needs no provider:
<Route path="/customer" element={<GeminiEnterpriseLookalike />} />

// Inside HackathonDraftProvider shell, add:
<Route
  path="/customer/use-case-draft"
  element={<JourneyPageHackathon customerMode />}
/>

// Inside GhostLedgerProvider shell, add:
<Route
  path="/customer/ghost-ledger"
  element={<JourneyPageGhostLedger customerMode />}
/>
```

Keep existing `/hackathon` routes untouched.

- [ ] **Step 4: Typecheck**

Run: `npm run build`  
Expected: `tsc -b` and vite build succeed with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/hackathon/pages/JourneyPageHackathon.tsx src/ghost-ledger/pages/JourneyPageGhostLedger.tsx
git commit -m "Wire customer routes and customerMode journey chrome."
```

---

### Task 4: GitHub Pages SPA deep-link copies

**Files:**
- Modify: `.github/workflows/deploy-pages.yml` (SPA copy step ~line 41)

- [ ] **Step 1: Extend mkdir/cp for customer paths**

Replace the SPA copy run step with:

```yaml
      - run: |
          mkdir -p \
            dist/hackathon/journey \
            dist/hackathon/ghost-ledger/journey \
            dist/customer/use-case-draft \
            dist/customer/ghost-ledger
          cp dist/index.html dist/hackathon/index.html
          cp dist/index.html dist/hackathon/journey/index.html
          cp dist/index.html dist/hackathon/ghost-ledger/index.html
          cp dist/index.html dist/hackathon/ghost-ledger/journey/index.html
          cp dist/index.html dist/customer/index.html
          cp dist/index.html dist/customer/use-case-draft/index.html
          cp dist/index.html dist/customer/ghost-ledger/index.html
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy-pages.yml
git commit -m "Add GitHub Pages SPA fallbacks for customer routes."
```

---

### Task 5: Playwright e2e for customer funnel

**Files:**
- Create: `e2e/customer-gemini.spec.ts`
- Reference: `e2e/journey-v3.spec.ts` for style

- [ ] **Step 1: Write the e2e spec**

```ts
import { test, expect } from "@playwright/test";

test.describe("Customer Gemini Enterprise entry", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/customer");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/customer");
  });

  test("landing shows Build my business case CTA", async ({ page }) => {
    await expect(page.getByTestId("customer-gemini-landing")).toBeVisible();
    await expect(page.getByTestId("build-business-case")).toBeVisible();
  });

  test("modal routes to use-case draft customer journey", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await expect(page).toHaveURL(/\/customer\/use-case-draft/);
    await expect(page.getByTestId("conversational-intake")).toBeVisible();
  });

  test("modal routes to ghost ledger customer journey", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-ghost-ledger").click();
    await expect(page).toHaveURL(/\/customer\/ghost-ledger/);
    await expect(page.getByTestId("conversational-intake")).toBeVisible();
  });
});
```

Note: Google sign-in gate may wrap journeys. If intake is behind the gate, click `google-demo-signin` (or ghost ledger equivalent) before asserting `conversational-intake`. Inspect `GoogleSignInGate` / `GoogleSignInGateGhost` — if `state.user` is required, update the two journey tests:

```ts
await page.getByTestId("google-demo-signin").click();
await expect(page.getByTestId("conversational-intake")).toBeVisible();
```

- [ ] **Step 2: Run e2e**

Run: `npx playwright test e2e/customer-gemini.spec.ts`  
Expected: 3 passed (adjust if demo sign-in required).

- [ ] **Step 3: Commit**

```bash
git add e2e/customer-gemini.spec.ts
git commit -m "Add Playwright coverage for customer Gemini entry funnel."
```

---

### Task 6: Verify partner paths untouched + final build

**Files:** none new (verification only)

- [ ] **Step 1: Smoke partner landings still render**

Run: `npx playwright test e2e/journey-v3.spec.ts` (or a quick manual `npm run build` + open `/hackathon` if no hackathon e2e exists)

Manually confirm in build output that `/hackathon` and `/hackathon/ghost-ledger` routes remain in `App.tsx` unchanged.

- [ ] **Step 2: Full production build**

Run: `npm run build`  
Expected: success.

- [ ] **Step 3: Push when user requests** (do not push unprompted)

```bash
git push origin main
git push gpn main
```

Public URLs after Pages deploy:
- `https://jimmymannreply.github.io/GPN/customer/`
- `https://jimmymannreply.github.io/GPN/customer/use-case-draft/`
- `https://jimmymannreply.github.io/GPN/customer/ghost-ledger/`

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Lookalike `/customer` | Task 2 |
| Build my business case CTA | Task 2 |
| Modal with customer-friendly names | Task 1 |
| Routes to customer journeys | Task 3 |
| No partner white-label on customer path | Task 3 (`customerMode` + Google Cloud brand) |
| Partner `/hackathon*` unchanged | Task 3 / Task 6 |
| Pages SPA copies | Task 4 |
| Test IDs | Tasks 1–2, 5 |
| Build passes | Tasks 3, 6 |

## Placeholder / consistency self-review

- Route paths consistent: `/customer`, `/customer/use-case-draft`, `/customer/ghost-ledger`
- Test IDs match spec exactly
- Modal labels match locked copy
- No TBD / “implement later” steps remain
