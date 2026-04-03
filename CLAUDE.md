# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm start        # Start production server
```

**Deployment:** Hosted on Vercel with SSR and server actions.

## Architecture Overview

**Stack:** Next.js 16 (App Router) + Firebase (Auth, Firestore) + Gemini AI + TypeScript + TailwindCSS + shadcn/ui

### Routing Structure

Locale-based routing via `next-intl`:

```
/                      → Redirects to /en
/[locale]              → Landing page (public)
/[locale]/dashboard    → User's saved simulations (authenticated)
/[locale]/pricing|about|scenarios|...  → Static pages
```

Supported locales: `en`, `de` (configured in `i18n/routing.ts`)

### AI Integration

Gemini (`gemini-2.0-flash-lite`) is called exclusively via Next.js server actions in `app/actions/gemini.ts`. Two server actions:
- `generateSurveyQuestionsAction` — generates 3–4 survey questions for a user's decision
- `generateOutcomesAction` — generates outcomes with `probability`, `impactScore`, `volatility` for Monte Carlo

Prompts are built by `lib/skills/prompt-builder.ts` (`buildSurveyPrompt` / `buildOutcomePrompt`) which inject domain skill context. Rate-limited calls use exponential backoff via `withRetry()`.

**Required env var:** `GEMINI_API_KEY` (server-only, no `NEXT_PUBLIC_` prefix)

### Skills System

`lib/skills/` provides domain-aware AI prompting across 8 specializations:

- **Detection:** `detector.ts` — keyword scoring (client + server), no API call, returns `DetectionResult` with `skillId` and confidence
- **Registry:** `registry.ts` — lookup by `SkillId`
- **Skills:** `lib/skills/skills/` — one file per domain: `finance`, `career`, `health`, `relationships`, `education`, `real-estate`, `lifestyle`, `business`, `generic`
- Each skill defines `keywords`, `persona`, `questionFramework`, `evaluationCriteria`, `riskFactors`, and `benchmarks`
- **Icon mapping:** `lib/skills/skill-icon.tsx` — maps `icon` string to Lucide component

To add a new skill: create file in `lib/skills/skills/`, add `SkillId` to `lib/skills/types.ts`, register in `lib/skills/registry.ts`.

### Monte Carlo Simulation

`lib/monte-carlo.ts` — client-side engine, 1000 iterations, <5ms runtime.

- Input: `MonteCarloParams[]` (probability, impactScore, volatility per outcome)
- Uses Box-Muller transform for Gaussian sampling
- Outputs `MonteCarloResult` with composite score, histogram (20 bins), percentiles (p5/p95), `riskOfPoorOutcome` (P<40), `chanceOfGoodOutcome` (P≥70)
- `deriveParamsFromConfidence()` provides fallback params when Gemini omits numerical values
- Visualized by `components/ui/distribution-chart.tsx`

### Content Moderation

`lib/moderation.ts` — pure client-side, no API call. Three-tier system:
1. **Priority 0 (crisis):** `detectCrisis()` runs first; detects self-harm phrases in EN+DE with leetspeak normalization
2. **Tier 1:** Root matching (`\broot`) — catches all word forms
3. **Tier 2:** Exact word matching (`\bword\b`) — avoids false positives (e.g., "stable" ≠ "stab")
4. **Tier 3:** Phrase matching (`.includes()`) — multi-word patterns

`moderateContent()` returns `ModerationResult` with `blocked` and `category` (`"crisis" | "sexual" | "violence" | "hate" | "profanity" | "harmful"`).

Crisis UI is in `components/crisis-dialog.tsx` (shows helplines: 988, Telefonseelsorge). Moderation is called in: `hero-section`, `survey-modal`, `dashboard-survey-modal`, `dashboard/page`.

### Data Model

Firestore path: `/users/{userId}/simulations/{simulationId}` (flat — no nested sub-collections per scenario).

Key types in `lib/types/firestore.ts`:
- `Scenario` — title, description, icon, optional `skillId`, `simulationCount`
- `Simulation` — `status` ("optimal"|"moderate"|"risk"), `factors[]`, `outcomes[]`, `inputSummary`, `outcomeSummary`, optional `monteCarloResult`
- `Outcome` — extends with optional `probability`, `impactScore`, `volatility` for MC

Free tier limits enforced in `contexts/firestore-context.tsx`: 2 scenarios, 1 simulation per scenario.

### Key Component Flows

Two survey modal variants (both follow the same flow):
- `components/survey-modal.tsx` — landing page, 3 questions
- `components/dashboard/dashboard-survey-modal.tsx` — dashboard, 4 questions

Flow: user types question → moderation check → skill detection → `generateSurveyQuestionsAction` → user answers → `generateOutcomesAction` → MC simulation → save to Firestore

PDF export uses `jspdf` and is triggered from `components/dashboard/simulation-results.tsx`.

### Important Patterns

- **Translations:** `useTranslations()` from `next-intl`. All user-facing strings in `messages/en.json` and `messages/de.json`.
- **Styling:** TailwindCSS v4 with OKLCH color variables in `globals.css`. Use `cn()` from `lib/utils.ts`.
- **`pnpm build`** skips type validation; TypeScript errors surface at compilation.

## Environment Variables

```
# Firebase (client-side, all NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

# Gemini AI (server-side only)
GEMINI_API_KEY
```
