import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import mongoose from 'mongoose'
import { Job, JobApplication } from '../models.js'
import { rateLimit } from '../cache.js'
import { requireAuth } from '../middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const cvUploadsDir = path.resolve(__dirname, '../../uploads/cvs')

fs.mkdirSync(cvUploadsDir, { recursive: true })

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const ALLOWED_EXT = new Set(['.pdf', '.doc', '.docx'])

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, cvUploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf'
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
    cb(null, safe)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (!ALLOWED_EXT.has(ext) || !ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error('Only PDF, DOC, or DOCX files are allowed'))
      return
    }
    cb(null, true)
  },
})

export const jobApplicationsRouter = Router()

jobApplicationsRouter.post('/', (req, res) => {
  upload.single('cv')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Upload failed' })
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    const limit = await rateLimit(`rl:job-app:${ip}`, 5, 60)
    if (!limit.ok) {
      if (req.file) fs.unlink(req.file.path, () => {})
      return res.status(429).json({ error: 'Too many requests. Please try again later.' })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'CV file is required' })
    }

    const parsed = z
      .object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        coverLetter: z.string().optional(),
        jobId: z.string().optional(),
        locale: z.enum(['en', 'ar']).optional(),
      })
      .safeParse({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        coverLetter: req.body.coverLetter || '',
        jobId: req.body.jobId || undefined,
        locale: req.body.locale === 'ar' ? 'ar' : req.body.locale === 'en' ? 'en' : undefined,
      })

    if (!parsed.success) {
      fs.unlink(req.file.path, () => {})
      return res.status(400).json({ error: 'Invalid application', details: parsed.error.flatten() })
    }

    let jobTitleSnapshot = 'General application'
    let jobId: mongoose.Types.ObjectId | null = null

    if (parsed.data.jobId) {
      if (!mongoose.Types.ObjectId.isValid(parsed.data.jobId)) {
        fs.unlink(req.file.path, () => {})
        return res.status(400).json({ error: 'Invalid job id' })
      }
      const job = await Job.findById(parsed.data.jobId).lean()
      if (!job || job.status !== 'open') {
        fs.unlink(req.file.path, () => {})
        return res.status(400).json({ error: 'Job is not open for applications' })
      }
      jobId = job._id as mongoose.Types.ObjectId
      jobTitleSnapshot = `${job.titleEn} / ${job.titleAr}`
    }

    const application = await JobApplication.create({
      jobId,
      jobTitleSnapshot,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      coverLetter: parsed.data.coverLetter || '',
      cvFilename: req.file.filename,
      cvOriginalName: req.file.originalname,
      locale: parsed.data.locale ?? 'en',
    })

    return res.status(201).json({ ok: true, id: application._id })
  })
})

jobApplicationsRouter.get('/', requireAuth, async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined
  const filter = status ? { status } : {}
  const items = await JobApplication.find(filter).sort({ createdAt: -1 }).limit(200).lean()
  return res.json(items)
})

jobApplicationsRouter.patch('/:id', requireAuth, async (req, res) => {
  const parsed = z
    .object({ status: z.enum(['new', 'read', 'archived']) })
    .safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid status' })

  const item = await JobApplication.findByIdAndUpdate(req.params.id, parsed.data, { new: true })
  if (!item) return res.status(404).json({ error: 'Not found' })
  return res.json(item)
})

jobApplicationsRouter.get('/:id/cv', requireAuth, async (req, res) => {
  const item = await JobApplication.findById(req.params.id).lean()
  if (!item) return res.status(404).json({ error: 'Not found' })

  const filePath = path.join(cvUploadsDir, item.cvFilename)
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'CV file not found' })
  }

  const ext = path.extname(item.cvFilename).toLowerCase()
  const type =
    ext === '.pdf'
      ? 'application/pdf'
      : ext === '.doc'
        ? 'application/msword'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

  res.setHeader('Content-Type', type)
  res.setHeader(
    'Content-Disposition',
    `attachment; filename*=UTF-8''${encodeURIComponent(item.cvOriginalName)}`,
  )
  return res.sendFile(filePath)
})
