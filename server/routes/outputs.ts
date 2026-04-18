import { Router } from 'express'
import { eq, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { generatedOutputs } from '../db/schema.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', (req: AuthRequest, res) => {
  const outputs = db.select().from(generatedOutputs)
    .where(eq(generatedOutputs.userId, req.userId!))
    .orderBy(desc(generatedOutputs.createdAt))
    .all()
  res.json(outputs)
})

export default router
