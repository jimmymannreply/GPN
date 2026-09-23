# Attendee LinkedIn Enrichment Intake Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add named attendee collection with simulated LinkedIn enrichment to conversational intake on both Use-Case Draft and Ghost Ledger.

**Architecture:** Shared attendee types + deterministic `simulateLinkedInProfile`. New `SessionIntakeWithAttendees` chat component runs prefix steps → headcount → per-person (name → delayed LinkedIn bubble → role) → suffix steps. Hooks store `attendees` and derive Concept 2 `participants` as `"Name (Role)"`.

**Tech Stack:** React 18, TypeScript, existing `ConversationalStep` parsers, Playwright e2e, Tailwind `dl-*` tokens.

**Spec:** `docs/superpowers/specs/2026-09-23-attendee-linkedin-intake-design.md`

## Global Constraints

- Enrichment is **simulated only** — no network / LinkedIn API.
- Flow per person: **name → LinkedIn beat → session role**.
- LinkedIn timing: **after the name**, before role.
- Concept 2 headcount: **4–8**.
- Concept 4 headcount: **2–5**.
- Profile footer / chat note: **“Simulated LinkedIn enrichment for demo.”**
- Delay ~**1–1.5s** between status and profile bubble.
- Partner and customer routes share the same intake behavior.
- Keep existing non-attendee intake fields (customer, stack, pain, costs).

## File map

| File | Responsibility |
|------|----------------|
| `src/shared/attendees/types.ts` | `AttendeeProfile` type |
| `src/shared/attendees/simulateLinkedIn.ts` | Mock profile generator + format bubble text |
| `src/shared/conversational/parseIntakeReply.ts` | Add `parseHeadcountInRange(min, max)` |
| `src/shared/conversational/SessionIntakeWithAttendees.tsx` | Chat UI with attendee loop |
| `src/hackathon/data/draftIntakeSteps.ts` | Split prefix / headcount / (no suffix) |
| `src/ghost-ledger/data/ledgerIntakeSteps.ts` | Prefix (name+stack), headcount 2–5, suffix (costs) |
| `src/hackathon/hooks/useHackathonDraft.tsx` | `attendees` on intake; participants from attendees |
| `src/ghost-ledger/data/costModel.ts` + `useGhostLedger.tsx` | `headcount`, `attendees` on intake |
| Journey pages | Swap to `SessionIntakeWithAttendees` |
| `e2e/attendee-linkedin.spec.ts` | Playwright coverage |

---

### Task 1: Attendee types + LinkedIn simulator

**Files:**
- Create: `src/shared/attendees/types.ts`
- Create: `src/shared/attendees/simulateLinkedIn.ts`
- Modify: `src/shared/conversational/parseIntakeReply.ts`

**Interfaces:**
- Produces:
  - `AttendeeProfile` with `name`, `role`, `linkedIn: { headline, title, company, tenure, focusAreas, simulated: true }`
  - `simulateLinkedInProfile(name: string, companyHint: string): AttendeeProfile["linkedIn"]`
  - `formatLinkedInBubble(name: string, profile: AttendeeProfile["linkedIn"]): string`
  - `parseHeadcountInRange(raw: string, min: number, max: number): { valid: boolean; value: number; error?: string }`

- [ ] **Step 1: Add types**

```ts
// src/shared/attendees/types.ts
export interface LinkedInSimulation {
  headline: string;
  title: string;
  company: string;
  tenure: string;
  focusAreas: string[];
  simulated: true;
}

export interface AttendeeProfile {
  name: string;
  role: string;
  linkedIn: LinkedInSimulation;
}
```

- [ ] **Step 2: Add simulator + formatter**

```ts
// src/shared/attendees/simulateLinkedIn.ts
import type { LinkedInSimulation } from "./types";

const TITLES = [
  "Chief Digital Officer",
  "VP of Operations",
  "Director of IT",
  "Head of Customer Experience",
  "VP Finance",
  "Director of Data & Analytics",
];

const FOCUS = [
  ["AI adoption", "operating model"],
  ["cost to serve", "automation"],
  ["cloud modernization", "security"],
  ["employee productivity", "knowledge work"],
  ["revenue growth", "CX"],
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function simulateLinkedInProfile(name: string, companyHint: string): LinkedInSimulation {
  const company = companyHint.trim() || "their organization";
  const h = hashStr(`${name.toLowerCase()}|${company.toLowerCase()}`);
  const title = TITLES[h % TITLES.length];
  const focusAreas = FOCUS[h % FOCUS.length];
  const years = 2 + (h % 8);
  return {
    headline: `${title} at ${company}`,
    title,
    company,
    tenure: `${years}+ years in role`,
    focusAreas: [...focusAreas],
    simulated: true,
  };
}

export function formatLinkedInBubble(name: string, profile: LinkedInSimulation): string {
  return [
    `LinkedIn · ${name}`,
    profile.headline,
    `${profile.title} · ${profile.tenure}`,
    `Focus: ${profile.focusAreas.join(" · ")}`,
    "Simulated LinkedIn enrichment for demo.",
  ].join("\n");
}
```

