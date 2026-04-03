# ShouldI - AI Decision Simulator

[![Live at shouldi.io](https://img.shields.io/badge/Live%20at-shouldi.io-blue?style=for-the-badge)](https://shouldi.io)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://shouldi.io)

## Overview

**ShouldI** is an AI-powered decision simulator that helps you explore the potential outcomes of life decisions before you make them. Ask any "Should I...?" question and get a multi-perspective analysis with simulated best-case, moderate, and worst-case scenarios.

Whether you're considering a career change, a financial investment, a move to a new city, or any other life decision, ShouldI provides data-driven insights powered by domain-specific AI advisors to help you think through your options.

### Key Features

- **AI-Powered Simulations** — Domain-aware Gemini prompts generate tailored survey questions and outcome analysis
- **Monte Carlo Engine** — Client-side probability distribution (1000 iterations) with p5/p95 confidence bands and risk scoring
- **Domain-Specific Skills** — 8 AI advisor personas (finance, career, health, relationships, education, real estate, lifestyle, business) with automatic detection from the user's question
- **Multi-Scenario Analysis** — Best-case, moderate, and risk scenarios with interactive histogram visualization
- **Crisis Detection** — Self-harm phrase detection (EN+DE, leetspeak-normalized) that redirects to crisis resources before any other moderation
- **Multilingual** — Full support for English and German
- **Dark/Light Mode** — Full theme support

## Tech Stack

- **Framework:** Next.js 16 (App Router, SSR + server actions)
- **AI:** Google Gemini (`gemini-2.0-flash-lite`) via server actions in `app/actions/gemini.ts`
- **Simulation:** Client-side Monte Carlo engine (`lib/monte-carlo.ts`) with Gaussian sampling
- **Auth & Database:** Firebase Auth (Email/Password + Google OAuth) + Firestore
- **Styling:** TailwindCSS v4 + shadcn/ui (OKLCH color variables)
- **i18n:** next-intl (EN/DE)
- **Deployment:** Vercel
- **Package Manager:** pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file with your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=<your-make-webhook-url>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-firebase-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-firebase-storage=bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-firebase-messaging-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-firebase-app-id>
GEMINI_API_KEY=<your-gemini-api-key>
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

## Deployment

The app is deployed on **Vercel** and live at:

**[https://shouldi.io](https://shouldi.io)**

## License

All rights reserved.
