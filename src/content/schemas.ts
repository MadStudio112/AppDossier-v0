import { z } from 'zod'

export const toneSchema = z.enum(['green', 'blue', 'amber', 'red', 'muted'])

export const metaItemSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
}).strict()

export const homeCardSchema = z.object({
  slug: z.string().min(1),
  navLabel: z.string().min(1).optional(),
  number: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  linkLabel: z.string().min(1),
}).strict()

export const tocItemSchema = z.object({
  id: z.string().min(1),
  number: z.string().min(1),
  label: z.string().min(1),
}).strict()

export const tagSchema = z.object({
  label: z.string().min(1),
  tone: toneSchema.optional(),
}).strict()

export const tableCellSchema = z.object({
  text: z.string().min(1),
  tone: toneSchema.optional(),
  code: z.boolean().optional(),
}).strict()

export const cardContentSchema = z.object({
  title: z.string().min(1).optional(),
  titleTone: toneSchema.optional(),
  paragraphs: z.array(z.string().min(1)).optional(),
  items: z.array(z.string().min(1)).optional(),
  tags: z.array(tagSchema).optional(),
}).strict()

const statsGridSchema = z.object({
  type: z.literal('statsGrid'),
  columns: z.union([z.literal(2), z.literal(3)]),
  items: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) }).strict()).min(1),
}).strict()

const personaGridSchema = z.object({
  type: z.literal('personaGrid'),
  items: z.array(z.object({ avatar: z.string().min(1), name: z.string().min(1), role: z.string().min(1), needs: z.string().min(1) }).strict()).min(1),
}).strict()

const marketCardsSchema = z.object({
  type: z.literal('marketCards'),
  variant: z.enum(['tam', 'segment', 'problem', 'solution', 'stat']),
  columns: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  items: z.array(z.object({
    value: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    description: z.string().min(1),
    tone: toneSchema.optional(),
    tags: z.array(tagSchema).optional(),
  }).strict()).min(1),
}).strict()

