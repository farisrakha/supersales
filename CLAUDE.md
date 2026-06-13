# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **What not to build**
> - No backend, API, database, or auth service of any kind
> - No real data or real network calls
> - No new component primitives outside shadcn/ui
> - Do not reconstruct any v1 fulfillment concept (shipments, waves, stock, DC Ops)

## Commands

```bash
bun dev          # Start dev server on port 3000
bun build        # Production build
bun test         # Run tests with Vitest
bun lint         # ESLint
bun typecheck    # TypeScript type check (no emit)
bun format       # Prettier write
bun check        # Prettier check (no write)
```

## Project Constraints (Hard Rules)

1. **Frontend only.** Do not build, scaffold, or design a backend. No API servers, no databases, no auth services, no background workers. The entire deliverable is a presentable mockup that runs in the browser.
2. **Mock data only.** All data is sourced from typed in-repo fixtures (e.g. `src/mocks/*.ts`). Loading states, empty states, error states, and async UX are simulated with timers if needed. Never wire to a real API.
3. **shadcn/ui is the only design system.** Use components from `src/components/ui/`. Do not create new component primitives. If a need cannot be met by composing existing shadcn primitives, raise it as a PRD change before reaching for a custom component.
4. **No em dashes in any output.** Use commas, colons, semicolons, periods, or parentheses. This applies to product copy, documentation, comments, commit messages, and PRDs. `--` is also banned.
5. **Copywriting follows `/marketing-skills:copywriting`.** Specific over vague, active over passive, clear over clever, no marketing buzzwords without substance.
6. **IA and UX quality is enforced via `/impeccable`.** Honor the shared design laws: OKLCH color, hierarchy via scale and weight contrast, no side-stripe borders, no gradient text, no glassmorphism by default, no hero-metric template, no identical card grids, no modal-as-first-thought.

## Architecture

**Stack**: TanStack Start (SSR meta-framework) + TanStack Router (file-based) + React 19 + TypeScript 6 + Tailwind CSS 4 + shadcn/ui (Base UI primitives).

**Routing**: File-based routing in `src/routes/`. `__root.tsx` is the HTML shell. `routeTree.gen.ts` is auto-generated; never edit it manually. Add new routes by creating files in `src/routes/`.

**Components**: `src/components/ui/` holds shadcn components built on Base UI + CVA variants. Use `cn()` from `src/lib/utils.ts` for class merging throughout (combines `clsx` + `tailwind-merge`).

**Styling**: Global styles and design tokens (OKLCH color space, CSS custom properties, light/dark theme) live in `src/styles.css`. Tailwind 4 with the engine plugin is configured in `vite.config.ts`. Prettier sorts Tailwind classes automatically via `cn()` and `cva()` function detection.

**Path alias**: `@/*` resolves to `./src/*`.

**Package manager**: Bun (see `bun.lock`).

**Icons**: `@hugeicons/react`, configured in `components.json` as the shadcn icon library.

## Project Overview

kdmp is a frontend-only mockup of a B2B field sales execution platform for technical instrument distributors in Java, Indonesia. Field sales reps visit manufacturing clients to demo precision instruments, capture visit evidence, and submit quote inquiries. This is a presentation deliverable: no backend, no API, no auth service.

## Pivot Context

v1 was a fulfillment OS (suggested orders, dispatch waves, driver delivery, store receiving). v2 replaces all of that. The new domain is: visits, accounts, reps, demo products, quote inquiries. Do not reference or reconstruct v1 concepts. v1 route files may still exist on disk during the transition; treat them as dead code.

## Component Rules

- Use only shadcn/ui components from `src/components/ui/`. Do not create custom primitives.
- Do not install chart libraries, DnD libraries, or map packages.
- Compose two shadcn primitives before considering anything else when one feels limiting.
- Two acknowledged exceptions: HTML canvas inside a Sheet (visit evidence photo lightbox), and HTML5 drag-and-drop on Table rows (visit plan reorder).

## Mock Data Rules

- All data lives in `src/mocks/`.
- `src/mocks/state.ts`: Zustand store (`useMockStore`). Selectors and actions only -- no derived UI logic.
- `src/mocks/engine.ts`: deterministic visit plan generator (v2 replacement for the replenishment engine).
- `src/mocks/scenarios/*.ts`: named scenario seeds.
- Actions must mutate Zustand state immediately -- no async, no fetch.
- On refresh, reset to scenario baseline. localStorage persistence is opt-in via the role switcher toggle only.
- Never hardcode data inside route components. Always read from state.

## Copy Rules

- Active voice. Specific over vague. No marketing buzzwords without substance.
- No em dashes anywhere. No exclamation points in product copy.
- CTAs describe what the user gets: "Flag for admin", "Forward to sales director". Never "Submit" or "OK".
- Empty states describe the next action, not what is absent.

## Visual Rules

- Color in OKLCH only (tokens configured in `src/styles.css`).
- No pure black or pure white on product surfaces.
- No gradient text, no glassmorphism, no side-stripe borders.
- Outcome badges use client language: "Interested" / "Not interested this visit" / "Quote submitted" -- not internal status codes.
- Evidence photos displayed as thumbnails; click to expand via Dialog.

## Surfaces and Personas

The role switcher in the app header lets a reviewer impersonate any persona.

| Persona | Surface | Access |
|---|---|---|
| Dewi | Supervisor Dashboard | Read + flag |
| Bima | Admin Portal | Read + write |
| Pak Arief | Executive KPI | Read only |
| Reza (FSR) | No surface in v2 | v3 scope |

Supervisor routes: `/`, `/visits`, `/activity`, `/accounts`, `/reps`

Admin routes: `/admin/accounts`, `/admin/reps`, `/admin/catalog`, `/admin/quotes`, `/admin/visit-plans`

Exec route: `/exec`
