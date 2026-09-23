# Partner Channel Manager Telemetry — Design Spec

**Date:** 2026-09-23  
**Status:** Approved  
**App:** `partner-story-bot`

## Goal

Give a **Partner Channel Manager** (persona: Priya Raghavan) a dedicated **`/telemetry`** dashboard: a simulated roll-up of partner / customer value sessions across formats (Value sprint = Use-Case Draft, Ghost ledger), with journey status. Remove the in-journey Telemetry sidebars from Concepts 2 and 4.

## Decisions

| Topic | Choice |
|--------|--------|
| Data | Fully simulated static cohort |
| Customer-level toggle | Omit (Off-state layout only) |
| Entry | `/telemetry` + links from hackathon landings and Gemini lookalike footer |

## Remove from concepts

- Telemetry event list sidebar on Use-Case Draft and Ghost Ledger journey pages (partner + customer modes).

## Page content

- Header: “My partners — Priya Raghavan”; title **Partner value-session telemetry.**
- KPIs, partner/pattern/format bars, funnel, recent sessions table (as screenshot).
- Formats map to concepts: **Value sprint** ↔ Concept 2, **Ghost ledger** ↔ Concept 4.

## Routes / deploy

- `/telemetry` in App; SPA `index.html` copy in Pages workflow.
