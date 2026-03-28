import { normalizeAppConfig, normalizeDocumentPage } from '@/content/authoring'
import { appConfigSchema, documentPageSchema } from '@/content/schemas'

describe('authoring normalization', () => {
  it('derives home card fields from the simplified app config format', () => {
    const appConfig = normalizeAppConfig({
      brand: 'ACME',
      locale: 'de-AT',
      home: {
        badge: 'Dokumente',
        title: 'ACME',
        subtitle: 'Alle Dossiers',
        meta: [{ label: 'Status', value: 'Beta' }],
        cards: [
          { slug: 'prd', nav: 'PRD', title: 'Product Requirements Document', summary: 'Kurzfassung.' },
          { slug: 'pitch', title: 'Pitch Deck', summary: 'Deck.' },
        ],
      },
    })

    expect(appConfigSchema.parse(appConfig).documentOrder).toEqual(['prd', 'pitch'])
    expect(appConfig.home.cards[0]).toMatchObject({ navLabel: 'PRD', number: '01', linkLabel: 'PRD \u00f6ffnen' })
    expect(appConfig.home.cards[1]).toMatchObject({ navLabel: 'Pitch Deck', number: '02', linkLabel: 'Pitch Deck \u00f6ffnen' })
  })

  it('derives page metadata and shorthand blocks from the simplified page format', () => {
    const appConfig = normalizeAppConfig({
      brand: 'ACME',
      locale: 'de-AT',
      home: {
        badge: 'Dokumente',
        title: 'ACME',
        subtitle: 'Alle Dossiers',
        meta: [{ label: 'Status', value: 'Beta' }],
        cards: [{ slug: 'prd', nav: 'PRD', title: 'Product Requirements Document', summary: 'Kurzfassung.' }],
      },
    })

    const page = normalizeDocumentPage({
      badge: 'PRD · v1.0',
      subtitle: 'Nicht-technische Fassung',
      meta: [{ label: 'Status', value: 'In Arbeit' }],
      sections: [
        {
          id: 'vision',
          nav: 'Vision',
          eyebrow: 'Produktvision',
          title: 'Was ist ACME?',
          blocks: [
            { highlight: 'Kernaussage' },
            { stats: [{ value: '5', label: 'Kriterien' }, { value: '<2m', label: 'Zeit' }], columns: 2 },
            {
              columns: 2,
              cards: [
                { title: 'Ziel', list: ['A', 'B'] },
                { title: 'Messung', text: 'Kurztext' },
              ],
            },
            {
              table: {
                columns: ['A', 'B'],
                rows: [{ cells: [{ text: 'x' }, { text: 'y', tone: 'green' }] }],
                variant: 'default',
              },
            },
            {
              flow: {
                title: 'Ablauf',
                variant: 'default',
                steps: [{ id: '1', title: 'Start', body: 'Los gehts.' }],
              },
            },
            {
              matrix: {
                title: 'Wettbewerb',
                columns: ['Fit'],
                rows: [{ label: { text: 'ACME' }, cells: [{ text: 'Ja', tone: 'green' }] }],
              },
            },
          ],
        },
      ],
    }, { slug: 'prd', appConfig })

    expect(documentPageSchema.parse(page).slug).toBe('prd')
    expect(page.navLabel).toBe('PRD')
    expect(page.title).toBe('ACME - PRD')
    expect(page.seoDescription).toBe('Nicht-technische Fassung')
    expect(page.toc).toEqual([{ id: 'vision', number: '01', label: 'Vision' }])
    expect(page.sections[0].label).toBe('01 - Produktvision')
    expect(page.sections[0].blocks[0]).toMatchObject({ type: 'highlight', paragraphs: ['Kernaussage'] })
    expect(page.sections[0].blocks[1]).toMatchObject({ type: 'statsGrid', columns: 2 })
    expect(page.sections[0].blocks[2]).toMatchObject({ type: 'cardGrid', columns: 2 })
    expect(page.sections[0].blocks[3]).toMatchObject({ type: 'table', columns: ['A', 'B'] })
    expect(page.sections[0].blocks[4]).toMatchObject({ type: 'flowSteps', title: 'Ablauf' })
    expect(page.sections[0].blocks[5]).toMatchObject({ type: 'competitionMatrix', title: 'Wettbewerb' })
  })
})
