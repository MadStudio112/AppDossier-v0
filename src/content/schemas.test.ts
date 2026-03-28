import { appConfig, documentPages } from '@/content/registry'
import { appConfigSchema, documentPageSchema } from '@/content/schemas'

describe('content schemas', () => {
  it('validates the generated app config and ordered pages', () => {
    expect(appConfigSchema.parse(appConfig).documentOrder).toHaveLength(documentPages.length)
    expect(documentPages.every((page) => page.slug.length > 0)).toBe(true)
  })

  it('rejects invalid document data', () => {
    const broken = {
      ...documentPages[0],
      sections: [
        {
          ...documentPages[0].sections[0],
          blocks: [
            {
              type: 'table',
              variant: 'broken',
              columns: ['A'],
              rows: [{ cells: [{ text: 'x' }] }],
            },
          ],
        },
      ],
    }

    expect(() => documentPageSchema.parse(broken)).toThrow()
  })
})