const highlightSchema = z.object({ type: z.literal('highlight'), paragraphs: z.array(z.string().min(1)).min(1) }).strict()
const quoteSchema = z.object({ type: z.literal('quote'), paragraphs: z.array(z.string().min(1)).min(1) }).strict()
const richTextSchema = z.object({ type: z.literal('richText'), paragraphs: z.array(z.string().min(1)).min(1) }).strict()
const cardGridSchema = z.object({ type: z.literal('cardGrid'), columns: z.union([z.literal(2), z.literal(3)]), cards: z.array(cardContentSchema).min(1) }).strict()
const contentCardSchema = z.object({ type: z.literal('contentCard') }).merge(cardContentSchema).strict()
const featureListSchema = z.object({ type: z.literal('featureList'), title: z.string().min(1).optional(), titleTone: toneSchema.optional(), items: z.array(z.string().min(1)).min(1) }).strict()
const moscowGridSchema = z.object({ type: z.literal('moscowGrid'), items: z.array(z.object({ quadrant: z.enum(['must', 'should', 'could', 'wont']), title: z.string().min(1), items: z.array(z.string().min(1)).min(1) }).strict()).length(4) }).strict()
const swotSchema = z.object({ type: z.literal('swot'), variant: z.enum(['full', 'mini']), title: z.string().min(1).optional(), items: z.array(z.object({ quadrant: z.enum(['s', 'w', 'o', 't']), title: z.string().min(1), items: z.array(z.string().min(1)).min(1) }).strict()).min(1) }).strict()
const investmentBreakdownSchema = z.object({ type: z.literal('investmentBreakdown'), items: z.array(z.object({ label: z.string().min(1), value: z.string().min(1), description: z.string().min(1), filledSegments: z.number().int().nonnegative(), totalSegments: z.number().int().positive() }).strict()).min(1) }).strict()
const unitGridSchema = z.object({ type: z.literal('unitGrid'), items: z.array(z.object({ label: z.string().min(1), value: z.string().min(1), description: z.string().min(1) }).strict()).min(1) }).strict()
const partnerGridSchema = z.object({ type: z.literal('partnerGrid'), items: z.array(z.object({ icon: z.string().min(1), title: z.string().min(1), description: z.string().min(1) }).strict()).min(1) }).strict()
const canvasGridSchema = z.object({ type: z.literal('canvasGrid'), rows: z.array(z.object({ columns: z.number().int().positive(), blocks: z.array(z.object({ label: z.string().min(1), title: z.string().min(1), items: z.array(z.string().min(1)).min(1), accent: z.boolean().optional(), titleTone: toneSchema.optional() }).strict()).min(1) }).strict()).min(1) }).strict()
const revenueListSchema = z.object({ type: z.literal('revenueList'), items: z.array(z.object({ title: z.string().min(1), phase: tagSchema.optional(), description: z.string().min(1), mechanics: z.array(z.string().min(1)).min(1) }).strict()).min(1) }).strict()
const useCaseCardsSchema = z.object({ type: z.literal('useCaseCards'), items: z.array(z.object({ id: z.string().min(1), tag: tagSchema.optional(), title: z.string().min(1), description: z.string().min(1), precondition: z.string().min(1), result: z.string().min(1) }).strict()).min(1) }).strict()
const ctaPanelSchema = z.object({ type: z.literal('ctaPanel'), title: z.string().min(1), subtitle: z.string().min(1), slogan: z.string().min(1).optional() }).strict()
const tableSchema = z.object({ type: z.literal('table'), title: z.string().min(1).optional(), intro: z.array(z.string().min(1)).optional(), note: z.string().min(1).optional(), variant: z.enum(['default', 'freemium']), columns: z.array(z.string().min(1)).min(1), rows: z.array(z.object({ highlight: z.boolean().optional(), cells: z.array(tableCellSchema).min(1) }).strict()).min(1) }).strict()
const competitionMatrixSchema = z.object({ type: z.literal('competitionMatrix'), title: z.string().min(1), columns: z.array(z.string().min(1)).min(1), rows: z.array(z.object({ label: tableCellSchema, highlight: z.boolean().optional(), cells: z.array(tableCellSchema).min(1) }).strict()).min(1), note: z.string().min(1).optional() }).strict()
const timelineSchema = z.object({ type: z.literal('timeline'), title: z.string().min(1).optional(), variant: z.literal('default'), items: z.array(z.object({ title: z.string().min(1), body: z.string().min(1) }).strict()).min(1) }).strict()
const flowStepsSchema = z.object({ type: z.literal('flowSteps'), title: z.string().min(1), variant: z.enum(['default', 'returning']), steps: z.array(z.object({ id: z.string().min(1), title: z.string().min(1), body: z.string().min(1), detailTitle: z.string().min(1).optional(), detailItems: z.array(z.string().min(1)).optional() }).strict()).min(1) }).strict()
const milestoneListSchema = z.object({ type: z.literal('milestoneList'), title: z.string().min(1).optional(), items: z.array(z.object({ icon: z.string().min(1), title: z.string().min(1), body: z.string().min(1) }).strict()).min(1) }).strict()
const archFlowSchema = z.object({ type: z.literal('archFlow'), title: z.string().min(1).optional(), lead: z.string().min(1).optional(), nodes: z.array(z.object({ title: z.string().min(1), subtitle: z.string().min(1) }).strict()).min(1) }).strict()
const loopDiagramSchema = z.object({ type: z.literal('loopDiagram'), title: z.string().min(1), titleTone: toneSchema.optional(), nodes: z.array(z.object({ title: z.string().min(1), subtitle: z.string().min(1) }).strict()).min(1), note: z.string().min(1).optional() }).strict()
type SitemapNodeSchemaType = {
  name: string
  route?: string
  tone?: z.infer<typeof toneSchema>
  children?: SitemapNodeSchemaType[]
}

const sitemapNodeSchema: z.ZodType<SitemapNodeSchemaType> = z.object({
  name: z.string().min(1),
  route: z.string().min(1).optional(),
  tone: toneSchema.optional(),
  children: z.array(z.lazy(() => sitemapNodeSchema)).optional(),
}).strict()

