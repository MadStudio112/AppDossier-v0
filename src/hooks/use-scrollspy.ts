import { useEffect, useState } from 'react'

export function useScrollSpy(ids: string[]) {
  const [trackedId, setTrackedId] = useState('')
  // Derive activeId without calling setState synchronously in the effect body
  const activeId = ids.length === 0 ? '' : (ids.includes(trackedId) ? trackedId : (ids[0] ?? ''))

  useEffect(() => {
    if (ids.length === 0 || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return undefined
    }

    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section instanceof HTMLElement)

    if (sections.length === 0) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTrackedId(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [ids])

  return activeId
}
