import fs from 'node:fs'
import path from 'node:path'
import { load } from 'cheerio'

const rootDir = process.cwd()
const legacyDir = path.join(rootDir, 'legacy-static')
const outputDir = path.join(rootDir, 'src', 'content', 'manual')
const pagesDir = path.join(outputDir, 'pages')
const stylesDir = path.join(rootDir, 'src', 'styles')

fs.mkdirSync(pagesDir, { recursive: true })
fs.mkdirSync(stylesDir, { recursive: true })

const htmlFiles = fs
  .readdirSync(legacyDir)
  .filter((file) => file.endsWith('.html'))
  .sort((a, b) => a.localeCompare(b, 'de'))

const homeDocument = loadHtml('index.html')
const footerLabels = parseFooterLabels(homeDocument)
const homeCards = parseHomeCards(homeDocument, footerLabels)
const appConfig = parseAppConfig(homeDocument, homeCards)

writeJson(path.join(outputDir, 'app-config.json'), appConfig)

for (const file of htmlFiles) {
  if (file === 'index.html') continue

  const slug = file.replace(/\.html$/u, '')
  const pageDocument = loadHtml(file)
  const page = pruneEmpty({
    title: cleanText(pageDocument('title').text()),
    badge: getText(pageDocument, '.doc-badge'),
    subtitle: getText(pageDocument, '.doc-subtitle'),
    meta: parseMeta(pageDocument),
    lead: parsePageLead(slug, pageDocument),
    sections: pageDocument('main > section.section').toArray().map((section) => parseSection(pageDocument, section)),
  })

  writeJson(path.join(pagesDir, `${slug}.json`), page)
}

writeStyles()

function loadHtml(fileName) {
  const source = fs.readFileSync(path.join(legacyDir, fileName), 'utf8')
  return load(source)
}