- [ ] **Step 3: Add ranged headcount parser**

Append to `parseIntakeReply.ts`:

```ts
export function parseHeadcountInRange(
  raw: string,
  min: number,
  max: number
): { valid: boolean; value: number; error?: string } {
  const n = Number(raw.replace(/[,\s]/g, ""));
  if (!Number.isFinite(n) || n < min || n > max || !Number.isInteger(n)) {
    return {
      valid: false,
      value: min,
      error: `Pick a whole number between ${min} and ${max}.`,
    };
  }
  return { valid: true, value: n };
}
```

Keep existing `parseHeadcount` (4–8) for compatibility; new UI should call `parseHeadcountInRange`.

- [ ] **Step 4: Smoke-check simulator in Node**

Run from `partner-story-bot`:

```bash
npx --yes tsx -e "import { simulateLinkedInProfile, formatLinkedInBubble } from './src/shared/attendees/simulateLinkedIn.ts'; const p = simulateLinkedInProfile('Jane Doe', 'Northwind'); const a = formatLinkedInBubble('Jane Doe', p); if (!a.includes('Simulated LinkedIn enrichment for demo.')) throw new Error('missing disclaimer'); if (simulateLinkedInProfile('Jane Doe','Northwind').title !== p.title) throw new Error('not deterministic'); console.log('ok');"
```

Expected: prints `ok`.

- [ ] **Step 5: Commit**

```bash
git add src/shared/attendees src/shared/conversational/parseIntakeReply.ts
git commit -m "Add simulated LinkedIn attendee profile helpers."
```

---

### Task 2: SessionIntakeWithAttendees chat component

**Files:**
- Create: `src/shared/conversational/SessionIntakeWithAttendees.tsx`
- Consumes: `ConversationalStep`, parsers, `simulateLinkedInProfile`, `formatLinkedInBubble`, `AttendeeProfile`

**Interfaces:**
- Produces: `SessionIntakeWithAttendees` props:

```ts
{
  sessionKey: number;
  openingLine: string;
  accent: string;
  companyHint: string; // current customerName for LinkedIn company
  prefixSteps: ConversationalStep[]; // before headcount
  headcountMin: number;
  headcountMax: number;
  headcountPrompt: string;
  suffixSteps: ConversationalStep[]; // after all attendees
  onApplyField: (stepId: string, value: unknown) => void;
  onAttendeesChange: (attendees: AttendeeProfile[]) => void;
  onComplete: () => void;
}
```

- [ ] **Step 1: Implement the component**

State machine phases: `"prefix" | "headcount" | "name" | "linkedin" | "role" | "suffix" | "done"`.

Behavior:
1. On mount / `sessionKey` change: reset; show opening + first prefix prompt (or headcount if prefix empty).
2. Prefix steps: same as `ConversationalIntake` — `onApplyField(id, value)`.
3. Headcount: parse with `parseHeadcountInRange(raw, headcountMin, headcountMax)`; `onApplyField("headcount", n)`; set `targetCount = n`; `attendeeIndex = 0`; ask name for attendee 1.
4. Name: `parsePlainText`; store pending name; append user turn; append agent status `"Checking LinkedIn for {name}…"`; enter `linkedin` phase with input disabled; after 1200ms append `formatLinkedInBubble(...)` turn with `data-testid="linkedin-profile-bubble"` on that bubble (add optional `testId` on `ChatTurn`), then ask role prompt; enter `role` phase.
5. Role: `parsePlainText`; push `AttendeeProfile` via `onAttendeesChange([...prev, profile])`; if more attendees, ask next name; else run first suffix step or `onComplete`.
6. Suffix steps: same as prefix; when finished call `onComplete`.
7. Root still `data-testid="conversational-intake"`.
8. During `linkedin` phase: hide or disable send input (show “Looking up…” helper text).

Use `ChatTurn` extended:

```ts
export interface ChatTurn {
  role: "agent" | "user";
  text: string;
  testId?: string;
}
```

Render `data-testid={turn.testId}` on the bubble when set.

