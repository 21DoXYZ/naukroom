import rateLimit from 'express-rate-limit'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Забагато спроб. Спробуйте через 15 хвилин.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 6,
  message: { error: 'Забагато запитів. Зачекайте хвилину.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const liteAuditLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Ліміт аудитів вичерпано. Спробуйте через годину.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip ?? req.headers['x-forwarded-for']?.toString() ?? 'unknown'
  },
})

export const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Забагато заявок. Спробуйте через годину.' },
  standardHeaders: true,
  legacyHeaders: false,
})