function writeJson(targetPath, data) {
  fs.writeFileSync(targetPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function getText($, selector, scope) {
  const target = scope ? $(scope).find(selector).first() : $(selector).first()
  return textContent(target)
}

function textContent(node) {
  return normalizeInline(node.contents().toArray().map((child) => inlineNodeToText(child)).join(''))
}

function inlineNodeToText(node) {
  if (!node) return ''
  if (node.type === 'text') return node.data ?? ''
  if (node.type !== 'tag') return ''
  if (node.name === 'br') return '\n'

  const text = normalizeInline((node.children ?? []).map((child) => inlineNodeToText(child)).join(''))
  if (node.name === 'strong' || node.name === 'b') return `**${text}**`
  if (node.name === 'em' || node.name === 'i') return `*${text}*`
  if (node.name === 'code') return `\`${text}\``
  return text
}

function normalizeInline(value) {
  return value
    .replace(/\u00a0/gu, ' ')
    .replace(/[ \t]+\n/gu, '\n')
    .replace(/\n[ \t]+/gu, '\n')
    .replace(/[ \t]{2,}/gu, ' ')
    .replace(/\n{3,}/gu, '\n\n')
    .trim()
}

function cleanText(value) {
  return normalizeInline(String(value))
}

function parseHomeCards($, footerLabels) {
  const cards = $('.doc-card').toArray().map((card) => {
    const $card = $(card)
    const href = $card.attr('href') ?? ''
    const slug = href.replace(/\.html$/u, '')
    return pruneEmpty({
      slug,
      nav: footerLabels[slug] ?? cleanText($card.find('.doc-card-link').text().replace(/\s+öffnen$/iu, '')),
      title: cleanText($card.find('.doc-card-title').text()),
      summary: cleanText($card.find('.doc-card-sub').text()),
    })
  })

  return { list: cards, bySlug: new Map(cards.map((card) => [card.slug, card])) }
}

function parseFooterLabels($) {
  return Object.fromEntries(
    $('.footer-nav-link').toArray().map((link) => {
      const $link = $(link)
      const slug = ($link.attr('href') ?? '').replace(/\.html$/u, '')
      return [slug, cleanText($link.text())]
    }),
  )
}

function parseAppConfig($, cards) {
  return pruneEmpty({
    brand: cleanText($('.doc-title').first().text()),
    locale: 'de-AT',
    home: {
      badge: getText($, '.doc-badge'),
      title: getText($, '.doc-title'),
      subtitle: getText($, '.doc-subtitle'),
      meta: parseMeta($),
      cards: cards.list,
      note: textContent($('.highlight').first()),
    },
  })
}

function parseMeta($) {
  return $('.doc-meta .meta-item').toArray().map((item) => {
    const $item = $(item)
    return pruneEmpty({
      label: cleanText($item.find('.meta-label').text()),
      value: cleanText($item.find('.meta-value').text()),
    })
  })
}

function parsePageLead(slug, $) {
  if (slug !== 'pitch') return undefined
  const hero = $('.pitch-hero').first()
  if (!hero.length) return undefined
  return pruneEmpty({
    claim: cleanText(hero.find('.big-claim').text()),
    intro: cleanText(hero.find('.pitch-intro').text()),
  })
}
function parseSection($, section) {
  const $section = $(section)
  const sectionId = $section.attr('id') ?? ''
  const tocLink = $(`.doc-nav .nav-link[href="#${sectionId}"]`).first()
  const number = tocLink.length ? cleanText(tocLink.find('.nav-num').text()) : undefined
  const nav = tocLink.length ? cleanText(tocLink.clone().children().remove().end().text()) : undefined
  const eyebrow = normalizeSectionEyebrow(cleanText($section.find('> .section-label').text()))
  const childNodes = $section.children().toArray().filter((node) => {
    const classes = getClasses(node)
    return !classes.has('section-label') && !classes.has('section-title') && !classes.has('divider')
  })

  return pruneEmpty({
    id: sectionId,
    number,
    nav,
    eyebrow,
    title: cleanText($section.find('> .section-title').text()) || nav,
    blocks: parseBlocks($, childNodes),
  })
}

function parseBlocks($, nodes) {
  const blocks = []

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index]
    const $node = $(node)
    const classes = getClasses(node)
    const tagName = node.tagName

    if (tagName === 'p') {
      const paragraphs = []
      let cursor = index
      while (cursor < nodes.length && nodes[cursor].tagName === 'p') {
        paragraphs.push(textContent($(nodes[cursor])))
        cursor += 1
      }
      blocks.push({ text: collapseTextValue(paragraphs) })
      index = cursor - 1
      continue
    }

    if (tagName === 'table') { blocks.push(parseStandaloneTable($, $node)); continue }
    if (classes.has('highlight')) { blocks.push(parseHighlight($, $node)); continue }
    if (classes.has('blockquote')) { blocks.push(parseQuote($, $node)); continue }
    if (classes.has('letter-body')) { blocks.push(parseLetterBody($, $node)); continue }
    if (classes.has('grid-2') || classes.has('grid-3')) { blocks.push(parseGrid($, $node)); continue }
    if (classes.has('moscow')) { blocks.push(parseMoscow($, $node)); continue }
    if (classes.has('swot')) { blocks.push(parseSwot($, $node, 'full')); continue }
    if (classes.has('invest-breakdown')) { blocks.push(parseInvestmentBreakdown($, $node)); continue }
    if (classes.has('unit-grid')) { blocks.push(parseUnitGrid($, $node)); continue }
    if (classes.has('partner-box')) { blocks.push(parsePartnerGrid($, $node)); continue }
    if (classes.has('tam-detail')) { blocks.push(parseMarketCards($, $node, 'tam')); continue }
    if (classes.has('inl-027')) { blocks.push(parseMarketCards($, $node, 'solution')); continue }
    if (classes.has('inl-008') && $node.find('table').length) { blocks.push(parseStandaloneTable($, $node)); continue }
    if (classes.has('cta-box')) { blocks.push(parseCtaPanel($, $node)); continue }
    if (classes.has('card')) { blocks.push(parseCardBlock($, $node)); continue }

    if (hasCanvasBlocks($node)) {
      const rows = []
      let cursor = index
      while (cursor < nodes.length && hasCanvasBlocks($(nodes[cursor]))) {
        rows.push(parseCanvasRow($, $(nodes[cursor])))
        cursor += 1
      }
      blocks.push({ type: 'canvasGrid', rows })
      index = cursor - 1
      continue
    }

    if (classes.has('revenue-stream')) {
      const items = []
      let cursor = index
      while (cursor < nodes.length && getClasses(nodes[cursor]).has('revenue-stream')) {
        items.push(parseRevenueStream($, $(nodes[cursor])))
        cursor += 1
      }
      blocks.push({ type: 'revenueList', items })
      index = cursor - 1
      continue
    }

    if (classes.has('uc-card')) {
      const items = []
      let cursor = index
      while (cursor < nodes.length && getClasses(nodes[cursor]).has('uc-card')) {
        items.push(parseUseCaseCard($, $(nodes[cursor])))
        cursor += 1
      }
      blocks.push({ type: 'useCaseCards', items })
      index = cursor - 1
      continue
    }

    throw new Error(`Unsupported block <${tagName}> with classes "${Array.from(classes).join(' ')}"`)
  }

  return blocks.map((block) => simplifyBlock(pruneEmpty(block)))
}

