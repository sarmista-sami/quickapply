## Context

Greenfield repo. Goal of this change is a runnable extension skeleton that fixes the
4-layer architecture and shared data contract before feature work begins. Motivation
and scope are in `proposal.md`; project-wide rules are in `AGENTS.md`. Constraints:
MV3, Chrome Side Panel API, must keep core layers decoupled from the browser and from
any target website, and must never store sensitive fields.

## Goals / Non-Goals

**Goals:**
- A WXT + React + TS extension that builds and whose side panel opens on action click.
- Locked, typed contracts for all 4 layers, testable in isolation.
- Website-agnostic `ApplicantData` Zod model as the single normalized shape.
- Vitest wired with placeholder tests that pass.
- `AGENTS.md` conventions enforced structurally (core isolation, no sensitive fields).

**Non-Goals:**
- Real docx/PDF parsing (Stage 2).
- Real storage / sync logic (Stage 3).
- Real Workday form-filling, selectors, native-setter writes (Stage 4).
- Playwright e2e (later).
- UI polish beyond a minimal shell.

## Decisions

**WXT over raw Vite + CRXJS.** WXT gives MV3 manifest generation, HMR, entrypoint
convention, and side-panel support out of the box, with first-class React module
support. Alternative (hand-rolled Vite + manifest) costs boilerplate and manifest
drift for no benefit at this scale.

**Core layers in `src/core`, browser code in `entrypoints`.** `src/core/*` is pure
TS with zero `chrome.*`/DOM imports, so Vitest runs it in node with no headless
browser. Browser access is injected via ports (e.g. `StoragePort`). Alternative
(putting logic in entrypoints) would couple business logic to the extension runtime
and make unit testing require a DOM — rejected.

**`ApplicantData` as Zod schema, types inferred.** One schema is the runtime validator
(Stage 2 preview) and the compile-time type. `extra: Record<string,string>` holds
learned, non-resume fields (the "workday-only field remembered across companies" case)
without widening the typed core. Sensitive fields are simply not in the schema, making
storage of passwords/payment structurally impossible.

**Site adapter `plan()` / `fill()` split.** `plan(data) => FieldFill[]` computes the
intended writes without touching the page; `fill(plan)` performs them. This satisfies
"show what will be filled before filling" and "never auto-submit" at the type level.
The `FieldFill` write-strategy (native setter, dropdown/date handling) is a Stage-4
detail but its type exists now.

**Stubs throw `NotImplemented`.** Interfaces are real and compile; bodies throw. Tests
assert the throw + the model contract, so the suite is green and boundaries are proven
without pretending features exist.

**pnpm.** WXT's recommended package manager; strict, fast, disk-efficient.

## Risks / Trade-offs

- [WXT/version churn may change scaffold layout] → Pin WXT version in `package.json`;
  keep entrypoint names conventional so upgrades are mechanical.
- [Over-designing contracts before features exist] → Keep the model minimal (only the
  fields we know we need); grow schemas per later stage rather than speculatively.
- [Windows/pnpm + WXT toolchain friction] → Verify `pnpm build` produces `.output/`
  and the panel loads as the change's done-gate before marking complete.
- [Core isolation can silently erode] → Documented in `AGENTS.md` rule 2; enforced in
  review. A lint rule can be added later if drift appears.

## Open Questions

- None blocking. Whether to add an ESLint `no-restricted-imports` rule banning
  `chrome`/DOM in `src/core` is deferred until drift is observed.
