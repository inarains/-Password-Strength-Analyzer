# Password Strength Analyzer

A privacy-first password strength analyzer and security recommendation system. Everything runs client-side in the browser — passwords are never transmitted, stored, or logged.

## About

**VaultTech Password Auditor** analyzes any password in real time, entirely in your browser:

- Strength score with a live meter
- Weakness detection: common dictionary words, keyboard patterns (e.g. `qwerty`), repeated characters, numeric-only strings, and common substitutions (e.g. `p@ssw0rd`)
- Estimated crack time, adjusted for detected weaknesses so the number stays consistent with the checklist
- Criteria checklist (length, uppercase/lowercase, numbers, symbols, no common patterns)
- Tailored recommendations for improving the password
- A best-practices section covering password managers and two-factor authentication
- A secure password generator with adjustable length and character-set toggles

No password is ever sent over the network or persisted — all analysis happens locally in the browser.

## Getting started

```bash
pnpm --filter @workspace/password-analyzer run dev
```

## Project structure

This repo is a pnpm workspace. The Password Strength Analyzer lives in `artifacts/password-analyzer`. See `replit.md` for the full run/operate guide, architecture notes, and gotchas.