function parseHighlight($, $node) {
  return { highlight: collapseTextValue($node.find('p').toArray().map((paragraph) => textContent($(paragraph)))) }
}

function parseQuote($, $node) {
  return { quote: collapseTextValue($node.find('p').toArray().map((paragraph) => textContent($(paragraph)))) }
}

function parseLetterBody($, $node) {
  return {
    type: 'letterBody',
    date: cleanText($node.find('.letter-date').text()),
    salutation: cleanText($node.find('.letter-salutation').text()),
    paragraphs: $node.find('.letter-para').toArray().map((paragraph) => textContent($(paragraph))),
    kpis: $node.find('.kpi').toArray().map((item) => {
      const $item = $(item)
      return { value: cleanText($item.find('.kpi-val').text()), label: cleanText($item.find('.kpi-lbl').text()) }
    }),
    signName: cleanText($node.find('.sign-name').text()),
    signTitle: cleanText($node.find('.sign-title').text()),
  }
}

function parseGrid($, $node) {
  const columns = getClasses($node[0]).has('grid-3') ? 3 : 2
  const children = $node.children().toArray()

  if (children.every((child) => getClasses(child).has('stat-card'))) {
    return {
      stats: children.map((child) => {
        const $child = $(child)
        return { value: cleanText($child.find('.stat-value').text()), label: cleanText($child.find('.stat-label').text()) }
      }),
      columns,
    }
  }

  if (children.every((child) => getClasses(child).has('persona-card'))) {
    return {
      personas: children.map((child) => {
        const $child = $(child)
        return {
          avatar: cleanText($child.find('.persona-avatar').text()),
          name: cleanText($child.find('.persona-name').text()),
          role: cleanText($child.find('.persona-role').text()),
          needs: cleanText($child.find('.persona-needs').text()),
        }
      }),
    }
  }

  if (children.every((child) => getClasses(child).has('feature-block'))) {
    return {
      type: 'featureBlocks',
      columns,
      items: children.map((child) => {
        const $child = $(child)
        return {
          title: cleanText($child.find('.feature-block-title').text()),
          tag: parseTag($child.find('.feature-block-sub .tag').first()),
          items: parseListItems($, $child.find('ul').first()),
        }
      }),
    }
  }

  if (children.every((child) => getClasses(child).has('problem-item'))) return parseMarketCards($, $node, 'problem')
  if (children.every((child) => getClasses(child).has('segment-card'))) return parseMarketCards($, $node, 'segment')
  if (children.every((child) => getClasses(child).has('market-stat'))) return parseMarketCards($, $node, 'stat')

  if (children.every((child) => getClasses(child).has('card'))) {
    return { columns, cards: children.map((child) => parseCardContent($, $(child))) }
  }

  throw new Error(`Unsupported grid block with child classes: ${children.map((child) => Array.from(getClasses(child)).join('.')).join(', ')}`)
}

