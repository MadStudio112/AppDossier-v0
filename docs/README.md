# AppDossier v1

JSON-getriebene React/Vite-Dossier-Vorlage mit TanStack Router und zentraler CSS-Datei.

## Befehle

- `npm install`
- `npm run dev`
- `npm run build`
- `npm test`
- `npm run migrate:legacy`

## Struktur

- `src/content/manual/app-config.json`: globale Brand- und Home-Konfiguration
- `src/content/manual/pages/*.json`: manuell gepflegte JSON-Datei pro Dossier-Seite
- `src/styles/app.css`: zentrale Design- und Komponentenstile
- `legacy-static/`: ursprüngliche HTML/CSS-Referenzdateien

## Vereinfachtes Authoring

- Seiten-JSONs enthalten keine abgeleiteten Felder mehr wie `slug`, `navLabel`, `homeCard`, `toc` oder `seoDescription`.
- `slug` kommt aus dem Dateinamen, Footer-Label und Home-Card-Metadaten aus `app-config.json`, TOC und Meta-Description aus den Sections bzw. `subtitle`.
- Häufige und komplexe Blöcke haben Kurzformen:
  - `text` statt `type: "richText"`
  - `highlight` statt `type: "highlight"`
  - `quote` statt `type: "quote"`
  - `stats` statt `type: "statsGrid"`
  - `cards` statt `type: "cardGrid"`
  - `card` statt `type: "contentCard"`
  - `personas` statt `type: "personaGrid"`
  - `features` statt `type: "featureList"`
  - `table`, `market`, `swot`, `stack`, `loop`, `timeline`, `sitemap`
  - `flow`, `matrix`, `acceptance`, `useCases`, `featureGrid`
  - `investment`, `units`, `milestones`, `architecture`, `revenue`, `canvas`
  - `palette`, `cta`, `trends`, `moscow`, `partners`, `letter`
- Die Registry normalisiert diese Kurzformen intern wieder auf das strikte Render-Schema.

```json
{
  "badge": "PRD · v1.0",
  "subtitle": "Product Requirements Document — Nicht-technische Fassung",
  "meta": [
    { "label": "Produkt", "value": "TEAMCHEF Web App" }
  ],
  "sections": [
    {
      "id": "vision",
      "number": "01",
      "nav": "Vision",
      "eyebrow": "Produktvision",
      "title": "Was ist TEAMCHEF?",
      "blocks": [
        { "highlight": "Kernaussage" },
        { "stats": [{ "value": "5", "label": "Bewertungskriterien" }], "columns": 3 },
        { "card": { "title": "Kontext", "text": "Kurztext", "list": ["Punkt A", "Punkt B"] } },
        {
          "table": {
            "columns": ["Kriterium", "Wert"],
            "rows": [{ "cells": [{ "text": "Status" }, { "text": "Aktiv", "tone": "green" }] }],
            "variant": "default"
          }
        },
        {
          "flow": {
            "title": "Ablauf",
            "variant": "default",
            "steps": [{ "id": "1", "title": "Start", "body": "Los geht's." }]
          }
        }
      ]
    }
  ]
}
```

## Arbeitsweise

1. Inhalte in `src/content/manual/pages/*.json` anpassen.
2. Home-Metadaten in `src/content/manual/app-config.json` ändern.
3. Design in `src/styles/app.css` anpassen.
4. Mit Vercel deployen; `vercel.json` rewritet alle Slugs auf die SPA.

## Hinweise

- Die Registry validiert alle JSON-Dateien zur Laufzeit mit Zod.
- Flache Slugs wie `/prd` oder `/pitch` werden direkt aus der Registry gerendert.
- `legacy-static/` bleibt als Referenz für visuelle Parität erhalten.
- `npm run migrate:legacy` überschreibt den manuellen Content-Ordner aus `legacy-static/` und ist nur zum Re-Bootstrapping gedacht.
