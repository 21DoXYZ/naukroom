type Props = Record<string, unknown>

export function track(event: string, props?: Props) {
  if (typeof window === 'undefined') return

  const w = window as Window & {
    dataLayer?: unknown[]
    plausible?: (event: string, opts: { props?: Props }) => void
  }

  if (w.dataLayer) {
    w.dataLayer.push({ event, ...props })
  }

  if (w.plausible) {
    w.plausible(event, { props })
  }

  if (import.meta.env.DEV) {
    console.log('[analytics]', event, props)
  }
}

export function readUTM(): Record<string, string> {
  const params = new URLSearchParams(window.location.search)
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']
  const result: Record<string, string> = {}
  keys.forEach(k => {
    const v = params.get(k)
    if (v) result[k] = v
  })
  return result
}