function parseMarketCards($, $node, variant) {
  const columns = getClasses($node[0]).has('grid-3') ? 3 : getClasses($node[0]).has('grid-2') ? 2 : 3

  if (variant === 'tam') {
    return {
      type: 'marketCards',
      variant,
      columns: 3,
      items: $node.find('.tam-detail-card').toArray().map((card) => {
        const $card = $(card)
        return {
          value: cleanText($card.find('.tam-val').text()),
          title: cleanText($card.find('.tam-name').text()),
          description: cleanText($card.find('.tam-desc').text()),
          tone: detectTone($card.find('.tam-val').attr('class') ?? ''),
        }
      }),
    }
  }

  if (variant === 'segment') {
    return {
      type: 'marketCards',
      variant,
      columns,
      items: $node.children('.segment-card').toArray().map((card) => {
        const $card = $(card)
        return {
          value: cleanText($card.find('.segment-size').text()),
          title: cleanText($card.find('.segment-name').text()),
          description: cleanText($card.find('.segment-desc').text()),
          tags: $card.find('.segment-tags .tag').toArray().map((tag) => parseTag($(tag))),
        }
      }),
    }
  }

  if (variant === 'problem') {
    return {
      type: 'marketCards',
      variant,
      columns,
      items: $node.children('.problem-item').toArray().map((card) => {
        const $card = $(card)
        return { title: cleanText($card.find('.problem-label').text()), description: cleanText($card.find('.problem-desc').text()) }
      }),
    }
  }

  if (variant === 'solution') {
    return {
      type: 'marketCards',
      variant,
      columns: 1,
      items: $node.children('.solution-item').toArray().map((card) => {
        const $card = $(card)
        return { title: cleanText($card.find('.solution-label').text()), description: cleanText($card.find('.solution-desc').text()) }
      }),
    }
  }

  return {
    type: 'marketCards',
    variant,
    columns,
    items: $node.children('.market-stat').toArray().map((card) => {
      const $card = $(card)
      return { value: cleanText($card.find('.market-big').text()), description: cleanText($card.find('.market-label').text()) }
    }),
  }
}
function parseMoscow($, $node) {
  return {
    type: 'moscowGrid',
    items: $node.children('.moscow-q').toArray().map((quadrant) => {
      const $quadrant = $(quadrant)
      const classes = getClasses(quadrant)
      const tone = classes.has('must') ? 'must' : classes.has('should') ? 'should' : classes.has('could') ? 'could' : 'wont'
      return { quadrant: tone, title: cleanText($quadrant.find('h4').text()), items: parseListItems($, $quadrant.find('ul').first()) }
    }),
  }
}

function parseSwot($, $node, variant) {
  const quadrants = variant === 'mini' ? $node.find('.swot-mini-q').toArray() : $node.children('.swot-q').toArray()
  return {
    type: 'swot',
    variant,
    title: $node.hasClass('card') ? cleanText($node.find('> .card-title').text()) : undefined,
    items: quadrants.map((quadrant) => {
      const $quadrant = $(quadrant)
      const classes = getClasses(quadrant)
      const quadrantTone = classes.has('swot-s') ? 's' : classes.has('swot-w') ? 'w' : classes.has('swot-o') ? 'o' : 't'
      return { quadrant: quadrantTone, title: cleanText($quadrant.find('h4, h5').first().text()), items: parseListItems($, $quadrant.find('ul').first()) }
    }),
  }
}

function parseInvestmentBreakdown($, $node) {
  return {
    type: 'investmentBreakdown',
    items: $node.children('.invest-item').toArray().map((item) => {
      const $item = $(item)
      const segments = $item.find('.horizon-segment').toArray()
      return {
        label: cleanText($item.find('.invest-item-label').text()),
        value: cleanText($item.find('.invest-item-value').text()),
        description: cleanText($item.find('.invest-item-desc').text()),
        filledSegments: segments.filter((segment) => !getClasses(segment).has('dim')).length,
        totalSegments: segments.length,
      }
    }),
  }
}

function parseUnitGrid($, $node) {
  return {
    type: 'unitGrid',
    items: $node.children('.unit-cell').toArray().map((item) => {
      const $item = $(item)
      return { label: cleanText($item.find('.unit-label').text()), value: cleanText($item.find('.unit-value').text()), description: cleanText($item.find('.unit-desc').text()) }
    }),
  }
}

function parsePartnerGrid($, $node) {
  return {
    type: 'partnerGrid',
    items: $node.children('.partner-item').toArray().map((item) => {
      const $item = $(item)
      return { icon: cleanText($item.find('.partner-icon').text()), title: cleanText($item.find('.partner-name').text()), description: cleanText($item.find('.partner-desc').text()) }
    }),
  }
}

function hasCanvasBlocks($node) {
  return $node.find('> .canvas-block').length > 0
}

function parseCanvasRow($, $node) {
  const blocks = $node.children('.canvas-block').toArray().map((block) => {
    const $block = $(block)
    return {
      label: cleanText($block.find('.canvas-label').text()),
      title: cleanText($block.find('.canvas-title').text()),
      items: parseListItems($, $block.find('.canvas-list').first()),
      accent: getClasses(block).has('inl-004'),
      titleTone: detectTone($block.find('.canvas-title').attr('class') ?? ''),
    }
  })
  return { columns: blocks.length, blocks }
}

function parseRevenueStream($, $node) {
  return {
    title: cleanText($node.find('.rs-title').text()),
    phase: parseTag($node.find('.tag').first()),
    description: cleanText($node.find('.rs-desc').text()),
    mechanics: parseListItems($, $node.find('.rs-mechanics ul').first()),
  }
}

