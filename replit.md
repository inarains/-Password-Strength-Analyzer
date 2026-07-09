# Password Strength Analyzer

A privacy-first password strength analyzer and security recommendation system. Everything runs client-side in the browser — passwords are never transmitted, stored, or logged.

## Run & Operate

- `pnpm --filter @workspace/password-analyzer run dev` — run the Password Strength Analyzer web app
- `pnpm --filter @workspace/password-analyzer run typecheck` — typecheck the app
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000, unrelated scaffold artifact)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Password Analyzer: React + Vite, Tailwind, Inter + JetBrains Mono fonts
- API: Express 5 (scaffold artifact, not used by the analyzer)
- DB: PostgreSQL + Drizzle ORM (scaffold artifact, not used by the analyzer)

## Where things live

- `artifacts/password-analyzer/src/lib/password-analyzer.ts` — core analysis logic: entropy calculation, weakness/pattern detection (dictionary words, keyboard patterns, repeats, numeric-only, common substitutions), crack-time estimation, recommendations, and the secure password generator.
- `artifacts/password-analyzer/src/pages/analyzer.tsx` — main UI: strength meter, criteria checklist, recommendations, and generator controls.

## Architecture decisions

- Built as a standalone artifact, not integrated with the API server/DB artifacts, since passwords must never leave the browser for security/privacy reasons — there is no backend call or persistence layer by design.
- Crack-time estimates are computed from an *effective* entropy (raw entropy minus a penalty derived from detected weaknesses/patterns), not raw entropy alone — this keeps the crack-time number consistent with the weakness checklist (e.g. a password matching a common word pattern shows a fast crack time even if its raw character-set entropy looks high).

## Product

VaultTech Password Auditor analyzes any password in real time entirely in the browser: strength score, specific weaknesses (common patterns, keyboard sequences, repeats, substitutions), estimated crack time, a criteria checklist, tailored recommendations, a best-practices education section (password managers, 2FA), and a secure password generator with adjustable length and character sets.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The `origin` git remote must use an HTTPS URL (not `git@github.com:...`) for the git-remote push/pull tooling to authenticate; convert with `git remote set-url origin https://github.com/...` if pushes fail with `NO_REMOTE`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
