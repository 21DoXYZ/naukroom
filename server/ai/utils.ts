/**
 * Strips trailing "(NNN символ*)" annotation that the model sometimes appends
 * to bio text by copying the golden-example format literally.
 * e.g. "Нутриціолог | Bio... (142 символи)" → "Нутриціолог | Bio..."
 */
export function cleanBio(text: string, maxLen = 150): string {
  return text.replace(/\s*\(\d+\s*символ[ів]*\)\s*$/, '').trim().slice(0, maxLen)
}

/**
 * Extracts and parses JSON from model output.
 * Handles markdown code fences (```json ... ``` or ``` ... ```) that
 * models sometimes emit despite instructions to return raw JSON.
 */
export function parseModelJson<T>(text: string, fallback: T): T {
  const stripped = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()
  try {
    return JSON.parse(stripped) as T
  } catch {
    // Second attempt: extract the first {...} or [...] block
    const match = stripped.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
    if (match) {
      try {
        return JSON.parse(match[1]) as T
      } catch { /* fall through */ }
    }
    return fallback
  }
}