function parseUseCaseCard($, $node) {
  return {
    id: cleanText($node.find('.uc-id').text()),
    tag: parseTag($node.find('.tag').first()),
    title: cleanText($node.find('.uc-title').text()),
    description: cleanText($node.find('.uc-desc').text()),
    precondition: cleanText($node.find('.uc-meta-block').first().find('.uc-meta-value').text()),
    result: cleanText($node.find('.uc-meta-block').last().find('.uc-meta-value').text()),
  }
}

function parseCtaPanel($, $node) {
  return { type: 'ctaPanel', title: cleanText($node.find('.cta-title').text()), subtitle: cleanText($node.find('.cta-sub').text()), slogan: cleanText($node.find('.cta-slogan').text()) }
}

function parseCardBlock($, $node) {
  if ($node.find('.comp-matrix').length) return parseCompetitionMatrix($, $node)
  if ($node.find('.doc-table').length) return parseTableBlock($, $node)
  if ($node.find('.swot-mini').length) return parseSwot($, $node.find('.swot-mini').first(), 'mini')
  if ($node.find('.timeline').length) return parseTimelineBlock($, $node)
  if ($node.find('.flow-step').length) return parseFlowSteps($, $node)
  if ($node.find('.trend-item').length) return parseTrendList($, $node)
  if ($node.find('.milestone-item').length) return parseMilestoneList($, $node)
  if ($node.find('.arch-flow').length) return parseArchFlow($, $node)
  if ($node.find('.sitemap-item').length) return parseSitemapTree($, $node)
  if ($node.find('.loop-visual').length) return parseLoopDiagram($, $node)
  if ($node.find('.roadmap-step').length) return parseStackedList($, $node, 'roadmap')
  if ($node.find('.comp-row').length) return parseStackedList($, $node, 'competition')
  if ($node.find('.usp-big').length) return parseStackedList($, $node, 'usp')
  if ($node.find('.ac-row').length) return parseAcceptanceList($, $node)
  if ($node.find('.color-grid').length) return parseColorPaletteCard($, $node)
  if ($node.find('> .feature-list').length && !$node.find('p').length && !$node.find('.pill-row').length) return parseFeatureListBlock($, $node)
  return { card: parseCardContent($, $node) }
}

function parseCardContent($, $node) {
  const directNestedLists = $node.find('> .grid-2 > .feature-list').toArray()
  return pruneEmpty({
    title: cleanText($node.find('> .card-title').first().text()),
    titleTone: detectTone($node.find('> .card-title').first().attr('class') ?? ''),
    text: collapseTextValue($node.children('p').toArray().map((paragraph) => textContent($(paragraph)))),
    list: $node.find('> .feature-list').length
      ? parseListItems($, $node.find('> .feature-list').first())
      : directNestedLists.length
        ? directNestedLists.flatMap((list) => parseListItems($, $(list)))
        : undefined,
    tags: $node.find('> .pill-row .tag').toArray().map((tag) => parseTag($(tag))),
  })
}

function parseFeatureListBlock($, $node) {
  return {
    features: parseListItems($, $node.find('> .feature-list').first()),
    title: cleanText($node.find('> .card-title').first().text()),
    titleTone: detectTone($node.find('> .card-title').first().attr('class') ?? ''),
  }
}

function parseStandaloneTable($, $node) {
  const table = $node.is('table') ? $node : $node.find('table').first()
  return {
    type: 'table',
    variant: table.hasClass('freemium-table') ? 'freemium' : 'default',
    columns: table.find('thead th').toArray().map((cell) => cleanText($(cell).text())),
    rows: table.find('tbody tr').toArray().map((row) => ({
      cells: $(row).children('td').toArray().map((cell) => parseTableCell($, $(cell))),
    })),
  }
}
function parseTableBlock($, $node) {
  const table = $node.find('table').first()
  return {
    type: 'table',
    title: cleanText($node.find('> .card-title').first().text()),
    intro: $node.children('p').toArray().map((paragraph) => textContent($(paragraph))),
    note: $node.children('p').last().is('.inl-023') ? textContent($node.children('p').last()) : undefined,
    variant: table.hasClass('freemium-table') ? 'freemium' : 'default',
    columns: table.find('thead th').toArray().map((cell) => cleanText($(cell).text())),
    rows: table.find('tbody tr').toArray().map((row) => ({
      highlight: getClasses(row).has('tc-row'),
      cells: $(row).children('td').toArray().map((cell) => parseTableCell($, $(cell))),
    })),
  }
}