const sitemapTreeSchema = z.object({ type: z.literal('sitemapTree'), title: z.string().min(1).optional(), nodes: z.array(sitemapNodeSchema).min(1) }).strict()
const stackedListSchema = z.object({ type: z.literal('stackedList'), variant: z.enum(['competition', 'usp', 'roadmap']), items: z.array(z.object({ label: z.string().min(1).optional(), title: z.string().min(1), description: z.string().min(1), tag: tagSchema.optional() }).strict()).min(1) }).strict()
const acceptanceListSchema = z.object({ type: z.literal('acceptanceList'), title: z.string().min(1).optional(), items: z.array(z.object({ number: z.string().min(1), title: z.string().min(1), body: z.string().min(1) }).strict()).min(1) }).strict()
const colorPaletteSchema = z.object({ type: z.literal('colorPalette'), groups: z.array(z.object({ title: z.string().min(1), colors: z.array(z.object({ name: z.string().min(1), hex: z.string().min(1) }).strict()).min(1) }).strict()).min(1) }).strict()
const trendListSchema = z.object({ type: z.literal('trendList'), items: z.array(z.object({ icon: z.string().min(1), title: z.string().min(1), body: z.string().min(1) }).strict()).min(1) }).strict()
const letterBodySchema = z.object({ type: z.literal('letterBody'), date: z.string().min(1), salutation: z.string().min(1), paragraphs: z.array(z.string().min(1)).min(1), kpis: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) }).strict()).min(1), signName: z.string().min(1), signTitle: z.string().min(1) }).strict()
const featureBlocksSchema = z.object({ type: z.literal('featureBlocks'), columns: z.union([z.literal(2), z.literal(3)]), items: z.array(z.object({ title: z.string().min(1), tag: tagSchema.optional(), items: z.array(z.string().min(1)).min(1) }).strict()).min(1) }).strict()

export const contentBlockSchema = z.discriminatedUnion('type', [
  acceptanceListSchema, archFlowSchema, canvasGridSchema, cardGridSchema, colorPaletteSchema, competitionMatrixSchema,
  contentCardSchema, ctaPanelSchema, featureBlocksSchema, featureListSchema, flowStepsSchema, highlightSchema,
  investmentBreakdownSchema, letterBodySchema, loopDiagramSchema, marketCardsSchema, milestoneListSchema,
  moscowGridSchema, partnerGridSchema, personaGridSchema, quoteSchema, revenueListSchema, richTextSchema,
  sitemapTreeSchema, stackedListSchema, statsGridSchema, swotSchema, tableSchema, timelineSchema, trendListSchema,
  unitGridSchema, useCaseCardsSchema,
])

export const documentSectionSchema = z.object({ id: z.string().min(1), label: z.string().min(1), title: z.string().min(1), blocks: z.array(contentBlockSchema).min(1) }).strict()
export const appConfigSchema = z.object({ brand: z.string().min(1), locale: z.string().min(1), home: z.object({ badge: z.string().min(1), title: z.string().min(1), subtitle: z.string().min(1), meta: z.array(metaItemSchema).min(1), cards: z.array(homeCardSchema).min(1) }).strict(), documentOrder: z.array(z.string().min(1)).min(1) }).strict()
export const documentPageSchema = z.object({ slug: z.string().min(1), title: z.string().min(1), navLabel: z.string().min(1), homeCard: homeCardSchema, badge: z.string().min(1), subtitle: z.string().min(1), meta: z.array(metaItemSchema).min(1), toc: z.array(tocItemSchema).min(1), lead: z.object({ claim: z.string().min(1), intro: z.string().min(1) }).strict().optional(), seoDescription: z.string().min(1), sections: z.array(documentSectionSchema).min(1) }).strict()

export type Tone = z.infer<typeof toneSchema>
export type Tag = z.infer<typeof tagSchema>
export type HomeCard = z.infer<typeof homeCardSchema>
export type AppConfig = z.infer<typeof appConfigSchema>
export type TableCell = z.infer<typeof tableCellSchema>
export type CardContent = z.infer<typeof cardContentSchema>
export type ContentBlock = z.infer<typeof contentBlockSchema>
export type DocumentSection = z.infer<typeof documentSectionSchema>
export type DocumentPage = z.infer<typeof documentPageSchema>
