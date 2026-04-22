import rateLimit from 'express-rate-limit'
import type { Request } from 'express'

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for']
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]) ?? req.ip ?? 'unknown'
  return ip.trim()
}

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Забагато спроб. Спробуйте через 15 хвилин.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
})

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 6,
  message: { error: 'Забагато запитів. Зачекайте хвилину.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
})

export const liteAuditLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Ліміт аудитів вичерпано. Спробуйте через годину.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
})

export const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Забагато заявок. Спробуйте через годину.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
})
