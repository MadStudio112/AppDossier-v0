# AGENTS

> React/Vite-SPA: Dossier aus JSON mit Zod-Validierung; kein Backend im Repo.

## Operating Mode

| Key | Value |
| --- | ----- |
| Mode | Brownfield |
| Language | TypeScript |
| Runtime | Node (Vite) |
| Package | npm |

## Quality Gates

```bash
npx tsc --noEmit -p tsconfig.app.json
npm test
npm run build
```
## Regeln

- `@/` → `src` (`vite.config.ts`).
- JSON-Seiten in `src/content/manual/pages/`; Validierung `schemas.ts`/`registry.ts`; Kurzformen: `docs/README.md`.
- **Slug = Dateiname** ohne `.json` — kein `slug` in den Seiten-JSONs.
- `migrate:legacy` nur bei **expliziter Nutzeranweisung** (überschreibt manuellen Content).

## No-Gos

- `migrate:legacy` ohne Auftrag; keine Meta-Felder wie `slug`/`navLabel`/`toc` in Seiten-JSONs zurückbringen.
- Env-Story erfinden: keine `import.meta.env` in `src/`.

## Confusion Points

- Package `appdossier-v1` vs. Ordner `AppDossier-v0`. `docs/README.md` = JSON-Authoring; Root-`README.md` = Überblick.