function parseCompetitionMatrix($, $node) {
  const table = $node.find('.comp-matrix').first()
  return {
    type: 'competitionMatrix',
    title: cleanText($node.find('> .card-title').first().text()),
    columns: table.find('thead th').toArray().slice(1).map((cell) => cleanText($(cell).text())),
    rows: table.find('tbody tr').toArray().map((row) => {
      const cells = $(row).children('td').toArray()
      return {
        label: parseTableCell($, $(cells[0])),
        highlight: getClasses(row).has('tc-row'),
        cells: cells.slice(1).map((cell) => parseTableCell($, $(cell))),
      }
    }),
    note: $node.children('p').last().length ? cleanText($node.children('p').last().text()) : undefined,
  }
}

function parseTableCell($, $cell) {
  const tag = $cell.find('.tag').first()
  const code = $cell.find('code').first()

  if (tag.length && cleanText($cell.text()) === cleanText(tag.text())) {
    return pruneEmpty({ text: cleanText(tag.text()), tone: detectTone(tag.attr('class') ?? '') })
  }

  if (code.length && cleanText($cell.text()) === cleanText(code.text())) {
    return pruneEmpty({ text: cleanText(code.text()), code: true })
  }

  return pruneEmpty({ text: textContent($cell), tone: detectTone($cell.attr('class') ?? '') })
}

function parseTimelineBlock($, $node) {
  return {
    type: 'timeline',
    title: cleanText($node.find('> .card-title').first().text()),
    variant: 'default',
    items: $node.find('.phase').toArray().map((item) => {
      const $item = $(item)
      return { title: cleanText($item.find('.phase-label').text()), body: cleanText($item.find('p').text()) }
    }),
  }
}

function parseFlowSteps($, $node) {
  return {
    type: 'flowSteps',
    title: cleanText($node.find('> .card-title').first().text()),
    variant: $node.find('.flow-num.alt').length ? 'returning' : 'default',
    steps: $node.find('.flow-step').toArray().map((item) => {
      const $item = $(item)
      return {
        id: cleanText($item.find('.flow-num').text()),
        title: cleanText($item.find('.flow-title').text()),
        body: cleanText($item.find('.flow-desc').text()),
        detailTitle: cleanText($item.find('.flow-detail-title').text()) || undefined,
        detailItems: $item.find('.flow-detail li').toArray().map((detail) => textContent($(detail))),
      }
    }),
  }
}

function parseTrendList($, $node) {
  return {
    type: 'trendList',
    items: $node.find('.trend-item').toArray().map((item) => {
      const $item = $(item)
      return {
        icon: cleanText($item.find('.trend-icon').text()),
        title: cleanText($item.find('h4').text()),
        body: cleanText($item.find('p').text()),
      }
    }),
  }
}

function parseMilestoneList($, $node) {
  return {
    type: 'milestoneList',
    title: cleanText($node.find('> .card-title').first().text()),
    items: $node.find('.milestone-item').toArray().map((item) => {
      const $item = $(item)
      return { icon: cleanText($item.find('.ms-icon').text()), title: cleanText($item.find('h4').text()), body: cleanText($item.find('p').text()) }
    }),
  }
}

function parseArchFlow($, $node) {
  return {
    type: 'archFlow',
    title: cleanText($node.find('> .card-title').first().text()),
    lead: $node.children('p').length ? cleanText($node.children('p').first().text()) : undefined,
    nodes: $node.find('.arch-node').toArray().map((item) => {
      const $item = $(item)
      return { title: cleanText($item.find('.arch-node-title').text()), subtitle: cleanText($item.find('.arch-node-sub').text()) }
    }),
  }
}

function parseLoopDiagram($, $node) {
  return {
    type: 'loopDiagram',
    title: cleanText($node.find('> .card-title').first().text()),
    titleTone: detectTone($node.find('> .card-title').first().attr('class') ?? ''),
    nodes: $node.find('.loop-node').toArray().map((item) => {
      const $item = $(item)
      return { title: cleanText($item.find('.loop-node-title').text()), subtitle: cleanText($item.find('.loop-node-sub').text()) }
    }),
    note: $node.children('p').length ? textContent($node.children('p').first()) : undefined,
  }
}

function parseSitemapTree($, $node) {
  const title = cleanText($node.find('> .card-title').first().text())
  const contentNodes = $node.children().toArray().filter((child) => !getClasses(child).has('card-title'))
  return { type: 'sitemapTree', title, nodes: parseSitemapNodes($, contentNodes) }
}

