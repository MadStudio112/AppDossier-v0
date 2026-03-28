import { Fragment, type ReactNode } from 'react'

const tokenPattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g

export function renderInlineText(value: string): ReactNode {
  const lines = value.split('\n')
  return lines.map((line, lineIndex) => (
    <Fragment key={`line-${lineIndex}`}>
      {parseLine(line)}
      {lineIndex < lines.length - 1 ? <br /> : null}
    </Fragment>
  ))
}

function parseLine(line: string): ReactNode[] {
  const tokens = line.split(tokenPattern).filter(Boolean)
  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={`token-${index}`}>{token.slice(2, -2)}</strong>
    }

    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={`token-${index}`} className="code-inline">{token.slice(1, -1)}</code>
    }

    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={`token-${index}`}>{token.slice(1, -1)}</em>
    }

    return <Fragment key={`token-${index}`}>{token}</Fragment>
  })
}