Keep UI styling consistent with `ConversationalIntake.tsx` (reuse layout/classes).

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --pretty false`  
Expected: exit 0 (component may be unused until Task 3/4).

- [ ] **Step 3: Commit**

```bash
git add src/shared/conversational/SessionIntakeWithAttendees.tsx
git commit -m "Add session intake chat with LinkedIn attendee loop."
```

---

### Task 3: Wire Use-Case Draft (Concept 2)

**Files:**
- Modify: `src/hackathon/data/draftIntakeSteps.ts`
- Modify: `src/hackathon/hooks/useHackathonDraft.tsx`
- Modify: `src/hackathon/pages/JourneyPageHackathon.tsx`

**Interfaces:**
- `IntakeAnswers` gains `attendees: AttendeeProfile[]` (default `[]`)
- `completeIntake` sets `participants` from `attendees.map(a => `${a.name} (${a.role})`)` instead of `participantNames()`
- Remove or stop calling `participantNames` when attendees length matches headcount; if empty fallback to old roles for safety

- [ ] **Step 1: Split draft intake steps**

```ts
// draftIntakeSteps.ts
export const DRAFT_INTAKE_OPENING = "..."; // keep

export const draftPrefixSteps: ConversationalStep[] = [
  // customerName, industryStack, painPoint, cxoOutcome (same as today, without headcount)
];

export const DRAFT_HEADCOUNT_PROMPT =
  "How many people in the session — including at least one CXO? (4–8)";

export const draftSuffixSteps: ConversationalStep[] = []; // empty — attendees end intake
```

Remove the old single `draftIntakeSteps` export **or** keep as deprecated alias of prefix only — journey must import prefix/suffix/opening.

- [ ] **Step 2: Update hook**

In `IntakeAnswers` add `attendees: AttendeeProfile[]` default `[]`.

Add `setAttendees` or allow `updateIntake({ attendees })`.

In `completeIntake`:

```ts
const attendees = prev.intake.attendees ?? [];
const participants =
  attendees.length > 0
    ? attendees.map((a) => `${a.name} (${a.role})`)
    : participantNames(prev.intake.headcount);
```

- [ ] **Step 3: Wire journey page**

Replace `ConversationalIntake` with:

```tsx
<SessionIntakeWithAttendees
  sessionKey={state.intakeSessionKey}
  openingLine={DRAFT_INTAKE_OPENING}
  accent={state.brandAccent}
  companyHint={state.intake.customerName}
  prefixSteps={draftPrefixSteps}
  headcountMin={4}
  headcountMax={8}
  headcountPrompt={DRAFT_HEADCOUNT_PROMPT}
  suffixSteps={draftSuffixSteps}
  onApplyField={applyIntakeField}
  onAttendeesChange={(attendees) => updateIntake({ attendees })}
  onComplete={completeIntake}
/>
```

Note: `companyHint` should update as `customerName` is applied during prefix — reading `state.intake.customerName` from parent re-render is enough if `onApply` updates state before LinkedIn (LinkedIn runs after customerName step).

- [ ] **Step 4: Build**

Run: `npm run build`  
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add src/hackathon/data/draftIntakeSteps.ts src/hackathon/hooks/useHackathonDraft.tsx src/hackathon/pages/JourneyPageHackathon.tsx
git commit -m "Wire LinkedIn attendee intake into Use-Case Draft."
```

---

### Task 4: Wire Ghost Ledger (Concept 4)

**Files:**
- Modify: `src/ghost-ledger/data/costModel.ts` (`LedgerIntake`)
- Modify: `src/ghost-ledger/data/ledgerIntakeSteps.ts`
- Modify: `src/ghost-ledger/hooks/useGhostLedger.tsx`
- Modify: `src/ghost-ledger/pages/JourneyPageGhostLedger.tsx`

**Interfaces:**
- `LedgerIntake` gains `headcount: number` (default 3) and `attendees: AttendeeProfile[]` (default `[]`)
- Spec order: after `customerName` + `industryStack`, then headcount + attendees, then cost suffix steps

- [ ] **Step 1: Extend LedgerIntake**

```ts
import type { AttendeeProfile } from "@/shared/attendees/types";

export interface LedgerIntake {
  customerName: string;
  industryStack: string;
  headcount: number;
  attendees: AttendeeProfile[];
  monthlyToolSpend: number;
  // ...rest unchanged
}
```

Update `defaultIntake` in the hook accordingly.

- [ ] **Step 2: Split ledger steps**