function parseSitemapNodes($, nodes) {
  const result = []
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index]
    const classes = getClasses(node)
    if (!classes.has('sitemap-item')) continue

    const $node = $(node)
    const dotClass = $node.find('.sitemap-dot').attr('class') ?? ''
    const tone = dotClass.includes('secondary') ? 'blue' : dotClass.includes('tertiary') ? 'muted' : dotClass.includes('inl-034') || dotClass.includes('inl-036') ? 'amber' : undefined
    const item = pruneEmpty({ name: cleanText($node.find('.sitemap-name').text()), route: cleanText($node.find('.sitemap-route').text()) || undefined, tone })

    const nextNode = nodes[index + 1]
    if (nextNode && getClasses(nextNode).has('sitemap-level')) {
      item.children = parseSitemapNodes($, $(nextNode).children().toArray())
      index += 1
    }

    result.push(item)
  }
  return result
}

function parseStackedList($, $node, variant) {
  if (variant === 'competition') {
    return {
      type: 'stackedList',
      variant,
      items: $node.find('.comp-row').toArray().map((item) => {
        const $item = $(item)
        return { title: cleanText($item.find('.comp-name').text()), description: cleanText($item.find('.comp-desc').text()), tag: parseTag($item.find('.tag').first()) }
      }),
    }
  }

  if (variant === 'usp') {
    return {
      type: 'stackedList',
      variant,
      items: $node.find('.usp-big').toArray().map((item) => {
        const $item = $(item)
        return { label: cleanText($item.find('.usp-num').text()), title: cleanText($item.find('h4').text()), description: cleanText($item.find('p').text()) }
      }),
    }
  }

  return {
    type: 'stackedList',
    variant,
    items: $node.find('.roadmap-step').toArray().map((item) => {
      const $item = $(item)
      return {
        label: normalizeInline($item.find('.step-phase').html()?.replace(/<br\s*\/?>/giu, '\n') ?? ''),
        title: cleanText($item.find('.step-title').text()),
        description: cleanText($item.find('.step-desc').text()),
      }
    }),
  }
}

function parseAcceptanceList($, $node) {
  return {
    type: 'acceptanceList',
    title: cleanText($node.find('> .card-title').first().text()),
    items: $node.find('.ac-row').toArray().map((item) => {
      const $item = $(item)
      const strong = $item.find('.ac-text strong').first()
      return { number: cleanText($item.find('.ac-num').text()), title: cleanText(strong.text()), body: cleanText($item.find('.ac-text').text().replace(strong.text(), '')) }
    }),
  }
}

function parseColorPaletteCard($, $node) {
  return {
    type: 'colorPalette',
    groups: [{
      title: cleanText($node.find('> .card-title').first().text()),
      colors: $node.find('.color-chip').toArray().map((chip) => {
        const $chip = $(chip)
        return { name: cleanText($chip.find('.color-chip-name').text()), hex: cleanText($chip.find('.color-chip-hex').text()) }
      }),
    }],
  }
}

function parseListItems($, $list) {
  return $list.children('li').toArray().map((item) => textContent($(item)))
}

function parseTag($tag) {
  if (!$tag.length) return undefined
  return pruneEmpty({ label: cleanText($tag.text()), tone: detectTone($tag.attr('class') ?? '') })
}

function simplifyBlock(block) {
  if (!block || typeof block !== 'object' || !('type' in block)) return block

  switch (block.type) {
    case 'table':
      return { table: omitType(block) }
    case 'marketCards':
      return { market: omitType(block) }
    case 'swot':
      return { swot: omitType(block) }
    case 'stackedList':
      return { stack: omitType(block) }
    case 'loopDiagram':
      return { loop: omitType(block) }
    case 'timeline':
      return { timeline: omitType(block) }
    case 'sitemapTree':
      return { sitemap: omitType(block) }
    case 'colorPalette':
      return { palette: block.groups?.length === 1 ? block.groups[0] : block.groups }
    case 'investmentBreakdown':
      return { investment: block.items }
    case 'flowSteps':
      return { flow: omitType(block) }
    case 'archFlow':
      return { architecture: omitType(block) }
    case 'unitGrid':
      return { units: block.items }
    case 'milestoneList':
      return { milestones: omitType(block) }
    case 'acceptanceList':
      return { acceptance: omitType(block) }
    case 'letterBody':
      return { letter: omitType(block) }
    case 'useCaseCards':
      return { useCases: block.items }
    case 'featureBlocks':
      return { featureGrid: omitType(block) }
    case 'moscowGrid':
      return { moscow: block.items }
    case 'partnerGrid':
      return { partners: block.items }
    case 'revenueList':
      return { revenue: block.items }
    case 'canvasGrid':
      return { canvas: block.rows }
    case 'ctaPanel':
      return { cta: omitType(block) }
    case 'trendList':
      return { trends: block.items }
    case 'competitionMatrix':
      return { matrix: omitType(block) }
    default:
      return block
  }
}

