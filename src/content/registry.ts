import appConfigData from '@/content/manual/app-config.json'
import changelogData from '@/content/manual/pages/changelog.json'
import communityData from '@/content/manual/pages/community.json'
import designsystemData from '@/content/manual/pages/designsystem.json'
import finanzplanData from '@/content/manual/pages/finanzplan.json'
import geschaeftsmodellData from '@/content/manual/pages/geschaeftsmodell.json'
import investorenbriefData from '@/content/manual/pages/investorenbrief.json'
import campaignPlanData from '@/content/manual/pages/campaign-plan.json'
import marketingData from '@/content/manual/pages/marketing.json'
import marktanalyseData from '@/content/manual/pages/marktanalyse.json'
import pitchData from '@/content/manual/pages/pitch.json'
import prdData from '@/content/manual/pages/prd.json'
import roadmapData from '@/content/manual/pages/roadmap.json'
import techstackData from '@/content/manual/pages/techstack.json'
import usecasesData from '@/content/manual/pages/usecases.json'
import { normalizeAppConfig, normalizeDocumentPage } from '@/content/authoring'
import type { AppConfig, DocumentPage } from '@/content/schemas'

export let registryError: string | null = null

const rawPages = [
  { slug: 'prd', data: prdData },
  { slug: 'pitch', data: pitchData },
  { slug: 'investorenbrief', data: investorenbriefData },
  { slug: 'geschaeftsmodell', data: geschaeftsmodellData },
  { slug: 'marktanalyse', data: marktanalyseData },
  { slug: 'usecases', data: usecasesData },
  { slug: 'techstack', data: techstackData },
  { slug: 'roadmap', data: roadmapData },
  { slug: 'designsystem', data: designsystemData },
  { slug: 'finanzplan', data: finanzplanData },
  { slug: 'marketing', data: marketingData },
  { slug: 'campaign-plan', data: campaignPlanData },
  { slug: 'changelog', data: changelogData },
  { slug: 'community', data: communityData },
] as const

let _appConfig: AppConfig | undefined
let _documentPages: DocumentPage[] = []
let _documentPagesBySlug: ReadonlyMap<string, DocumentPage> = new Map()

try {
  _appConfig = normalizeAppConfig(appConfigData)

  const parsedPages = rawPages.map((page) => normalizeDocumentPage(page.data, { slug: page.slug, appConfig: _appConfig! }))
  const pageMap = new Map(parsedPages.map((page) => [page.slug, page]))

  for (const slug of _appConfig.documentOrder) {
    if (!pageMap.has(slug)) {
      throw new Error(`Missing document for configured slug: ${slug}`)
    }
  }

  _documentPages = _appConfig.documentOrder.map((slug) => pageMap.get(slug) as DocumentPage)
  _documentPagesBySlug = new Map(_documentPages.map((page) => [page.slug, page]))
} catch (err) {
  registryError = err instanceof Error ? err.message : String(err)
}

// Safe to access only when registryError is null
export const appConfig = _appConfig as AppConfig
export const documentPages: DocumentPage[] = _documentPages
export const documentPagesBySlug: ReadonlyMap<string, DocumentPage> = _documentPagesBySlug

export function getDocumentBySlug(slug: string): DocumentPage | undefined {
  return _documentPagesBySlug.get(slug)
}
