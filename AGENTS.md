# AGENTS.md

## Cursor Cloud specific instructions

AI Vacancy Analyzer is a **client-side-only** React 19 + TypeScript app built with Vite. There is no backend, database, or external AI API — vacancy analysis runs entirely in the browser (`src/analyzer.ts`).

- Dependencies are installed automatically by the update script (`npm ci`), so you do not need to reinstall on a fresh pod.
- Standard scripts live in `package.json`: `npm run dev` (Vite dev server), `npm run build` (`tsc -b && vite build`), `npm run lint` (oxlint), `npm run preview`.
- The dev server binds `0.0.0.0:5173` and is preconfigured for external/tunnel hosts (`.trycloudflare.com`) via `vite.config.ts`. Run it as a long-lived process (e.g. a tmux-backed terminal), not in `install`/`start`.
- Lint uses `oxlint` (config in `.oxlintrc.json`), not ESLint.