function omitType(block) {
  const { type, ...rest } = block
  return rest
}

function collapseTextValue(paragraphs) {
  if (!paragraphs?.length) return undefined
  return paragraphs.length === 1 ? paragraphs[0] : paragraphs
}

function normalizeSectionEyebrow(value) {
  if (!value) return undefined
  return value.replace(/^\d+\s*[—-]\s*/u, '').trim() || undefined
}

function detectTone(className) {
  if (className.includes('tag-green') || className.includes('inl-005') || className.includes('swot-s') || className.includes('must')) return 'green'
  if (className.includes('tag-blue') || className.includes('inl-021') || className.includes('swot-o') || className.includes('should')) return 'blue'
  if (className.includes('tag-amber') || className.includes('inl-022') || className.includes('swot-t') || className.includes('could')) return 'amber'
  if (className.includes('tag-red') || className.includes('inl-031') || className.includes('swot-w') || className.includes('wont')) return 'red'
  if (className.includes('secondary') || className.includes('tertiary') || className.includes('muted')) return 'muted'
  return undefined
}

function getClasses(node) {
  return new Set(String(node.attribs?.class ?? '').split(/\s+/u).filter(Boolean))
}

function pruneEmpty(value) {
  if (Array.isArray(value)) {
    const items = value.map((item) => pruneEmpty(item)).filter((item) => item !== undefined)
    return items.length ? items : undefined
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, pruneEmpty(item)])
      .filter(([, item]) => item !== undefined)
    return entries.length ? Object.fromEntries(entries) : undefined
  }

  if (value === undefined || value === null) return undefined
  if (typeof value === 'string' && value.length === 0) return undefined
  return value
}

function writeStyles() {
  const legacyCss = fs.readFileSync(path.join(legacyDir, 'style.css'), 'utf8')
  const cleanedCss = legacyCss.replace(
    /\/\* Migrated inline style attributes \*\/[\s\S]*?\/\* ---- COLOR SWATCHES \(designsystem\.html\) ---- \*\//u,
    '/* ---- COLOR SWATCHES (designsystem.html) ---- */',
  )

  const additions = `

/* ---- APP DOSSIER HELPERS ---- */
.section-block + .section-block { margin-top: 24px; }
.section-block--spacious + .section-block { margin-top: 28px; }
.canvas-grid { display: grid; gap: 12px; }
.canvas-grid--3 { grid-template-columns: 1fr 1fr 1fr; }
.canvas-grid--2 { grid-template-columns: 1fr 1fr; }
.canvas-grid + .canvas-grid { margin-top: 12px; }
.canvas-block--accent { border-left: 3px solid var(--green); }
.title-tone-green { color: var(--green); }
.title-tone-blue { color: var(--blue); }
.title-tone-amber { color: var(--amber); }
.title-tone-red { color: var(--red); }
.block-note { margin-top: 16px; font-size: 13px; color: var(--text-dim); }
.block-intro { margin-bottom: 16px; }
.solution-stack { display: flex; flex-direction: column; gap: 12px; }
.page-stack { display: flex; flex-direction: column; }
.code-inline {
  color: var(--green);
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
}
.document-empty, .document-not-found {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.document-not-found .highlight { margin-top: 32px; }
.section-intro { margin-bottom: 16px; }
.text-note { font-size: 13px; color: var(--text-dim); }
.text-lead { font-size: 16px; color: var(--text); line-height: 1.8; }
.table-note { margin-top: 16px; font-size: 12px; color: var(--text-muted); }
.home-note { margin-top: 48px; }
.card-title + .table-note { margin-top: 12px; }
.step-phase { white-space: pre-line; }
@media (max-width: 700px) {
  .canvas-grid--2, .canvas-grid--3 { grid-template-columns: 1fr; }
}
`

  fs.writeFileSync(path.join(stylesDir, 'app.css'), `${cleanedCss}${additions}\n`, 'utf8')
}
