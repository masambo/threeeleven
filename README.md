# 3:11 Security — Community Neighbourhood Watch

A monorepo containing the platform for **3:11 Security**, a community neighbourhood watch system covering Namibia. The platform consists of three frontend apps and a shared Convex backend, designed to coordinate community safety operations in real time.

## Apps

| App | Stack | Purpose |
| --- | --- | --- |
| `apps/admin-web` | Next.js 16, Clerk, Convex, Tailwind | Regional **Command Center** for admins — danger zones, alerts, reports, live map. |
| `apps/super-admin-web` | Next.js 16, Clerk, Convex | Platform console for super admins (regions, role assignments, audit). |
| `apps/user-mobile` | Expo SDK 54, React Native, Clerk | Citizen-facing mobile app — SOS, reports, safety alerts, danger map. |

## Packages

| Package | Purpose |
| --- | --- |
| `packages/backend` | Convex schema + functions (queries, mutations, actions, RBAC). |
| `packages/design` | Shared design tokens consumed by all frontends. |

## Tech stack

- **Monorepo** — npm workspaces + Turbo
- **Backend** — [Convex](https://convex.dev) for real-time database, serverless functions, and auth integration
- **Authentication** — [Clerk](https://clerk.com) with invite-only admin provisioning
- **Web** — Next.js 16 (App Router, Turbopack)
- **Mobile** — Expo SDK 54, React Native 0.81, Expo Router
- **Mapping** — Leaflet (web), static OSM tiles + overlays (mobile)
- **Styling** — Tailwind CSS with a strict blue + white "Command Center" theme

## Getting started

```bash
npm install

# 1) Start the Convex backend (terminal 1)
cd packages/backend
npx convex dev

# 2) Start an app (terminal 2)
cd apps/admin-web && npm run dev
# or
cd apps/super-admin-web && npm run dev
# or
cd apps/user-mobile && npm start
```

Copy `.env.example` to `.env.local` in each app and `packages/backend`, then fill in your Clerk and Convex values.

## Environment variables

See `.env.example` at the repo root. Required variables per app:

- **`packages/backend`** — `CONVEX_DEPLOYMENT`, `CONVEX_URL`, `CONVEX_SITE_URL`, `CLERK_JWT_ISSUER_DOMAIN`
- **`apps/admin-web` & `apps/super-admin-web`** — `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- **`apps/user-mobile`** — `EXPO_PUBLIC_CONVEX_URL`, `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

## License

Private — internal project. All rights reserved.
