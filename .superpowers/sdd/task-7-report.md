# Task 7 report: Produce artifacts handoff (seed + navigate)

**Branch:** `feature/partner-home-customer-stages`  
**Commit:** (pending) — Seed customer journeys from staged session for Produce artifacts.

## Done

- `src/hackathon/hooks/useHackathonDraft.tsx` — `seedFromCustomerSession` sets intake from seed, runs `tailorUseCasePool`, participants/snakeOrder, `phase: "plan"`.
- `src/ghost-ledger/hooks/useGhostLedger.tsx` — same seed API with demo cost defaults (`monthlyToolSpend` 45k, tickets, churn, etc.), `computeCostOfInaction` + `buildFreezeOptions`, `phase: "plan"`.
- `src/customer/pages/CustomerSessionPage.tsx` — Produce artifacts enabled (`data-testid="produce-artifacts"`); writes `customer-session-seed-v1` and navigates to draft/ledger **without** `forceIntake`.
- `JourneyPageHackathon` / `JourneyPageGhostLedger` — on `customerMode`, consume sessionStorage seed on mount (persists through Google sign-in gate) so plan UI shows after demo sign-in; existing `forceIntake` kept for partner landings.
- `e2e/customer-stages.spec.ts` — produce artifacts → `/customer/use-case-draft` → Plan generation, no intake.

## Verify

- `npx tsc -b --pretty false` — pass.
- `npx playwright test e2e/customer-stages.spec.ts e2e/partner-home.spec.ts e2e/customer-gemini.spec.ts` — 11 passed.
- `npm run build` — pass.

## Notes

- Seed applies on journey mount before sign-in; provider state persists so after `google-demo-signin` phase is already `plan`. Not pushed.
