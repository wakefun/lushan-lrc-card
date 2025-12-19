# Repository Guidelines

## Project Structure & Module Organization

- `src/` — React + TypeScript app code.
  - `src/pages/` page-level routes/views (e.g. `HomePage.tsx`, `LyricPage.tsx`)
  - `src/components/` reusable UI (cards, effects, prompts)
  - `src/store/` Zustand state (entry: `src/store/app.ts`)
  - `src/services/` persistence and IO (IndexedDB wrappers)
  - `src/utils/` helpers (e.g. LRC parsing, animation presets)
  - `src/assets/` in-app SVG/assets used by the UI
- `public/` — static files served as-is (PWA icons in `public/icons/`).
- `db.json` — bundled lyric database used for offline-first startup.
- `ui/` — design/source images (not runtime code).
- `dist/` — production build output (generated; do not commit).

## Build, Test, and Development Commands

- Prereqs: Node.js `24` (see `.node-version`) and `pnpm`.
- `pnpm install` — install dependencies.
- `pnpm dev` — run Vite dev server (default: `http://localhost:5173`).
- `pnpm build` — typecheck (`tsc -b`) and build to `dist/`.
- `pnpm preview` — serve the built app locally.
- `pnpm lint` — run ESLint over the repo (use `pnpm lint -- --fix` for autofix).

## Coding Style & Naming Conventions

- TypeScript (strict) + React function components.
- Formatting (match existing): 2-space indentation, single quotes, no semicolons.
- Names: `PascalCase.tsx` for components/pages, `camelCase.ts` for utilities; hooks as `useXxx.ts`.
- Imports: prefer `@/…` for `src/` paths (configured in `tsconfig.json` and `vite.config.ts`).
- Styling: Tailwind utilities first; keep shared tokens/colors in `tailwind.config.js` and global CSS in `src/index.css`.

## Testing Guidelines

- No automated test runner is configured yet.
- Before opening a PR, run `pnpm lint` and `pnpm build`, and do a quick manual check in `pnpm dev` (especially for offline/PWA flows).

## Commit & Pull Request Guidelines

- Use Conventional Commits (current history uses `feat:`, `chore:`, etc.).
- PRs should include: what/why, how to verify, and screenshots/GIFs for UI changes.
- If you touch PWA caching (`vite.config.ts`) or persistence (IndexedDB), call out migration/invalidations and test offline behavior.
