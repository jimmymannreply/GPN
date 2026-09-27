# Run-stage use-case ranking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On customer Run, show 6–8 Gemini use cases, require ordered top 3, then start snake draft or continue to Next actions.

**Architecture:** Generate candidates from session scope via `tailorUseCasePool`; persist pool + ranked ids on `CustomerSessionState`; seed hackathon draft with optional `pool` override.

**Tech Stack:** React, existing `UseCaseCandidate` / `UseCaseCard`, Playwright e2e.

## Global Constraints

- Top 3 required before either CTA
- Both draft and ledger formats
- Reuse generator; do not call live LLM
- Keep Ghost Ledger path via Next actions produce

---

### Task 1: Session state + generator helper

- [ ] Add `candidatePool` / `rankedTop3` to `useCustomerSession`
- [ ] Add `generateRunCandidates(session)` → 6–8 cases
- [ ] Unit-smoke via tsc

### Task 2: Run board UI

- [ ] `RunUseCaseBoard.tsx` — select/reorder top 3, dual CTAs
- [ ] Wire into `CustomerSessionPage` run stage (both formats)

### Task 3: Hackathon seed pool override

- [ ] Extend `CustomerSessionSeed` with optional `pool`
- [ ] `seedFromCustomerSession` uses override when present
- [ ] Start-draft CTA writes seed + navigates

### Task 4: e2e + verify

- [ ] Update/add Playwright coverage for Run ranking
- [ ] `tsc -b` + targeted e2e
- [ ] Commit and push
