import type { ReactNode } from 'react'

export function HomeRichText({
  text,
  accentClass = 'text-primary',
  mutedClass = 'text-navy',
}: {
  text: string
  accentClass?: string
  mutedClass?: string
}): ReactNode {
  const nodes: ReactNode[] = []
  const re = /<accent>([\s\S]*?)<\/accent>|<muted>([\s\S]*?)<\/muted>|<br\s*\/?>(?:\s*<\/br>)?/gi
  let last = 0
  let i = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    const full = match[0]
    const lower = full.toLowerCase()
    if (lower.startsWith('<accent')) {
      nodes.push(
        <span key={i} className={accentClass}>
          {match[1]}
        </span>,
      )
    } else if (lower.startsWith('<muted')) {
      nodes.push(
        <span key={i} className={mutedClass}>
          {match[2]}
        </span>,
      )
    } else {
      nodes.push(<br key={i} />)
    }
    i += 1
    last = match.index + full.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return <>{nodes}</>
}
