import rateLimit from 'express-rate-limit'
import type { Request } from 'express'

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for']
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]
  // Fall back to socket address (avoids req.ip which triggers ERR_ERL_KEY_GEN_IPV6 validation)
  return (raw ?? req.socket?.remoteAddress ?? 'unknown').trim()
}

const validate = { trustProxy: false } as const

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Забагато спроб. Спробуйте через 15 хвилин.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate,
})

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 6,
  message: { error: 'Забагато запитів. Зачекайте хвилину.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate,
})

export const liteAuditLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Ліміт аудитів вичерпано. Спробуйте через годину.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate,
})

export const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Забагато заявок. Спробуйте через годину.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate,
})
