import { z } from 'zod'
import {
  appConfigSchema,
  cardContentSchema,
  contentBlockSchema,
  documentPageSchema,
  documentSectionSchema,
  homeCardSchema,
  metaItemSchema,
  tagSchema,
  tocItemSchema,
  toneSchema,
  type AppConfig,
  type CardContent,
  type ContentBlock,
  type DocumentPage,
} from '@/content/schemas'

const textValueSchema = z.union([z.string().min(1), z.array(z.string().min(1)).min(1)])
const looseObjectSchema = z.record(z.string(), z.unknown())
const looseObjectArraySchema = z.array(looseObjectSchema).min(1)

const authoringCardContentSchema = z.object({
  title: z.string().min(1).optional(),
  titleTone: toneSchema.optional(),
  text: textValueSchema.optional(),
  paragraphs: z.array(z.string().min(1)).min(1).optional(),
  list: z.array(z.string().min(1)).min(1).optional(),
  items: z.array(z.string().min(1)).min(1).optional(),
  tags: z.array(tagSchema).min(1).optional(),
}).strict()

const authoringStatsBlockSchema = z.object({
  stats: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) }).strict()).min(1),
  columns: z.union([z.literal(2), z.literal(3)]).optional(),
}).strict()

const authoringCardsBlockSchema = z.object({
  cards: z.array(authoringCardContentSchema).min(1),
  columns: z.union([z.literal(2), z.literal(3)]).optional(),
}).strict()

const authoringCardBlockSchema = z.object({
  card: authoringCardContentSchema,
}).strict()

const authoringFeatureListBlockSchema = z.object({
  title: z.string().min(1).optional(),
  titleTone: toneSchema.optional(),
  features: z.array(z.string().min(1)).min(1),
}).strict()

const authoringPersonaGridSchema = z.object({
  personas: z.array(z.object({
    avatar: z.string().min(1),
    name: z.string().min(1),
    role: z.string().min(1),
    needs: z.string().min(1),
  }).strict()).min(1),
}).strict()

const authoringTableBlockSchema = z.object({ table: looseObjectSchema }).strict()
const authoringMarketBlockSchema = z.object({ market: looseObjectSchema }).strict()
const authoringSwotBlockSchema = z.object({ swot: looseObjectSchema }).strict()
const authoringStackBlockSchema = z.object({ stack: looseObjectSchema }).strict()
const authoringLoopBlockSchema = z.object({ loop: looseObjectSchema }).strict()
const authoringTimelineBlockSchema = z.object({ timeline: looseObjectSchema }).strict()
const authoringSitemapBlockSchema = z.object({ sitemap: looseObjectSchema }).strict()
const authoringPaletteBlockSchema = z.object({ palette: z.union([looseObjectSchema, looseObjectArraySchema]) }).strict()
const authoringInvestmentBlockSchema = z.object({ investment: looseObjectArraySchema }).strict()
const authoringFlowBlockSchema = z.object({ flow: looseObjectSchema }).strict()
const authoringArchitectureBlockSchema = z.object({ architecture: looseObjectSchema }).strict()
const authoringUnitsBlockSchema = z.object({ units: looseObjectArraySchema }).strict()
const authoringMilestonesBlockSchema = z.object({ milestones: looseObjectSchema }).strict()
const authoringAcceptanceBlockSchema = z.object({ acceptance: looseObjectSchema }).strict()
const authoringUseCasesBlockSchema = z.object({ useCases: looseObjectArraySchema }).strict()
const authoringMatrixBlockSchema = z.object({ matrix: looseObjectSchema }).strict()
const authoringRevenueBlockSchema = z.object({ revenue: looseObjectArraySchema }).strict()
const authoringCanvasBlockSchema = z.object({ canvas: looseObjectArraySchema }).strict()
const authoringCtaBlockSchema = z.object({ cta: looseObjectSchema }).strict()
const authoringTrendsBlockSchema = z.object({ trends: looseObjectArraySchema }).strict()
const authoringMoscowBlockSchema = z.object({ moscow: looseObjectArraySchema }).strict()
const authoringPartnersBlockSchema = z.object({ partners: looseObjectArraySchema }).strict()
const authoringLetterBlockSchema = z.object({ letter: looseObjectSchema }).strict()
const authoringFeatureGridBlockSchema = z.object({ featureGrid: looseObjectSchema }).strict()

