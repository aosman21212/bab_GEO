import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config.js'
import { connectMongo } from './db.js'
import { ensureRedis } from './cache.js'
import { authRouter } from './routes/auth.js'
import { contentRouter } from './routes/content.js'
import { partnersRouter } from './routes/partners.js'
import { testimonialsRouter } from './routes/testimonials.js'
import { pagesRouter } from './routes/pages.js'
import { inquiriesRouter } from './routes/inquiries.js'
import { uploadsRouter } from './routes/uploads.js'
import { jobsRouter } from './routes/jobs.js'
import { jobApplicationsRouter } from './routes/job-applications.js'
import { usersRouter } from './routes/users.js'
import { ensureHomePage } from './homepage.js'

async function main() {
  await connectMongo()
  await ensureRedis()
  try {
    await ensureHomePage()
  } catch (err) {
    console.error('[api] ensureHomePage failed', err)
  }

  const app = express()
  app.set('trust proxy', 1)
  app.use(helmet())
  app.use(
    cors({
      origin: env.corsOrigin.split(',').map((s) => s.trim()),
      credentials: true,
    })
  )
  app.use(express.json({ limit: '2mb' }))
  app.use(morgan('dev'))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'bab-cms-api' })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/users', usersRouter)
  app.use('/api/content', contentRouter)
  app.use('/api/partners', partnersRouter)
  app.use('/api/testimonials', testimonialsRouter)
  app.use('/api/pages', pagesRouter)
  app.use('/api/inquiries', inquiriesRouter)
  app.use('/api/jobs', jobsRouter)
  app.use('/api/job-applications', jobApplicationsRouter)
  app.use('/api/uploads', uploadsRouter)

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  })

  app.listen(env.port, () => {
    console.log(`[api] listening on http://localhost:${env.port}`)
  })
}

main().catch((err) => {
  console.error('Failed to start API', err)
  process.exit(1)
})
