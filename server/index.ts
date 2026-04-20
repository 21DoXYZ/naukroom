import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { db } from './db/index.js'
import authRoutes from './routes/auth.js'
import onboardingRoutes from './routes/onboarding.js'
import generateRoutes from './routes/generate.js'
import adminRoutes from './routes/admin.js'
import outputsRoutes from './routes/outputs.js'
import liteRoutes from './routes/lite.js'
import { aiLimiter } from './middleware/rateLimit.js'

void db

const app = express()

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173']

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}))

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) cb(null, true)
    else cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }))

app.use('/api/lite', liteRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/onboarding', onboardingRoutes)
app.use('/api/generate', aiLimiter, generateRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/outputs', outputsRoutes)

const PORT = Number(process.env.PORT ?? 3001)
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
