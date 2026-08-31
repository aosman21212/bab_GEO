import nodemailer from 'nodemailer'
import { env } from './config.js'

export type InquiryMailPayload = {
  name: string
  company?: string
  phone: string
  email: string
  project: string
  locale?: string
  sourceSlug?: string
}

function smtpConfigured() {
  return Boolean(env.smtpHost)
}

export async function sendInquiryNotification(inquiry: InquiryMailPayload): Promise<void> {
  if (!smtpConfigured()) {
    console.warn(
      '[mail] SMTP_HOST not set — inquiry saved but email to %s was skipped',
      env.inquiryNotifyTo,
    )
    return
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
  })

  const company = inquiry.company?.trim() || '—'
  const locale = inquiry.locale || 'en'
  const subject = `[BAB Contact Us] New inquiry from ${inquiry.name}`
  const text = [
    'New Contact Us inquiry',
    '',
    `Name: ${inquiry.name}`,
    `Company: ${company}`,
    `Phone: ${inquiry.phone}`,
    `Email: ${inquiry.email}`,
    `Locale: ${locale}`,
    inquiry.sourceSlug ? `Campaign: ${inquiry.sourceSlug}` : '',
    '',
    'Project / message:',
    inquiry.project,
  ].join('\n')

  await transporter.sendMail({
    from: env.smtpFrom,
    to: env.inquiryNotifyTo,
    replyTo: inquiry.email,
    subject,
    text,
  })
}
