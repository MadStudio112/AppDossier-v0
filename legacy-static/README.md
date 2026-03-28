# AppDossier v1
## Summary
- Die bestehende statische Sammlung aus index plus 10 Dokumentseiten wird in eine React + Vite + TanStack Router-SPA für Vercel überführt.
- Die neue Vorlage bleibt inhaltlich JSON-getrieben: eine globale App-Konfiguration, eine JSON-Datei pro Seite, flache URLs wie /prd, /pitch, /finanzplan.
- Die visuelle Wahrheit bleibt eine zentrale CSS-Datei. Die Designsystem-Seite dokumentiert dieses Styling, erzeugt es aber nicht.
- Ziel der ersten Umsetzung ist volle 1:1-Parität zu den heutigen Seiten, nicht nur ein Framework-Skeleton.
## Implementation Changes
- Routing auf zwei Ebenen festlegen: / für die Dokumentübersicht und eine dynamische Dokumentroute für alle Slugs aus dem Content-Registry; unbekannte Slugs liefern eine 404-Seite.
Eine gemeinsame Dokument-Shell bauen, die Header, Meta-Leiste, Sticky-Inhaltsnavigation, Footer und Scrollspy zentral kapselt; das aktuelle Inline-JavaScript wird in einen React-Hook überführt.
- Die Startseite wird nicht mehr manuell gepflegt, sondern aus der Registry generiert: Reihenfolge, Titel, Kurztexte, Status und Zielroute kommen aus den JSON-Daten.
- Das Datenmodell wird hybrid und strikt validiert: feste Blocktypen für die wiederkehrenden Layoutmuster, aber keine freien HTML-Strings im JSON.
- Für v1 wird der Blockkatalog fest definiert, damit alle heutigen Seiten ohne Sonderlogik abbildbar sind: richText, highlight, quote, statsGrid, cardGrid, featureList, pillRow, table, swot, timeline, revenueList, personaGrid, moscowGrid, acceptanceList, flowSteps, useCaseCards, sitemapTree, featureBlocks, loopDiagram, kpiRow, investmentBreakdown, marketCards, competitionMatrix, trendList, partnerGrid, unitGrid, milestoneList, colorPalette, archFlow, ctaPanel.
- Seiten mit heutigen Sondermustern wie PRD, Use Cases, Marktanalyse und Design System werden in diesen Blockkatalog überführt; falls dabei noch ein Muster fehlt, wird es als benannter Block ergänzt und nicht als Einzelfall eingebaut.
- Das zentrale CSS wird übernommen, bereinigt und auf benannte Komponenten/Varianten ausgerichtet; die heutigen inl-*-Restklassen werden entfernt statt mitgeschleppt.
shadcn wird nur selektiv genutzt, wo es wirklich primitives liefert, ohne das visuelle System zu übernehmen; die dossier-spezifischen Layoutblöcke bleiben eigene Komponenten.
- Der Migrationsablauf bleibt zweistufig: erst App-Shell, Registry, Validierung, Blockrenderer und Theme-CSS; danach vollständige Inhaltsmigration aller bestehenden Seiten; die alten HTML-Dateien bleiben bis zur visuellen Parität nur Referenzmaterial.
## Public Interfaces
- AppConfig: globale Brand- und App-Metadaten, Home-Hero, Standard-SEO, Dokumentreihenfolge, Footer-Navigation.
- DocumentPage: slug, title, badge, subtitle, meta, toc, sections, optionale Seiteneinstellungen.
- DocumentSection: id, label, title, optionaler Introtext, blocks.
ContentBlock: diskriminierte Union über den festgelegten Blockkatalog; Varianten erfolgen über explizite Felder wie variant, theme, columns, nicht über freie Struktur.
- JSON-Dateien werden beim Laden per Laufzeitvalidierung geprüft; fehlerhafte Inhalte brechen Dev-Start und Build früh ab.
- Das Content-Registry ist die einzige Quelle für Routen, Home-Karten, Footer-Links und Dokumenttitel; diese Informationen werden nicht zusätzlich in Komponenten gespiegelt.
## Test Plan
- Schema-Tests für AppConfig, DocumentPage, DocumentSection und jeden Blocktyp, inklusive Negativfällen.
- Rendering-Smoke-Tests für die Startseite und mehrere repräsentative Dokumente mit einfachen und komplexen Blocks.
- Routing-Tests für direkte Aufrufe und Browser-Refresh auf flachen Slugs unter Vercel-Rewrite-Bedingungen.
- UI-Tests für Scrollspy, Anchor-Navigation, aktive Footer-/Header-Zustände und 404-Verhalten.
- Responsive Checks auf Mobil, Tablet und Desktop, besonders für Tabellen, SWOT/Moscow-Layouts, Kartenraster und Sticky-Navigation.
- Visuelle Paritätsprüfung gegen die heutigen HTML-Seiten, bevor Altdateien entfernt werden.
- Text- und Encoding-Prüfung, damit alle deutschen Inhalte sauber als UTF-8 ohne Mojibake angezeigt werden.
## Assumptions
- V1 bleibt deutschsprachig; i18n ist nicht Teil des ersten Schnitts.
- Der Authoring-Flow bleibt rein repo-basiert: JSON ausfüllen, zentrale CSS anpassen, deployen; kein CMS, kein Admin-UI, kein Markdown.
- SEO im ersten Wurf bedeutet saubere Seitentitel, Beschreibungen und stabile URLs, nicht SSR.
- Die Designsystem-Seite bleibt eine normale Inhaltsseite, die das aktuell verwendete Theme dokumentiert.
- Die URL-Namen der bestehenden Dateien bleiben als Slugs erhalten, damit die neue Struktur nah an der alten bleibt.
