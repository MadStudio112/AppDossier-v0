import { Fragment, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from '@tanstack/react-router'
import { appConfig, documentPages } from '@/content/registry'
import { useScrollSpy } from '@/hooks/use-scrollspy'
import { renderInlineText } from '@/utils/inline-text'
import type { CardContent, ContentBlock, DocumentPage, DocumentSection, TableCell, Tag, Tone } from '@/content/schemas'

export function HomeRoutePage() {
  return (
    <>
      <Helmet>
        <html lang="de" />
        <title>{appConfig.brand} – Dokumente</title>
        <meta name="description" content={appConfig.home.subtitle} />
      </Helmet>
      <header className="doc-header">
        <div className="header-inner">
          <div className="doc-badge">{appConfig.home.badge}</div>
          <h1 className="doc-title">{appConfig.home.title}</h1>
          <p className="doc-subtitle">{appConfig.home.subtitle}</p>
          <div className="doc-meta">
            {appConfig.home.meta.map((item) => (
              <div className="meta-item" key={item.label}>
                <span className="meta-label">{item.label}</span>
                <span className="meta-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="index-hero">
        <div className="doc-cards">
          {appConfig.home.cards.map((card) => (
            <Link key={card.slug} to="/$slug" params={{ slug: card.slug }} className="doc-card">
              <div className="doc-card-num">{card.number}</div>
              <div className="doc-card-title">{card.title}</div>
              <div className="doc-card-sub">{renderInlineText(card.summary)}</div>
              <div className="doc-card-link">{card.linkLabel}</div>
            </Link>
          ))}
        </div>
      </main>

      <DocumentFooter />
    </>
  )
}

export function DocumentRoutePage({ page }: { page: DocumentPage }) {
  const activeId = useScrollSpy(page.sections.map((section) => section.id))

  return (
    <>
      <Helmet>
        <html lang="de" />
        <title>{page.title}</title>
        <meta name="description" content={page.seoDescription} />
      </Helmet>
      <header className="doc-header">
        <div className="header-inner">
          <div className="doc-badge">{page.badge}</div>
          <h1 className="doc-title">{appConfig.brand}</h1>
          <p className="doc-subtitle">{page.subtitle}</p>
          <div className="doc-meta">
            {page.meta.map((item) => (
              <div className="meta-item" key={item.label}>
                <span className="meta-label">{item.label}</span>
                <span className="meta-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <nav className="doc-nav" aria-label="Inhaltsnavigation">
        <div className="nav-inner">
          {page.toc.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={`nav-link${activeId === item.id ? ' active' : ''}`}>
              <span className="nav-num">{item.number}</span>
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <main className="page-stack">
        {page.lead ? (
          <div className="pitch-hero">
            <div className="big-claim">{page.lead.claim}</div>
            <div className="pitch-intro">{page.lead.intro}</div>
          </div>
        ) : null}

        {page.sections.map((section) => (
          <DocumentSectionView key={section.id} section={section} />
        ))}
      </main>

      <DocumentFooter activeSlug={page.slug} />
    </>
  )
}

export function NotFoundRoutePage() {
  return (
    <>
      <Helmet>
        <html lang="de" />
        <title>{appConfig.brand} – Nicht gefunden</title>
      </Helmet>
      <main className="document-not-found">
        <div className="highlight">
          <p>{renderInlineText('Die angeforderte Dossier-Seite existiert nicht. Wähle ein Dokument aus der Übersicht.')}</p>
        </div>
        <div className="section-block">
          <Link to="/" className="doc-card">
            <div className="doc-card-title">Zur Übersicht</div>
            <div className="doc-card-sub">Alle verfügbaren Dokumente anzeigen.</div>
            <div className="doc-card-link">Start öffnen</div>
          </Link>
        </div>
      </main>
    </>
  )
}

function DocumentSectionView({ section }: { section: DocumentSection }) {
  return (
    <section className="section" id={section.id}>
      <div className="section-label">{section.label}</div>
      <h2 className="section-title">{section.title}</h2>
      <div className="divider" />
      {section.blocks.map((block, index) => (
        <div key={`${section.id}-${index}`} className="section-block">
          <BlockRenderer block={block} />
        </div>
      ))}
    </section>
  )
}

function DocumentFooter({ activeSlug }: { activeSlug?: string }) {
  const [printOpen, setPrintOpen] = useState(false)
  const [printSlugs, setPrintSlugs] = useState<string[] | null>(null)

  const handlePrint = (slugs: string[]) => {
    setPrintOpen(false)
    setPrintSlugs(slugs)
    setTimeout(() => {
      window.print()
      setPrintSlugs(null)
    }, 150)
  }

  return (
    <>
      <footer className="doc-footer">
        <Link className="footer-brand" to="/">{appConfig.brand}</Link>
        <nav className="footer-nav" aria-label="Dokument Navigation">
          {documentPages.map((page) => (
            <Link key={page.slug} to="/$slug" params={{ slug: page.slug }} className={`footer-nav-link${activeSlug === page.slug ? ' active' : ''}`}>
              {page.navLabel}
            </Link>
          ))}
          <button className="footer-print-btn" onClick={() => setPrintOpen(true)} title="Als PDF exportieren" aria-label="Als PDF exportieren">
            <PrintIcon />
          </button>
        </nav>
      </footer>
      {printOpen && <PrintModal onClose={() => setPrintOpen(false)} onPrint={handlePrint} />}
      {printSlugs !== null && (
        <div className="print-content" aria-hidden="true">
          {printSlugs.map((slug) => {
            const page = documentPages.find((p) => p.slug === slug)
            return page ? <PrintDocumentPage key={slug} page={page} /> : null
          })}
        </div>
      )}
    </>
  )
}

function PrintIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3" y="1" width="8" height="3" rx="0.5" fill="currentColor" />
      <rect x="1" y="4" width="12" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <rect x="3" y="8" width="8" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="10.5" cy="6.5" r="0.75" fill="currentColor" />
    </svg>
  )
}

function PrintModal({ onClose, onPrint }: { onClose: () => void; onPrint: (slugs: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(documentPages.map((p) => p.slug))
  )

  const toggle = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const allSelected = selected.size === documentPages.length
  const noneSelected = selected.size === 0

  return (
    <div className="print-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="print-dialog" role="dialog" aria-modal="true" aria-label="Als PDF exportieren">
        <div className="print-dialog-header">
          <span className="print-dialog-title">Als PDF exportieren</span>
          <button className="print-dialog-close" onClick={onClose} aria-label="Schließen">✕</button>
        </div>
        <div className="print-dialog-body">
          <div className="print-select-controls">
            <button className="print-ctrl-btn" onClick={() => setSelected(new Set(documentPages.map((p) => p.slug)))} disabled={allSelected}>Alle</button>
            <button className="print-ctrl-btn" onClick={() => setSelected(new Set())} disabled={noneSelected}>Keine</button>
          </div>
          <div className="print-checkbox-list">
            {documentPages.map((page, index) => (
              <label key={page.slug} className="print-checkbox-row">
                <input type="checkbox" checked={selected.has(page.slug)} onChange={() => toggle(page.slug)} className="print-checkbox-input" />
                <span className="print-checkbox-num">{String(index + 1).padStart(2, '0')}</span>
                <span className="print-checkbox-label">{page.navLabel}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="print-dialog-footer">
          <button className="print-btn-cancel" onClick={onClose}>Abbrechen</button>
          <button className="print-btn-confirm" onClick={() => onPrint([...selected])} disabled={noneSelected}>
            <PrintIcon /> Als PDF speichern
          </button>
        </div>
      </div>
    </div>
  )
}

function PrintDocumentPage({ page }: { page: DocumentPage }) {
  return (
    <div className="print-document">
      <div className="print-doc-header">
        <div className="print-doc-badge">{page.badge}</div>
        <h1 className="print-doc-title">{page.title}</h1>
        <p className="print-doc-subtitle">{page.subtitle}</p>
        {page.meta.length > 0 && (
          <div className="print-doc-meta">
            {page.meta.map((item) => (
              <div key={item.label} className="print-meta-item">
                <span className="print-meta-label">{item.label}</span>
                <span className="print-meta-value">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {page.lead && (
        <div className="print-doc-lead">
          <div className="print-lead-claim">{page.lead.claim}</div>
          <p className="print-lead-intro">{page.lead.intro}</p>
        </div>
      )}
      {page.sections.map((section) => (
        <DocumentSectionView key={section.id} section={section} />
      ))}
    </div>
  )
}

function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'highlight':
      return <TextBlockCard className="highlight" paragraphs={block.paragraphs} paragraphClassName="text-lead" />
    case 'quote':
      return <TextBlockCard className="blockquote" paragraphs={block.paragraphs} />
    case 'richText':
      return <ParagraphList paragraphs={block.paragraphs} />
    case 'statsGrid':
      return <StatsGrid block={block} />
    case 'cardGrid':
      return <CardGrid block={block} />
    case 'contentCard':
      return <CardPanel content={block} />
    case 'featureList':
      return <FeatureListBlock block={block} />
    case 'personaGrid':
      return <PersonaGrid block={block} />
    case 'moscowGrid':
      return <MoscowGrid block={block} />
    case 'marketCards':
      return <MarketCards block={block} />
    case 'table':
      return <TableBlock block={block} />
    case 'competitionMatrix':
      return <CompetitionMatrix block={block} />
    case 'swot':
      return <SwotBlock block={block} />
    case 'timeline':
      return <TimelineBlock block={block} />
    case 'flowSteps':
      return <FlowStepsBlock block={block} />
    case 'useCaseCards':
      return <UseCaseCardsBlock block={block} />
    case 'sitemapTree':
      return <SitemapTreeBlock block={block} />
    case 'featureBlocks':
      return <FeatureBlocks block={block} />
    case 'loopDiagram':
      return <LoopDiagram block={block} />
    case 'investmentBreakdown':
      return <InvestmentBreakdown block={block} />
    case 'letterBody':
      return <LetterBodyBlock block={block} />
    case 'canvasGrid':
      return <CanvasGrid block={block} />
    case 'revenueList':
      return <RevenueList block={block} />
    case 'unitGrid':
      return <UnitGrid block={block} />
    case 'partnerGrid':
      return <PartnerGrid block={block} />
    case 'acceptanceList':
      return <AcceptanceList block={block} />
    case 'colorPalette':
      return <ColorPalette block={block} />
    case 'stackedList':
      return <StackedList block={block} />
    case 'milestoneList':
      return <MilestoneList block={block} />
    case 'archFlow':
      return <ArchFlow block={block} />
    case 'ctaPanel':
      return <CtaPanel block={block} />
    case 'trendList':
      return <TrendList block={block} />
    default: {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn('[BlockRenderer] Unknown block type:', (block as { type: string }).type)
      }
      return null
    }
  }
}

function ParagraphList({ paragraphs, className = '' }: { paragraphs: string[]; className?: string }) {
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 12)}`} className={className || undefined}>{renderInlineText(paragraph)}</p>
      ))}
    </>
  )
}

function TextBlockCard({ className, paragraphs, paragraphClassName }: { className: string; paragraphs: string[]; paragraphClassName?: string }) {
  return (
    <div className={className}>
      <ParagraphList paragraphs={paragraphs} className={paragraphClassName} />
    </div>
  )
}

function titleToneClass(tone?: Tone) {
  if (!tone || tone === 'muted') return ''
  return ` title-tone-${tone}`
}

function tagToneClass(tone?: Tone) {
  if (!tone || tone === 'muted') return 'tag-blue'
  return `tag-${tone}`
}
function StatsGrid({ block }: { block: Extract<ContentBlock, { type: 'statsGrid' }> }) {
  return <div className={`grid-${block.columns}`}>{block.items.map((item) => <div className="stat-card" key={`${item.label}-${item.value}`}><div className="stat-value">{item.value}</div><div className="stat-label">{item.label}</div></div>)}</div>
}

function CardGrid({ block }: { block: Extract<ContentBlock, { type: 'cardGrid' }> }) {
  return <div className={`grid-${block.columns}`}>{block.cards.map((card, index) => <CardPanel key={`${card.title ?? 'card'}-${index}`} content={card} />)}</div>
}

function CardPanel({ content }: { content: CardContent }) {
  return <div className="card">{content.title ? <div className={`card-title${titleToneClass(content.titleTone)}`}>{content.title}</div> : null}{content.paragraphs ? <ParagraphList paragraphs={content.paragraphs} /> : null}{content.items ? <ul className="feature-list">{content.items.map((item, index) => <li key={`${index}-${item.slice(0, 10)}`}>{renderInlineText(item)}</li>)}</ul> : null}{content.tags?.length ? <div className="pill-row">{content.tags.map((tag) => <TagPill key={`${tag.label}-${tag.tone}`} tag={tag} />)}</div> : null}</div>
}

function FeatureListBlock({ block }: { block: Extract<ContentBlock, { type: 'featureList' }> }) {
  return <div className="card"><div className={`card-title${titleToneClass(block.titleTone)}`}>{block.title}</div><ul className="feature-list">{block.items.map((item, index) => <li key={`${index}-${item.slice(0, 10)}`}>{renderInlineText(item)}</li>)}</ul></div>
}

function PersonaGrid({ block }: { block: Extract<ContentBlock, { type: 'personaGrid' }> }) {
  return <div className="grid-3">{block.items.map((item) => <div className="persona-card" key={item.name}><div className="persona-avatar">{item.avatar}</div><div className="persona-name">{item.name}</div><div className="persona-role">{item.role}</div><div className="persona-needs">{item.needs}</div></div>)}</div>
}

function MoscowGrid({ block }: { block: Extract<ContentBlock, { type: 'moscowGrid' }> }) {
  return <div className="moscow">{block.items.map((item) => <div className={`moscow-q ${item.quadrant === 'wont' ? 'wont' : item.quadrant}`} key={item.title}><h4>{item.title}</h4><ul>{item.items.map((listItem, index) => <li key={`${index}-${listItem.slice(0, 10)}`}>{renderInlineText(listItem)}</li>)}</ul></div>)}</div>
}

function MarketCards({ block }: { block: Extract<ContentBlock, { type: 'marketCards' }> }) {
  if (block.variant === 'tam') {
    return <div className="tam-detail">{block.items.map((item, index) => <div className="tam-detail-card" key={`${index}-${item.title ?? item.description}`}><div className={`tam-val${item.tone ? titleToneClass(item.tone) : ''}`}>{item.value}</div><div className={`tam-name${item.tone ? titleToneClass(item.tone) : ''}`}>{item.title}</div><div className="tam-desc">{renderInlineText(item.description)}</div></div>)}</div>
  }
  if (block.variant === 'segment') {
    return <div className={`grid-${block.columns}`}>{block.items.map((item, index) => <div className="segment-card" key={`${index}-${item.title ?? item.description}`}><div className="segment-size">{item.value}</div><div className="segment-name">{item.title}</div><div className="segment-desc">{renderInlineText(item.description)}</div>{item.tags?.length ? <div className="segment-tags">{item.tags.map((tag) => <TagPill key={`${tag.label}-${tag.tone}`} tag={tag} />)}</div> : null}</div>)}</div>
  }
  if (block.variant === 'problem') {
    return <div className={`grid-${block.columns}`}>{block.items.map((item, index) => <div className="problem-item" key={`${index}-${item.title ?? item.description}`}><div className="problem-label">{item.title}</div><div className="problem-desc">{renderInlineText(item.description)}</div></div>)}</div>
  }
  if (block.variant === 'solution') {
    return <div className="solution-stack">{block.items.map((item, index) => <div className="solution-item" key={`${index}-${item.title ?? item.description}`}><div className="solution-label">{item.title}</div><div className="solution-desc">{renderInlineText(item.description)}</div></div>)}</div>
  }
  return <div className={`grid-${block.columns}`}>{block.items.map((item, index) => <div className="market-stat" key={`${index}-${item.value ?? item.description}`}><div className="market-big">{item.value}</div><div className="market-label">{renderInlineText(item.description)}</div></div>)}</div>
}

function TableBlock({ block }: { block: Extract<ContentBlock, { type: 'table' }> }) {
  const table = <table className={block.variant === 'freemium' ? 'freemium-table' : 'doc-table'}><thead><tr>{block.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{block.rows.map((row, rowIndex) => <tr key={`row-${rowIndex}`}>{row.cells.map((cell, cellIndex) => <td key={`cell-${rowIndex}-${cellIndex}`}>{renderTableCell(cell)}</td>)}</tr>)}</tbody></table>
  if (!block.title && !block.intro?.length && !block.note) return table
  return <div className="card">{block.title ? <div className="card-title">{block.title}</div> : null}{block.intro?.length ? <ParagraphList paragraphs={block.intro} /> : null}{table}{block.note ? <p className="table-note">{renderInlineText(block.note)}</p> : null}</div>
}

function CompetitionMatrix({ block }: { block: Extract<ContentBlock, { type: 'competitionMatrix' }> }) {
  return <div className="card"><div className="card-title">{block.title}</div><table className="comp-matrix"><thead><tr><th>Anbieter</th>{block.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{block.rows.map((row, rowIndex) => <tr key={`matrix-${rowIndex}`} className={row.highlight ? 'tc-row' : undefined}><td>{renderTableCell(row.label)}</td>{row.cells.map((cell, cellIndex) => <td key={`matrix-cell-${rowIndex}-${cellIndex}`}>{renderTableCell(cell)}</td>)}</tr>)}</tbody></table>{block.note ? <p className="table-note">{renderInlineText(block.note)}</p> : null}</div>
}

function SwotBlock({ block }: { block: Extract<ContentBlock, { type: 'swot' }> }) {
  const body = <div className={block.variant === 'mini' ? 'swot-mini' : 'swot'}>{block.items.map((item) => <div className={`${block.variant === 'mini' ? 'swot-mini-q' : 'swot-q'} swot-${item.quadrant}`} key={`${item.quadrant}-${item.title}`}><h4>{item.title}</h4><ul>{item.items.map((listItem, index) => <li key={`${index}-${listItem.slice(0, 10)}`}>{renderInlineText(listItem)}</li>)}</ul></div>)}</div>
  if (block.title) return <div className="card"><div className="card-title">{block.title}</div>{body}</div>
  return body
}

function TimelineBlock({ block }: { block: Extract<ContentBlock, { type: 'timeline' }> }) {
  return <div className="card">{block.title ? <div className="card-title">{block.title}</div> : null}<div className="timeline">{block.items.map((item) => <div className="phase" key={item.title}><div className="phase-label">{item.title}</div><p>{renderInlineText(item.body)}</p></div>)}</div></div>
}

function FlowStepsBlock({ block }: { block: Extract<ContentBlock, { type: 'flowSteps' }> }) {
  return <div className="card"><div className="card-title">{block.title}</div>{block.steps.map((step) => <div className="flow-step" key={step.id}><div className={`flow-num${block.variant === 'returning' ? ' alt' : ''}`}>{step.id}</div><div><div className="flow-title">{step.title}</div><div className="flow-desc">{renderInlineText(step.body)}</div>{step.detailTitle || step.detailItems?.length ? <div className="flow-detail"><div className="flow-detail-title">{step.detailTitle}</div><ul>{step.detailItems?.map((item, index) => <li key={`${index}-${item.slice(0, 10)}`}>{renderInlineText(item)}</li>)}</ul></div> : null}</div></div>)}</div>
}

function UseCaseCardsBlock({ block }: { block: Extract<ContentBlock, { type: 'useCaseCards' }> }) {
  return <>{block.items.map((item) => <div className="uc-card" key={item.id}><div className="uc-header"><div className="uc-id">{item.id}</div>{item.tag ? <TagPill tag={item.tag} /> : null}</div><div className="uc-title">{item.title}</div><div className="uc-desc">{renderInlineText(item.description)}</div><div className="uc-meta"><div className="uc-meta-block"><div className="uc-meta-label">Vorbedingung</div><div className="uc-meta-value">{renderInlineText(item.precondition)}</div></div><div className="uc-meta-block"><div className="uc-meta-label">Ergebnis</div><div className="uc-meta-value">{renderInlineText(item.result)}</div></div></div></div>)}</>
}
function SitemapTreeBlock({ block }: { block: Extract<ContentBlock, { type: 'sitemapTree' }> }) {
  return <div className="card">{block.title ? <div className="card-title">{block.title}</div> : null}<SitemapNodes nodes={block.nodes} /></div>
}

function SitemapNodes({ nodes }: { nodes: Array<{ name: string; route?: string; tone?: Tone; children?: Array<{ name: string; route?: string; tone?: Tone; children?: unknown[] }> }> }) {
  return <>{nodes.map((node) => <Fragment key={`${node.name}-${node.route ?? 'root'}`}><div className="sitemap-item"><div className={`sitemap-dot${node.tone === 'blue' ? ' secondary' : node.tone === 'muted' ? ' tertiary' : ''}`} style={node.tone === 'amber' ? { background: 'var(--amber)' } : undefined} /><div className="sitemap-name">{node.name}</div><div className="sitemap-route">{node.route ?? ''}</div></div>{node.children?.length ? <div className="sitemap-level"><SitemapNodes nodes={node.children as never} /></div> : null}</Fragment>)}</>
}

function FeatureBlocks({ block }: { block: Extract<ContentBlock, { type: 'featureBlocks' }> }) {
  return <div className={`grid-${block.columns}`}>{block.items.map((item) => <div className="feature-block" key={item.title}><div className="feature-block-title">{item.title}</div><div className="feature-block-sub">{item.tag ? <TagPill tag={item.tag} /> : null}</div><ul>{item.items.map((listItem, index) => <li key={`${index}-${listItem.slice(0, 10)}`}>{renderInlineText(listItem)}</li>)}</ul></div>)}</div>
}

function LoopDiagram({ block }: { block: Extract<ContentBlock, { type: 'loopDiagram' }> }) {
  return <div className="card"><div className={`card-title${titleToneClass(block.titleTone)}`}>{block.title}</div><div className="loop-visual">{block.nodes.map((node, index) => <Fragment key={`${node.title}-${node.subtitle}`}><div className="loop-node"><div className="loop-node-title">{node.title}</div><div className="loop-node-sub">{node.subtitle}</div></div>{index < block.nodes.length - 1 ? <div className="loop-arrow">→</div> : null}</Fragment>)}</div>{block.note ? <p className="text-note">{renderInlineText(block.note)}</p> : null}</div>
}

function InvestmentBreakdown({ block }: { block: Extract<ContentBlock, { type: 'investmentBreakdown' }> }) {
  return <div className="invest-breakdown">{block.items.map((item) => <div className="invest-item" key={item.label}><div className="invest-item-label">{item.label}</div><div className="invest-item-value">{item.value}</div><div className="invest-item-desc">{renderInlineText(item.description)}</div><div className="horizon-bar">{Array.from({ length: item.totalSegments }, (_, index) => <div key={`${item.label}-${index}`} className={`horizon-segment${index >= item.filledSegments ? ' dim' : ''}`} />)}</div></div>)}</div>
}

function LetterBodyBlock({ block }: { block: Extract<ContentBlock, { type: 'letterBody' }> }) {
  return <div className="letter-body"><div className="letter-date">{block.date}</div><div className="letter-salutation">{block.salutation}</div>{block.paragraphs.map((paragraph, index) => <p className="letter-para" key={`${index}-${paragraph.slice(0, 10)}`}>{renderInlineText(paragraph)}</p>)}<div className="kpi-row">{block.kpis.map((item) => <div className="kpi" key={item.label}><div className="kpi-val">{item.value}</div><div className="kpi-lbl">{item.label}</div></div>)}</div><div className="letter-sign"><div className="sign-name">{block.signName}</div><div className="sign-title">{block.signTitle}</div></div></div>
}

function CanvasGrid({ block }: { block: Extract<ContentBlock, { type: 'canvasGrid' }> }) {
  return <>{block.rows.map((row, index) => <div key={`canvas-row-${index}`} className={`canvas-grid canvas-grid--${row.columns}`}>{row.blocks.map((item) => <div className={`canvas-block${item.accent ? ' canvas-block--accent' : ''}`} key={item.label}><div className="canvas-label">{item.label}</div><div className={`canvas-title${titleToneClass(item.titleTone)}`}>{item.title}</div><ul className="canvas-list">{item.items.map((listItem, listIndex) => <li key={`${listIndex}-${listItem.slice(0, 10)}`}>{renderInlineText(listItem)}</li>)}</ul></div>)}</div>)}</>
}

function RevenueList({ block }: { block: Extract<ContentBlock, { type: 'revenueList' }> }) {
  return <>{block.items.map((item) => <div className="revenue-stream" key={item.title}><div className="rs-header"><div><div className="rs-title">{item.title}</div></div>{item.phase ? <TagPill tag={item.phase} /> : null}</div><div className="rs-desc">{renderInlineText(item.description)}</div><div className="rs-mechanics"><div className="rs-mechanics-title">Mechanik</div><ul>{item.mechanics.map((mechanic, index) => <li key={`${index}-${mechanic.slice(0, 10)}`}>{renderInlineText(mechanic)}</li>)}</ul></div></div>)}</>
}

function UnitGrid({ block }: { block: Extract<ContentBlock, { type: 'unitGrid' }> }) {
  return <div className="unit-grid">{block.items.map((item) => <div className="unit-cell" key={item.label}><div className="unit-label">{item.label}</div><div className="unit-value">{item.value}</div><div className="unit-desc">{renderInlineText(item.description)}</div></div>)}</div>
}

function PartnerGrid({ block }: { block: Extract<ContentBlock, { type: 'partnerGrid' }> }) {
  return <div className="partner-box">{block.items.map((item) => <div className="partner-item" key={item.title}><div className="partner-icon">{item.icon}</div><div className="partner-name">{item.title}</div><div className="partner-desc">{renderInlineText(item.description)}</div></div>)}</div>
}

function AcceptanceList({ block }: { block: Extract<ContentBlock, { type: 'acceptanceList' }> }) {
  return <div className="card">{block.title ? <div className="card-title">{block.title}</div> : null}{block.items.map((item) => <div className="ac-row" key={item.number}><div className="ac-num">{item.number}</div><div className="ac-text"><strong>{item.title}</strong>{renderInlineText(item.body)}</div></div>)}</div>
}

function ColorPalette({ block }: { block: Extract<ContentBlock, { type: 'colorPalette' }> }) {
  return <>{block.groups.map((group) => <div className="card" key={group.title}><h3 className="card-title">{group.title}</h3><div className="color-grid">{group.colors.map((color) => <div className="color-chip" key={`${group.title}-${color.name}`}><div className="color-chip-swatch" style={{ background: color.hex }} /><div className="color-chip-name">{color.name}</div><div className="color-chip-hex">{color.hex}</div></div>)}</div></div>)}</>
}

function StackedList({ block }: { block: Extract<ContentBlock, { type: 'stackedList' }> }) {
  if (block.variant === 'competition') return <div className="card">{block.items.map((item) => <div className="comp-row" key={item.title}><div className="comp-name">{item.title}</div><div className="comp-desc">{renderInlineText(item.description)}</div><div className="comp-type">{item.tag ? <TagPill tag={item.tag} /> : null}</div></div>)}</div>
  if (block.variant === 'usp') return <div className="card">{block.items.map((item) => <div className="usp-big" key={`${item.label}-${item.title}`}><div className="usp-num">{item.label}</div><div className="usp-content"><h4>{item.title}</h4><p>{renderInlineText(item.description)}</p></div></div>)}</div>
  return <div className="card">{block.items.map((item) => <div className="roadmap-step" key={`${item.label}-${item.title}`}><div className="step-phase">{item.label}</div><div><div className="step-title">{item.title}</div><div className="step-desc">{renderInlineText(item.description)}</div></div></div>)}</div>
}

function MilestoneList({ block }: { block: Extract<ContentBlock, { type: 'milestoneList' }> }) {
  return <div className="card">{block.title ? <div className="card-title">{block.title}</div> : null}<div className="milestone-list">{block.items.map((item) => <div className="milestone-item" key={item.title}><div className="ms-icon">{item.icon}</div><div className="ms-content"><h4>{item.title}</h4><p>{renderInlineText(item.body)}</p></div></div>)}</div></div>
}

function ArchFlow({ block }: { block: Extract<ContentBlock, { type: 'archFlow' }> }) {
  return <div className="card">{block.title ? <div className="card-title">{block.title}</div> : null}{block.lead ? <p>{renderInlineText(block.lead)}</p> : null}<div className="arch-flow">{block.nodes.map((item, index) => <Fragment key={item.title}><div className="arch-node"><div className="arch-node-title">{item.title}</div><div className="arch-node-sub">{item.subtitle}</div></div>{index < block.nodes.length - 1 ? <div className="arch-arrow">→</div> : null}</Fragment>)}</div></div>
}

function CtaPanel({ block }: { block: Extract<ContentBlock, { type: 'ctaPanel' }> }) {
  return <div className="cta-box"><div className="cta-title">{block.title}</div><div className="cta-sub">{block.subtitle}</div>{block.slogan ? <div className="cta-slogan">{block.slogan}</div> : null}</div>
}

function TrendList({ block }: { block: Extract<ContentBlock, { type: 'trendList' }> }) {
  return <div className="card">{block.items.map((item) => <div className="trend-item" key={item.title}><div className="trend-icon">{item.icon}</div><div className="trend-content"><h4>{item.title}</h4><p>{renderInlineText(item.body)}</p></div></div>)}</div>
}

function TagPill({ tag }: { tag: Tag }) {
  return <span className={`tag ${tagToneClass(tag.tone)}`}>{tag.label}</span>
}

function renderTableCell(cell: TableCell) {
  if (cell.code) return <code className="code-inline">{cell.text}</code>
  if (cell.tone) return <TagPill tag={{ label: cell.text, tone: cell.tone }} />
  return renderInlineText(cell.text)
}