```ts
export const ledgerPrefixSteps = [customerName, industryStack];
export const LEDGER_HEADCOUNT_PROMPT =
  "How many people are in the room for this session? (2–5)";
export const ledgerSuffixSteps = [
  monthlyToolSpend, ticketsPerMonth, minutesPerTicket,
  hoursLostPerWeek, hourlyLoadedCost, monthlyChurnRevenue,
];
```

- [ ] **Step 3: Wire journey**

Same `SessionIntakeWithAttendees` pattern with `headcountMin={2}` `headcountMax={5}`.

Header subtitle under customer name when attendees exist:

```tsx
{state.intake.attendees?.length > 0 && (
  <p className="text-xs text-dl-text-secondary">
    Room: {state.intake.attendees.map((a) => a.name).join(" · ")}
  </p>
)}
```

- [ ] **Step 4: Build**

Run: `npm run build`  
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add src/ghost-ledger src/shared/attendees
git commit -m "Wire LinkedIn attendee intake into Ghost Ledger."
```

---

### Task 5: Playwright e2e for attendee LinkedIn beat

**Files:**
- Create: `e2e/attendee-linkedin.spec.ts`

- [ ] **Step 1: Write e2e**

```ts
import { test, expect } from "@playwright/test";

async function signIn(page: import("@playwright/test").Page) {
  await page.getByTestId("google-demo-signin").click();
  await expect(page.getByTestId("conversational-intake")).toBeVisible();
}

async function answer(page: import("@playwright/test").Page, text: string) {
  await page.locator('[data-testid^="intake-input-"]').first().fill(text);
  await page.getByTestId("intake-send").click();
}

test.describe("Attendee LinkedIn enrichment", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/hackathon/journey");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/hackathon/journey");
  });

  test("draft intake shows LinkedIn simulation then asks role", async ({ page }) => {
    await signIn(page);
    await answer(page, "Northwind Retail");
    await answer(page, "Retail · M365 + Google Cloud");
    await answer(page, "Stores lack trusted answers at the register");
    await answer(page, "Lift same-store sales 3%");
    await answer(page, "4"); // headcount
    await answer(page, "Jane Doe");
    await expect(page.getByText(/Checking LinkedIn for Jane Doe/i)).toBeVisible();
    await expect(page.getByTestId("linkedin-profile-bubble")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Simulated LinkedIn enrichment for demo.")).toBeVisible();
    await expect(page.getByText(/role in this session/i)).toBeVisible();
    await answer(page, "CXO sponsor");
    await expect(page.getByText(/attendee 2 of 4/i)).toBeVisible();
  });

  test("ghost ledger asks 2-5 headcount then LinkedIn beat", async ({ page }) => {
    await page.goto("/hackathon/ghost-ledger/journey");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/hackathon/ghost-ledger/journey");
    await signIn(page);
    await answer(page, "Contoso Financial");
    await answer(page, "Financial Services · M365");
    await answer(page, "3");
    await answer(page, "Alex Kim");
    await expect(page.getByTestId("linkedin-profile-bubble")).toBeVisible({ timeout: 5000 });
    await answer(page, "VP Ops");
    // after attendees, cost questions resume
    await expect(page.getByText(/spend per month/i)).toBeVisible();
  });
});
```

Adjust prompt regexes to match exact copy in `SessionIntakeWithAttendees` / step prompts.

- [ ] **Step 2: Run tests**

Run: `npx playwright test e2e/attendee-linkedin.spec.ts`  
Expected: 2 passed.

Also run: `npx playwright test e2e/customer-gemini.spec.ts`  
Expected: all still pass (intake still visible after sign-in).

- [ ] **Step 3: Commit**

```bash
git add e2e/attendee-linkedin.spec.ts
git commit -m "Add Playwright coverage for attendee LinkedIn enrichment."
```

---

### Task 6: Final verification

- [ ] **Step 1:** `npm run build` — success  
- [ ] **Step 2:** Confirm Concept 2 draft picker uses `"Name (Role)"` after a quick manual path or assert in e2e optionally  
- [ ] **Step 3:** Do not push unless user asks

---

## Spec coverage checklist

| Spec item | Task |
|-----------|------|
| Simulated LinkedIn only | Task 1 |
| Name → LinkedIn → role | Task 2 |
| C2 4–8 headcount + attendees | Task 3 |
| C4 2–5 headcount + attendees | Task 4 |
| Participants from real names | Task 3 |
| Ghost room names in chrome | Task 4 |
| Demo disclaimer | Task 1–2 |
| E2E | Task 5 |

## Placeholder / consistency self-review

- Routes and storage keys unchanged
- No real API
- Headcount ranges exact: 4–8 / 2–5
- Disclaimer string exact