const authoringContentBlockSchema = z.union([
  contentBlockSchema,
  z.object({ text: textValueSchema }).strict(),
  z.object({ highlight: textValueSchema }).strict(),
  z.object({ quote: textValueSchema }).strict(),
  authoringStatsBlockSchema,
  authoringCardsBlockSchema,
  authoringCardBlockSchema,
  authoringFeatureListBlockSchema,
  authoringPersonaGridSchema,
  authoringTableBlockSchema,
  authoringMarketBlockSchema,
  authoringSwotBlockSchema,
  authoringStackBlockSchema,
  authoringLoopBlockSchema,
  authoringTimelineBlockSchema,
  authoringSitemapBlockSchema,
  authoringPaletteBlockSchema,
  authoringInvestmentBlockSchema,
  authoringFlowBlockSchema,
  authoringArchitectureBlockSchema,
  authoringUnitsBlockSchema,
  authoringMilestonesBlockSchema,
  authoringAcceptanceBlockSchema,
  authoringUseCasesBlockSchema,
  authoringMatrixBlockSchema,
  authoringRevenueBlockSchema,
  authoringCanvasBlockSchema,
  authoringCtaBlockSchema,
  authoringTrendsBlockSchema,
  authoringMoscowBlockSchema,
  authoringPartnersBlockSchema,
  authoringLetterBlockSchema,
  authoringFeatureGridBlockSchema,
])

const authoringHomeCardSchema = z.object({
  slug: z.string().min(1),
  nav: z.string().min(1).optional(),
  number: z.string().min(1).optional(),
  title: z.string().min(1),
  summary: z.string().min(1),
  linkLabel: z.string().min(1).optional(),
}).strict()

export const authoringAppConfigSchema = z.object({
  brand: z.string().min(1),
  locale: z.string().min(1),
  home: z.object({
    badge: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().min(1),
    meta: z.array(metaItemSchema).min(1),
    cards: z.array(authoringHomeCardSchema).min(1),
  }).strict(),
  documentOrder: z.array(z.string().min(1)).min(1).optional(),
}).strict()

const authoringLeadSchema = z.object({
  claim: z.string().min(1),
  intro: z.string().min(1),
}).strict()

const authoringSectionSchema = z.object({
  id: z.string().min(1),
  number: z.string().min(1).optional(),
  nav: z.string().min(1).optional(),
  eyebrow: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  blocks: z.array(authoringContentBlockSchema).min(1),
}).strict()

export const authoringDocumentPageSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  badge: z.string().min(1),
  subtitle: z.string().min(1),
  meta: z.array(metaItemSchema).min(1),
  lead: authoringLeadSchema.optional(),
  sections: z.array(authoringSectionSchema).min(1),
}).strict()

type AuthoringCardContent = z.infer<typeof authoringCardContentSchema>
type AuthoringContentBlock = z.infer<typeof authoringContentBlockSchema>
type AuthoringSection = z.infer<typeof authoringSectionSchema>

export function normalizeAppConfig(input: unknown): AppConfig {
  const canonical = appConfigSchema.safeParse(input)
  if (canonical.success) return canonical.data

  const authoring = authoringAppConfigSchema.parse(input)
  const cards = authoring.home.cards.map((card, index) => normalizeHomeCard(card, index))
  const normalized = {
    brand: authoring.brand,
    locale: authoring.locale,
    home: {
      ...authoring.home,
      cards,
    },
    documentOrder: authoring.documentOrder ?? cards.map((card) => card.slug),
  }

  return appConfigSchema.parse(normalized)
}

