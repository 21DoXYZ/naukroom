import { Router } from 'express'
import { eq, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { generatedOutputs } from '../db/schema.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', (req: AuthRequest, res) => {
  const all = db.select().from(generatedOutputs)
    .where(eq(generatedOutputs.userId, req.userId!))
    .orderBy(desc(generatedOutputs.createdAt))
    .all()
  // Deduplicate: keep only the most recent output per type
  const seen = new Set<string>()
  const outputs = all.filter(o => {
    if (seen.has(o.type)) return false
    seen.add(o.type)
    return true
  })
  res.json(outputs)
})

export default router
