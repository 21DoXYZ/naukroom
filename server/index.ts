import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { db } from './db/index.js'  // initializes DB on import
import authRoutes from './routes/auth.js'
import onboardingRoutes from './routes/onboarding.js'
import generateRoutes from './routes/generate.js'
import adminRoutes from './routes/admin.js'
import outputsRoutes from './routes/outputs.js'

void db // ensure DB initializes

const app = express()

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173']

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) cb(null, true)
    else cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/onboarding', onboardingRoutes)
app.use('/api/generate', generateRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/outputs', outputsRoutes)

const PORT = Number(process.env.PORT ?? 3001)
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