export function normalizeDocumentPage(input: unknown, options: { slug: string; appConfig: AppConfig }): DocumentPage {
  const canonical = documentPageSchema.safeParse(input)
  if (canonical.success) return canonical.data

  const authoring = authoringDocumentPageSchema.parse(input)
  const homeCard = options.appConfig.home.cards.find((card) => card.slug === options.slug)

  if (!homeCard) {
    throw new Error(`Missing home card configuration for slug: ${options.slug}`)
  }

  const sectionsWithToc = authoring.sections.map((section, index) => normalizeSection(section, index))
  const navLabel = homeCard.navLabel ?? homeCard.title
  const normalized = {
    slug: options.slug,
    title: authoring.title ?? `${options.appConfig.brand} - ${navLabel}`,
    navLabel,
    homeCard,
    badge: authoring.badge,
    subtitle: authoring.subtitle,
    meta: authoring.meta,
    toc: sectionsWithToc.map((entry) => entry.tocItem),
    lead: authoring.lead,
    seoDescription: authoring.description ?? authoring.subtitle,
    sections: sectionsWithToc.map((entry) => entry.section),
  }

  return documentPageSchema.parse(normalized)
}

function normalizeHomeCard(card: z.infer<typeof authoringHomeCardSchema>, index: number) {
  const navLabel = card.nav ?? card.title

  return homeCardSchema.parse({
    slug: card.slug,
    navLabel,
    number: card.number ?? formatOrdinal(index + 1),
    title: card.title,
    summary: card.summary,
    linkLabel: card.linkLabel ?? `${navLabel} \u00f6ffnen`,
  })
}

function normalizeSection(section: AuthoringSection, index: number) {
  const number = section.number ?? formatOrdinal(index + 1)
  const tocLabel = normalizeShortLabel(section.nav ?? section.title ?? section.eyebrow ?? section.label ?? section.id)
  const labelBody = section.label
    ?? (section.eyebrow ? `${number} - ${section.eyebrow}` : `${number} - ${tocLabel}`)

  return {
    tocItem: tocItemSchema.parse({
      id: section.id,
      number,
      label: tocLabel,
    }),
    section: documentSectionSchema.parse({
      id: section.id,
      label: labelBody,
      title: section.title ?? tocLabel,
      blocks: section.blocks.map((block) => normalizeContentBlock(block)),
    }),
  }
}

