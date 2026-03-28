
# AppDossier

> JSON-getriebene Dossier-Website mit React und Vite: PRD, Pitch und weitere Kerndokumente als eine lesbare, per JSON und CSS anpassbare Präsentation — für Produktteams und Stakeholder.

Inhalte liegen als validierte JSON-Dateien vor und werden clientseitig gerendert; kein klassisches CMS nötig. Zielgruppe: Teams, die Produkt- und Geschäftsdokumentation konsistent und navigierbar ausliefern wollen.

---

## Product

| Key         | Value                                      |
| ----------- | ------------------------------------------ |
| Logo        | 🔴                                         |
| Name        | TEAMCHEF (Markeninhalt in `app-config.json`); Projektname npm: `appdossier-v1` |
| Domain      | 🔴                                         |
| Headline    | Alle Kerndokumente – strukturiert abrufbar |
| Subheadline | Dokumentenübersicht auf Basis der Notion-Datenbank (siehe `src/content/manual/app-config.json`). |
| Vorteile    | JSON-Authoring, Zod-Validierung zur Laufzeit, eine SPA mit flachen Slugs |
| Lösung      | Zentrale Dossier-Site aus JSON + zentraler CSS-Datei, deploybar auf Vercel. |
| Zielgruppe  | Produktteams, Stakeholder, die PRD/Pitch/Marktanalyse & Co. als Web-Dossier lesen |
| Pricing     | 🔴                                         |

---

## Development

| Key     | Value                                      |
| ------- | ------------------------------------------ |
| Phase   | MVP (laut Home-Metadaten im Content)       |
| Domain  | 🔴                                         |
| Repo    | 🔴                                         |
| Created | 🔴                                         |

---

## Features

| Funktion            | Was der User damit tut                                      |
| ------------------- | ----------------------------------------------------------- |
| Dossier-Seiten      | Navigiert zwischen Slugs (z. B. `/prd`, `/pitch`) per Router |
| Home-Übersicht      | Sieht Karten-Übersicht aller Dokumente (Konfiguration in `app-config.json`) |
| Inhalte bearbeiten  | Passt `src/content/manual/pages/*.json` und `app-config.json` an |
| Legacy-Migration    | Führt optional `npm run migrate:legacy` aus, um aus `legacy-static/` neu zu bootstrapen |
| Tests               | Startet `npm test` (Vitest) für Registry, Router, Hooks     |

---

## Specs

| Key                  | Value                                      |
| -------------------- | ------------------------------------------ |
| Component Library    | Keine externe UI-Library; eigene Styles in `src/styles/app.css` |
| Styling              | Zentrales CSS (`app.css`), kein Tailwind im Dependency-Tree |
| Mehrsprachigkeit     | Locale `de-AT` im Content-Config; kein i18n-Framework |
| Theming              | 🔴                                         |
| Ordnerstruktur       | `src/app`, `src/content`, `src/hooks`, `src/styles` |
| Validierung          | Zod-Schemas für JSON-Inhalte (Runtime)     |

---

## Tech Stack

| Layer          | Tech                                           |
| -------------- | ---------------------------------------------- |
| Frontend       | React 19, Vite 8, TypeScript, TanStack Router  |
| Backend        | — (statische SPA, keine API im Repo)           |
| Database       | —                                              |
| Auth           | —                                              |
| Payments       | —                                              |
| Hosting        | Vercel (`vercel.json`, SPA-Rewrites)           |
| Testing        | Vitest, Testing Library, jsdom                 |

---

## Struktur

```bash
root/
├── docs/
│   └── README.md          # ausführliche Authoring- & JSON-Hinweise
├── legacy-static/         # Referenz-HTML/CSS (Migration)
├── scripts/
├── src/
│   ├── app/               # Router, Pages
│   ├── content/manual/    # app-config.json, pages/*.json
│   ├── hooks/
│   ├── styles/            # app.css
│   └── utils/
├── vercel.json
├── vite.config.ts
├── package.json
└── README.md
```

---

## Quickstart

```bash
npm install
npm run dev   # http://localhost:5173 (Vite-Standard)
```

---

## Docs

| Datei                            | Inhalt                          |
| -------------------------------- | ------------------------------- |
| [docs/README.md](./docs/README.md) | Befehle, JSON-Struktur, Kurzformen, Authoring |
| [AGENTS.md](./AGENTS.md)         | Regeln & Qualitätsgates für Agents |
| DESIGN.md                        | 🔴 (nicht im Repo)              |
| [HEALTH.md](./HEALTH.md)         | Quick-Scan: TS, Lint, Tests, Security, Bundle |
| [STATUS.md](./STATUS.md)         | Phase, Sprint, In Progress, Next (manuell) |
| STRUKTURE.md                     | 🔴 (nicht im Repo)              |

---

## License

MIT
