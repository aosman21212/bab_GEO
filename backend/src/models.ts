import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true }
)

export const User = mongoose.model('User', userSchema)

const siteContentSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    locale: { type: String, enum: ['en', 'ar'], required: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
)
siteContentSchema.index({ key: 1, locale: 1 }, { unique: true })

export const SiteContent = mongoose.model('SiteContent', siteContentSchema)

const partnerSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true },
    websiteUrl: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const Partner = mongoose.model('Partner', partnerSchema)

const testimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String },
    quote: { type: String, required: true },
    logoUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
    locale: { type: String, enum: ['en', 'ar', 'all'], default: 'all' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const Testimonial = mongoose.model('Testimonial', testimonialSchema)

const pageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      enum: ['solution', 'industry', 'product', 'case-study', 'article', 'landing'],
      required: true,
    },
    landingType: {
      type: String,
      enum: ['lead-form', 'whatsapp'],
    },
    status: { type: String, enum: ['published', 'draft'], default: 'published' },
    locales: {
      en: { type: Schema.Types.Mixed, required: true },
      ar: { type: Schema.Types.Mixed },
    },
  },
  { timestamps: true }
)

export const Page = mongoose.model('Page', pageSchema)

const inquirySchema = new Schema(
  {
    name: { type: String, required: true },
    company: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    project: { type: String, required: true },
    locale: { type: String, enum: ['en', 'ar'], default: 'en' },
    sourceSlug: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['new', 'read', 'archived'], default: 'new' },
  },
  { timestamps: true }
)

export const Inquiry = mongoose.model('Inquiry', inquirySchema)

const jobSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    titleEn: { type: String, required: true, trim: true },
    titleAr: { type: String, required: true, trim: true },
    departmentEn: { type: String, trim: true, default: '' },
    departmentAr: { type: String, trim: true, default: '' },
    locationEn: { type: String, trim: true, default: '' },
    locationAr: { type: String, trim: true, default: '' },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    descriptionEn: { type: String, default: '' },
    descriptionAr: { type: String, default: '' },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Job = mongoose.model('Job', jobSchema)

const jobApplicationSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', default: null },
    jobTitleSnapshot: { type: String, default: '' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    coverLetter: { type: String, default: '' },
    cvFilename: { type: String, required: true },
    cvOriginalName: { type: String, required: true },
    locale: { type: String, enum: ['en', 'ar'], default: 'en' },
    status: { type: String, enum: ['new', 'read', 'archived'], default: 'new' },
  },
  { timestamps: true }
)

export const JobApplication = mongoose.model('JobApplication', jobApplicationSchema)
