const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '/api'

export function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

export async function ssePost<T>(
  path: string,
  onResult: (result: T) => void,
  onError: (msg: string) => void,
) {
  let resolved = false
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(apiUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
    if (!res.body) throw new Error('Немає відповіді')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const p = JSON.parse(line.slice(6)) as { status: string; result?: T; error?: string }
        if (p.status === 'done' && p.result) { resolved = true; onResult(p.result) }
        if (p.status === 'error') { resolved = true; onError(p.error ?? 'Помилка генерації') }
      }
    }
  } catch (err) {
    if (!resolved) {
      resolved = true
      onError(err instanceof Error ? err.message : 'Помилка підключення')
    }
  }

  if (!resolved) {
    onError('Підключення перервано. Спробуй ще раз.')
  }
}
