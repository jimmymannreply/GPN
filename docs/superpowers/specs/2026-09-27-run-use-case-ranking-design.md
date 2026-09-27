# Run-stage Gemini use-case ranking — Design Spec

**Date:** 2026-09-27  
**Status:** Approved (conversation — approach 1 + §1; build authorized)  
**App:** `partner-story-bot`

## Goal

On the customer staged-session **Run** stage (draft and ledger), offer **6–8** Gemini pilot / use-case candidates tailored to the session pain point. Customers build an **ordered top 3**, then either start the snake-draft hackathon with that pool or save and continue to Next actions.

## Non-goals

- Full snake-draft UI inside the staged session page
- Live LLM generation (reuse existing `generateIntakeUseCases` / `tailorUseCasePool`)
- Changing partner `/hackathon/journey` behavior
- Replacing Ghost Ledger cost clock (still available via Next actions → produce artifacts)

## Decisions (locked)

| Topic | Choice |
|--------|--------|
| Formats | Both draft and ledger |
| Interaction | Hybrid: rank/select on Run → optional snake draft |
| Candidate count | 6–8 (top scored from generator) |
| Selection rule | Ordered top **3** required before CTAs |
| Exit CTAs | (1) Start hackathon draft now (2) Save & continue to next steps |
| Generator | Reuse `tailorUseCasePool` from session pain/outcome/stack |
| Snake seed | `CustomerSessionSeed.pool` override when top 3 present |

## Flow

```
… → Plan → Run
  → Generate 6–8 candidates from CRM + scope + stack
  → Customer orders top 3
  → CTA A: /customer/use-case-draft (seeded pool = top 3, phase plan)
  → CTA B: stage = artifacts (Next actions; shortlist persisted)
```

## Data model

Extend `CustomerSessionState`:

- `candidatePool: UseCaseCandidate[]`
- `rankedTop3: string[]` — use-case ids in rank order (length 0–3)

Journey seed (`customer-session-seed-v1`) gains optional `pool?: UseCaseCandidate[]`. When present, `seedFromCustomerSession` uses it instead of regenerating a 10-case pool.

## UI (Run)

- Header: pain snapshot + “Pick your top 3 Gemini pilots”
- Grid of candidate cards (title, summary, scores, Gemini blueprint compact)
- Ranked strip: #1–#3 with remove / move up / move down
- Disabled until `rankedTop3.length === 3`:
  - `Start hackathon draft now`
  - `Save & continue to next steps`

## Testing

- e2e: reach Run with preseeded session → see ≥6 candidates → select 3 → both CTAs enabled → start draft lands on plan with shortlist; continue lands on Next actions

## Out of scope follow-ups

- Drag-and-drop ranking
- Regenerating candidates mid-run
- Contested multi-voter ranking on Run
