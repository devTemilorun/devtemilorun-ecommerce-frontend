Modern Store Ecommerce Frontend — Next.js + Tailwind + React

An opinionated, production-ready frontend for an e-commerce platform built with Next.js (App Router), TypeScript, Tailwind CSS, and a set of handy UI components and utilities.

**Tech stack:** Next.js, React, TypeScript, Tailwind CSS, Zustand, React Query, Radix UI, Nivo charts, and other modern libraries.

**Key features**
- Storefront pages: shop, product details, cart, checkout, contact.
- Customer flows: register, login, email verification, passwordless flows.
- Admin dashboard: product management, orders, customers, analytics, coupons.
- Components: product grid, product card, cart summary, image upload, forms, and charts.

Getting started

Prerequisites
- Node.js 18+ and npm/yarn/pnpm installed.

Install dependencies

```bash
npm install
# or pnpm install
# or yarn
```

Run development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

Available scripts (from package.json)
- `dev` — Start Next.js dev server
- `build` — Build for production
- `start` — Start production server
- `lint` — Run ESLint

Project structure (high level)
- app/ — Next.js App Router pages and route groups (storefront, dashboard, admin, auth)
- components/ — Reusable UI and feature components (storefront, admin, layout)
- hooks/ — Custom React hooks
- lib/ — Utilities (axios instance, image parsing, helpers)
- services/ — API service wrappers for products, orders, admin
- store/ — Zustand stores (auth, cart)
- styles/ — Global styles and Tailwind configuration
- types/ — TypeScript types for products and orders

Environment

Create a `.env.local` at the project root for local development. Common variables used by the app may include:

- `NEXT_PUBLIC_API_URL` — Base URL of the backend API
- `NEXT_PUBLIC_PAYSTACK_KEY` — Payment provider public key (if using Paystack)

Testing & linting

- Lint: `npm run lint`

Deployment

This app is optimized for deployment on Vercel, but it can be hosted on any Node-compatible platform. Typical steps:

1. Set environment variables in your hosting provider.
2. Install dependencies and run `npm run build`.
3. Start the server with `npm start` (or use serverless/static hosting on Vercel).

Contributing

PRs welcome. For changes to UI or components, follow existing patterns and keep changes focused and small.

Notes & further improvements
- Add automated tests (Jest/Testing Library) for critical flows.
- Add CI (GitHub Actions) for build, lint and tests.


