# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production (generates /out directory)
pnpm lint         # Run ESLint
pnpm start        # Start production server
```

**Deployment:**
- Hosted on Vercel (handles Next.js natively with SSR and server actions)

## Architecture Overview

**Stack:** Next.js 16 (App Router, static export) + Firebase (Auth, Firestore) + TypeScript + TailwindCSS + shadcn/ui

### Routing Structure

The app uses locale-based routing with `next-intl`:

```
/                    → Redirects to /en
/[locale]            → Landing page (public)
/[locale]/dashboard  → User's saved simulations (authenticated)
```

Supported locales: `en`, `de` (configured in `i18n/routing.ts`)

### Key Directories

- `app/[locale]/` - Next.js pages with locale parameter
- `components/` - React components (mostly client components with "use client")
  - `components/sections/` - Landing page sections (hero, pricing, FAQ, etc.)
  - `components/dashboard/` - Dashboard-specific components
  - `components/ui/` - shadcn/ui primitives
- `lib/` - Firebase init (`firebase.ts`), Firestore CRUD (`firestore-service.ts`), utilities
- `messages/` - i18n translation JSON files (en.json, de.json)
- `i18n/` - next-intl routing and request configuration

### Data Model

Simulations are stored in Firestore under `/users/{userId}/simulations/{simulationId}` with:
- `scenarioId`, `title`, `status` ("optimal" | "moderate" | "risk")
- `inputs` and `outcome` arrays for factor/outcome data
- Firestore rules enforce user-only access to their simulations

### Authentication

Firebase Auth with Email/Password and Google OAuth. Auth UI is in `components/auth-modal.tsx`.

## Important Patterns

- **Vercel Deployment:** The app is deployed on Vercel with full SSR and server action support.
- **Client Components:** Most components use "use client" directive for interactivity
- **Translations:** Use `useTranslations()` hook from next-intl for i18n strings
- **Styling:** TailwindCSS with OKLCH color variables defined in `globals.css`. Use `cn()` from `lib/utils.ts` for class merging.

## Environment Variables

Required Firebase config in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```