function normalizeContentBlock(block: AuthoringContentBlock): ContentBlock {
  const canonical = contentBlockSchema.safeParse(block)
  if (canonical.success) return canonical.data

  if ('text' in block) {
    return contentBlockSchema.parse({ type: 'richText', paragraphs: toParagraphs(block.text) })
  }

  if ('highlight' in block) {
    return contentBlockSchema.parse({ type: 'highlight', paragraphs: toParagraphs(block.highlight) })
  }

  if ('quote' in block) {
    return contentBlockSchema.parse({ type: 'quote', paragraphs: toParagraphs(block.quote) })
  }

  if ('stats' in block) {
    return contentBlockSchema.parse({
      type: 'statsGrid',
      columns: block.columns ?? defaultGridColumns(block.stats.length),
      items: block.stats,
    })
  }

  if ('cards' in block) {
    return contentBlockSchema.parse({
      type: 'cardGrid',
      columns: block.columns ?? defaultGridColumns(block.cards.length),
      cards: block.cards.map((card) => normalizeCardContent(card)),
    })
  }

  if ('card' in block) {
    return contentBlockSchema.parse({
      type: 'contentCard',
      ...normalizeCardContent(block.card),
    })
  }

  if ('features' in block) {
    return contentBlockSchema.parse({
      type: 'featureList',
      title: block.title,
      titleTone: block.titleTone,
      items: block.features,
    })
  }

  if ('personas' in block) {
    return contentBlockSchema.parse({
      type: 'personaGrid',
      items: block.personas,
    })
  }

  if ('table' in block) {
    return contentBlockSchema.parse({ type: 'table', ...block.table })
  }

  if ('market' in block) {
    return contentBlockSchema.parse({ type: 'marketCards', ...block.market })
  }

  if ('swot' in block) {
    return contentBlockSchema.parse({ type: 'swot', ...block.swot })
  }

  if ('stack' in block) {
    return contentBlockSchema.parse({ type: 'stackedList', ...block.stack })
  }

  if ('loop' in block) {
    return contentBlockSchema.parse({ type: 'loopDiagram', ...block.loop })
  }

  if ('timeline' in block) {
    return contentBlockSchema.parse({ type: 'timeline', ...block.timeline })
  }

  if ('sitemap' in block) {
    return contentBlockSchema.parse({ type: 'sitemapTree', ...block.sitemap })
  }

  if ('palette' in block) {
    return contentBlockSchema.parse({
      type: 'colorPalette',
      groups: Array.isArray(block.palette) ? block.palette : [block.palette],
    })
  }

  if ('investment' in block) {
    return contentBlockSchema.parse({ type: 'investmentBreakdown', items: block.investment })
  }

  if ('flow' in block) {
    return contentBlockSchema.parse({ type: 'flowSteps', ...block.flow })
  }

  if ('architecture' in block) {
    return contentBlockSchema.parse({ type: 'archFlow', ...block.architecture })
  }

  if ('units' in block) {
    return contentBlockSchema.parse({ type: 'unitGrid', items: block.units })
  }

  if ('milestones' in block) {
    return contentBlockSchema.parse({ type: 'milestoneList', ...block.milestones })
  }

  if ('acceptance' in block) {
    return contentBlockSchema.parse({ type: 'acceptanceList', ...block.acceptance })
  }

  if ('useCases' in block) {
    return contentBlockSchema.parse({ type: 'useCaseCards', items: block.useCases })
  }

  if ('matrix' in block) {
    return contentBlockSchema.parse({ type: 'competitionMatrix', ...block.matrix })
  }

  if ('revenue' in block) {
    return contentBlockSchema.parse({ type: 'revenueList', items: block.revenue })
  }

  if ('canvas' in block) {
    return contentBlockSchema.parse({ type: 'canvasGrid', rows: block.canvas })
  }

  if ('cta' in block) {
    return contentBlockSchema.parse({ type: 'ctaPanel', ...block.cta })
  }

  if ('trends' in block) {
    return contentBlockSchema.parse({ type: 'trendList', items: block.trends })
  }

  if ('moscow' in block) {
    return contentBlockSchema.parse({ type: 'moscowGrid', items: block.moscow })
  }

  if ('partners' in block) {
    return contentBlockSchema.parse({ type: 'partnerGrid', items: block.partners })
  }

  if ('letter' in block) {
    return contentBlockSchema.parse({ type: 'letterBody', ...block.letter })
  }

  if ('featureGrid' in block) {
    return contentBlockSchema.parse({ type: 'featureBlocks', ...block.featureGrid })
  }

  return contentBlockSchema.parse(block)
}

function normalizeCardContent(card: AuthoringCardContent): CardContent {
  const canonical = cardContentSchema.safeParse(card)
  if (canonical.success) return canonical.data

  return cardContentSchema.parse({
    title: card.title,
    titleTone: card.titleTone,
    paragraphs: card.paragraphs ?? toOptionalParagraphs(card.text),
    items: card.items ?? card.list,
    tags: card.tags,
  })
}

function toParagraphs(value: z.infer<typeof textValueSchema>) {
  return Array.isArray(value) ? value : [value]
}

function toOptionalParagraphs(value?: z.infer<typeof textValueSchema>) {
  if (!value) return undefined
  return toParagraphs(value)
}

function formatOrdinal(value: number) {
  return String(value).padStart(2, '0')
}

function defaultGridColumns(count: number) {
  return count === 2 ? 2 : 3
}

function normalizeShortLabel(value: string) {
  return value.replace(/^\d+\s*(?:-|[\u2013\u2014])\s*/u, '').trim()
}
