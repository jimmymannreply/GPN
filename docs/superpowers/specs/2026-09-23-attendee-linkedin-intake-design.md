# Attendee LinkedIn Enrichment Intake — Design Spec

**Date:** 2026-09-23  
**Status:** Approved (conversation); pending file review  
**App:** `partner-story-bot`

## Goal

During conversational intake on **both** Concept 2 (Use-Case Draft) and Concept 4 (Ghost Ledger), collect **named attendees** with session roles. After each name, the agent **simulates** a LinkedIn profile lookup (no real API), then asks for their role in this session. Named attendees replace generic participant labels downstream.

## Non-goals

- Real LinkedIn / people-enrichment API
- Scraping or storing real third-party profile data
- Changing agent plan/draft/outcome logic beyond using real attendee names
- Replacing the rest of intake (customer, stack, pain, cost fields stay)

## Decisions (locked)

| Topic | Choice |
|--------|--------|
| Enrichment | Simulated only (mock profiles, short delay) |
| Entry UX | Two turns per person: **name → LinkedIn beat → session role** |
| LinkedIn timing | After the **name**, before role |
| Concept 2 headcount | 4–8 (unchanged range) |
| Concept 4 headcount | **2–5** (new step) |

## User flow (both concepts)

1. Existing intake questions run as today until headcount (C2 already has headcount; C4 gains it before or after account context — prefer after `customerName` / `industryStack` and **before or after** cost questions: place headcount + attendees **after** company/stack and **before** numeric cost questions on Ghost Ledger so the room is named early; on Use-Case Draft keep headcount where it is today, then expand into attendee loops).
2. Agent asks headcount within the allowed range.
3. For each attendee index `i` of `n`:
   1. Agent: “Who’s attendee *i* of *n*? Full name.”
   2. User: name (plain text, required).
   3. Agent shows a short status line (“Checking LinkedIn for {Name}…”) with ~1–1.5s delay, then a **mock profile** bubble.
   4. Agent: “What’s their role in this session?” (examples: CXO sponsor, VP Ops, IT director).
   5. User: role (plain text, required). Persist attendee; continue.
4. When all attendees are collected, continue to remaining intake steps (if any) or `completeIntake`.

## Data model

```ts
interface AttendeeProfile {
  name: string;
  role: string; // session role, user-provided
  linkedIn: {
    headline: string;
    title: string;
    company: string;
    tenure: string;
    focusAreas: string[]; // 1–2 items
    simulated: true;
  };
}

// Intake gains:
// headcount: number (C2: 4–8, C4: 2–5)
// attendees: AttendeeProfile[]
```

- Concept 2: `participants: string[]` used in snake draft becomes derived from attendees, e.g. `"Jane Doe (CXO sponsor)"`, not static role-only labels from `participantNames()`.
- Concept 4: store `attendees` on session state; surface in header and/or agent copy (e.g. “Room: Jane Doe · Alex Kim”).

## Mock LinkedIn generator

- Pure function: `simulateLinkedInProfile(name: string, companyHint: string): AttendeeProfile["linkedIn"]`.
- Deterministic from name + customer company (hash → pick from small template pools for title/tenure/focus).
- Footer / chat note: “Simulated LinkedIn enrichment for demo.”
- No network calls.

## Conversational intake changes

- Extend `ConversationalIntake` (or a thin wrapper `AttendeeEnrichmentIntake`) to support:
  - Static steps (existing)
  - **Dynamic attendee loop** after headcount is known
  - Async agent turns (status + delayed profile message) without requiring a user reply between status and profile
- Keep partner and customer routes sharing the same intake behavior.

## Success criteria

- On both `/hackathon/journey` and `/hackathon/ghost-ledger/journey` (and customer equivalents), user can enter headcount, then name/role for each person with a visible LinkedIn simulation beat.
- Concept 2 draft picker labels use real names + roles.
- Concept 4 session shows attendee names.
- Build and existing customer e2e still green (update e2e if intake step order blocks reaching conversational-intake assertions — those only check intake visibility after sign-in).

## Out of scope follow-ups

- Live LinkedIn API
- Photo avatars
- Editable profile confirmation (“Sound right?”)
