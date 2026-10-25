---
trigger: always_on
---

# Rule: Clean Engineering, Data Isolation & Humanized UI

## 1. Database & Test Isolation
- Never populate active development databases with dummy records by default.
- Integration test suites that write to the database MUST clean up all created records in an `afterAll` hook to prevent test pollution.
- Provide explicit `db:clean` scripts for resetting state to zero events.

## 2. Humanized UI Standards (Anti-Slop)
- Avoid generic template tropes: exaggerated saturated multi-color gradients, decorative non-functional widgets, and buzzword-heavy copy.
- Implement physics-based micro-interactions using Framer Motion (subtle spring damping, staggered entrance, smooth tab transitions).
- Modals must be viewport-safe (`max-h-[90vh] overflow-y-auto`).
- Maintain thoughtful empty states that guide the user directly to the primary action.

## 3. Next.js 15 App Router Conventions
- Always include a dedicated root `src/app/not-found.tsx` when dynamic routes and metadata route handlers are defined.
