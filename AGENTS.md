# AGENTS.md

## Purpose

This guide is for coding agents working in this repository.
Follow it to keep changes consistent, safe, and reviewable.

## Project Snapshot

- Framework: Next.js 16 (App Router) + React 19.
- Language: TypeScript (`strict: true`).
- Styling: Tailwind CSS 4 + shadcn/ui primitives.
- Database: PostgreSQL + Drizzle ORM.
- AI services: Google Gemini + Pinecone.
- Tests: Vitest (unit/integration) + Playwright (E2E).
- Package manager: `pnpm` (`pnpm@10.9.0`).

## Source of Truth

- Prefer runtime facts from `package.json`, config files, and current source code.
- Use `README.md` for context, but commands/scripts may be stale.
- If docs conflict with code, follow code and update docs.

## High-Value Paths

- App routes/pages/components: `src/app`
- Shared UI primitives: `src/components/ui`
- Services/utils: `src/lib`
- DB schema/client/queries: `src/server/db`
- Scripts: `src/scripts`
- Tests: `tests/unit`, `tests/integration`, `tests/e2e`

## Install & Run

- Install dependencies: `pnpm install`
- Start dev server: `pnpm dev`
- Build production app: `pnpm build`
- Start production server: `pnpm start`
- Build + start preview: `pnpm preview`

## Lint, Format, Typecheck

- Lint: `pnpm lint`
- Lint + autofix: `pnpm lint:fix`
- Typecheck: `pnpm typecheck`
- Combined checks: `pnpm check`
- Format check: `pnpm format:check`
- Format write: `pnpm format:write`

## Testing Commands

- Run tests (Vitest, watch mode): `pnpm test`
- Vitest UI: `pnpm test:ui`
- Coverage: `pnpm test:coverage`
- E2E tests: `pnpm test:e2e`
- E2E UI: `pnpm test:e2e:ui`

## Running a Single Test (Important)

### Vitest

- Single test file:
  - `pnpm test -- tests/unit/components/ProductCard.test.tsx`
- Single test by name pattern:
  - `pnpm test -- -t "adds product to cart when clicked"`
- Single file in non-watch mode:
  - `pnpm test -- run tests/unit/hooks/useCart.test.tsx`

### Playwright

- Single spec file:
  - `pnpm test:e2e -- tests/e2e/smoke.spec.ts`
- Single test by grep/title:
  - `pnpm test:e2e -- -g "prevents checkout with empty cart"`
- Single project + file:
  - `pnpm test:e2e -- --project=chromium tests/e2e/smoke.spec.ts`

## Database & Data Workflows

- Generate migrations: `pnpm db:generate`
- Push schema changes: `pnpm db:push`
- Run migrations: `pnpm db:migrate`
- Open DB studio: `pnpm db:studio`
- Schema file: `src/server/db/schema.ts`
- Shared product query helper: `src/server/db/queries/products.ts`

## AI/Script Commands

- Sync products to Pinecone: `pnpm sync:pinecone`
- Test RAG flow: `pnpm test:rag`

## TypeScript Rules

- Keep strict typing; avoid `any` unless unavoidable.
- Use type imports (`import { type X }`) when importing types.
- Define clear interfaces/types at API and service boundaries.
- Validate unknown external input before use (requests, env, 3rd-party data).
- Preserve nullability in DB-backed types (e.g., nullable columns).

## Import Conventions

- Prefer alias imports with `@/*` for `src/*` paths.
- Keep import groups readable:
  1. framework/external
  2. internal alias imports
  3. relative imports
- Do not use deep `../../../` chains when alias import is clearer.

## Formatting Conventions

- Use Prettier as the formatter of record.
- Tailwind classes are auto-sorted by `prettier-plugin-tailwindcss`.
- Run formatter after structural edits.
- Keep files ASCII unless file content already requires Unicode.

## Naming Conventions

- Components: `PascalCase` (e.g., `ProductCard.tsx`).
- Hooks: `useXxx` (e.g., `useProductSearch.ts`).
- Variables/functions: `camelCase`.
- Constants: `UPPER_SNAKE_CASE` for true constants.
- Route handlers: `route.ts` with `GET`, `POST`, etc.
- Test files: `*.test.ts(x)` for Vitest, `*.spec.ts` for Playwright.

## Next.js & React Practices

- Server components by default; add `"use client"` only when required.
- Keep client/server boundaries explicit and clean.
- Prefer shared query/service modules over duplicated fetch logic.
- Reuse existing UI primitives from `src/components/ui` first.
- Use `cn` helper from `@/lib/utils` for class composition.

## API & Error Handling

- Validate request input early and return proper status codes.
- Use structured JSON errors for API routes.
- Use `try/catch` around I/O, DB, and external API calls.
- Log useful context with `console.error`, but never secrets.
- Show user-safe error messages in UI; avoid raw stack traces.

## Drizzle/SQL Safety

- Follow ESLint drizzle rules:
  - `drizzle/enforce-delete-with-where`
  - `drizzle/enforce-update-with-where`
- Never run broad update/delete queries without `where` clauses.
- Keep schema, query types, and API response mapping aligned.

## Environment Variables

- Env schema is defined in `src/env.js`.
- If adding vars, update both:
  - `.env.example`
  - `src/env.js` (schema + runtime mapping)
- Never commit real secrets or production credentials.

## Test Authoring Guidelines

- Prefer behavior-focused assertions over implementation details.
- Use accessible queries (`getByRole`, labels, visible text).
- Mock network with MSW (`tests/mocks`) for deterministic integration tests.
- Keep E2E selectors resilient and minimize flaky timing assumptions.
- Add or update tests for changed behavior whenever practical.

## Recommended Agent Workflow

1. Read related files and existing patterns before editing.
2. Make minimal, scoped changes.
3. Run targeted test(s) for changed areas first.
4. Run repository checks before final handoff:
   - `pnpm check`
   - `pnpm format:check`
   - relevant `pnpm test ...` command(s)
5. If a full suite is too expensive, state exactly what was run.

## Git Hygiene for Agents

- Do not revert unrelated local changes.
- Keep commits focused and small.
- Avoid destructive git operations unless explicitly requested.
- Do not commit `.env` or other secret-containing files.

## Final Note

When uncertain, prefer consistency with existing source files over inventing new patterns.
