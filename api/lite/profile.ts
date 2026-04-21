/**
 * Vercel serverless: GET /api/lite/profile?handle=@username
 *
 * NOTE: Apify runs may take 15-30s. Vercel Hobby has a 10s limit.
 * If you're on Vercel Hobby, use the Railway endpoint instead
 * (VITE_API_URL/lite/profile) which has no timeout.
 * This file is kept for Vercel Pro deployments.
 */

export interface InstagramProfile {
  username: string
  fullName: string
  bio: string
  followers: number
  following: number
  mediaCount: number
  isPrivate: boolean
}

function normalizeHandle(raw: string): string {
  const s = raw.trim()
  const urlMatch = s.match(/instagram\.com\/([A-Za-z0-9._]+)/)
  if (urlMatch) return urlMatch[1]
  return s.replace(/^@/, '')
}

export default async function handler(
  req: { method: string; query: { handle?: string } },
  res: {
    status(code: number): { json(data: unknown): void }
    json(data: unknown): void
    setHeader(name: string, value: string): void
  }
) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.status(200).json({}); return }

  const raw = req.query.handle
  if (!raw) { res.status(400).json({ error: 'handle is required' }); return }

  const handle = normalizeHandle(raw)
  if (!handle) { res.status(400).json({ error: 'Invalid handle' }); return }

  const token = process.env.APIFY_TOKEN
  if (!token) { res.status(503).json({ error: 'not_configured' }); return }

  try {
    const result = await fetchViaApify(handle, token)
    res.json(result)
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[lite/profile]', detail)
    res.status(500).json({ error: 'Fetch failed', detail })
  }
}

export async function fetchViaApify(handle: string, token: string): Promise<InstagramProfile> {
  const url = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${token}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernames: [handle] }),
    signal: AbortSignal.timeout(55_000),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Apify ${res.status}: ${text.slice(0, 200)}`)
  }

  const items = await res.json() as Record<string, unknown>[]

  if (!items || items.length === 0) {
    throw new Error('Profile not found or Instagram blocked the request')
  }

  const d = items[0]

  const isPrivate = Boolean(d.private ?? d.isPrivate)

  if (isPrivate) {
    return {
      username: String(d.username ?? handle),
      fullName: String(d.fullName ?? ''),
      bio: '',
      followers: Number(d.followersCount ?? d.follower_count ?? 0),
      following: Number(d.followsCount ?? d.following_count ?? 0),
      mediaCount: Number(d.postsCount ?? d.media_count ?? 0),
      isPrivate: true,
    }
  }

  return {
    username: String(d.username ?? handle),
    fullName: String(d.fullName ?? ''),
    bio: String(d.biography ?? d.bio ?? ''),
    followers: Number(d.followersCount ?? d.follower_count ?? 0),
    following: Number(d.followsCount ?? d.following_count ?? 0),
    mediaCount: Number(d.postsCount ?? d.media_count ?? 0),
    isPrivate: false,
  }
}
