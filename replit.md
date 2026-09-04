# Morrow Study Planner

Morrow is a responsive, local-first study planner for turning exam syllabi into daily sessions and measurable progress.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/study-planner/src/lib/study-data.ts` — planner domain types, demo data, date helpers, and deterministic schedule generation
- `artifacts/study-planner/src/hooks/use-study-planner.tsx` — localStorage-backed planner context and task/check-in mutations
- `artifacts/study-planner/src/components/` — reusable shell, task, progress, calendar, and check-in UI
- `artifacts/study-planner/src/pages/` — auth, dashboard, today, study plan, calendar, analytics, and settings views
- `artifacts/study-planner/src/index.css` — shared visual tokens and responsive styling

## Architecture decisions

- The first MVP is local-first: planner state is persisted in browser localStorage and seeded with a realistic exam workspace.
- Tasks are immutable once a date is checked in; rescheduling creates a new pending task and preserves the historical record.
- The study plan is generated from a flat manual syllabus format that preserves subject, chapter, and topic hierarchy for a future API migration.
- The first release is intentionally API-free: syllabus entry, plan generation, reminders, and progress tracking use local rule-based logic only.
- UI state is kept behind a planner context so the storage implementation can later move to PostgreSQL/Supabase without rewriting page components.

## Product

Users can create exams, build a subject/chapter/topic syllabus, generate a rule-based plan with study and assessment sessions, record YES/NO/PARTIAL outcomes, lock daily check-ins, reschedule misses without rewriting history, and review progress across dashboard, calendar, analytics, and reminders views.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
