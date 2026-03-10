# ShouldI - AI Decision Simulator

[![Live at shouldi.io](https://img.shields.io/badge/Live%20at-shouldi.io-blue?style=for-the-badge)](https://shouldi.io)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://shouldi.io)

## Overview

**ShouldI** is an AI-powered decision simulator that helps you explore the potential outcomes of life decisions before you make them. Ask any "Should I...?" question and get a multi-perspective analysis with simulated best-case, moderate, and worst-case scenarios.

Whether you're considering a career change, a financial investment, a move to a new city, or any other life decision, ShouldI provides data-driven insights powered by domain-specific AI advisors to help you think through your options.

### Key Features

- **AI-Powered Simulations** — Get detailed outcome analysis with confidence intervals for any decision
- **Domain-Specific Advisors** — Expert AI advisors for finance, career, health, relationships, education, real estate, lifestyle, and business
- **Multi-Scenario Analysis** — See best-case, moderate, and risk scenarios side by side
- **Interactive Survey** — Guided questionnaire that tailors the analysis to your specific situation
- **Multilingual** — Full support for English and German
- **Content Moderation** — Built-in 3-tier moderation system to ensure safe and appropriate use
- **Dark/Light Mode** — Full theme support

## Tech Stack

- **Framework:** Next.js 16 (App Router, SSR)
- **AI:** Google Gemini (gemini-2.0-flash-lite)
- **Auth & Database:** Firebase (Auth + Firestore)
- **Styling:** TailwindCSS + shadcn/ui
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
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
GEMINI_API_KEY=
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
