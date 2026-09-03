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

export async function sendMfaCodeEmail(
  email: string,
  code: string,
  locale = 'en',
): Promise<void> {
  if (!smtpConfigured()) {
    throw new Error('SMTP is not configured on the server. Contact administrator.')
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
  })

  const isAr = locale === 'ar'
  const subject = isAr
    ? `[BAB CMS] رمز التحقق بخطوتين: ${code}`
    : `[BAB CMS] Admin Two-Step Verification Code: ${code}`

  const text = isAr
    ? [
        `مرحباً،`,
        ``,
        `رمز التحقق الخاص بك لتسجيل الدخول إلى لوحة تحكم باب هو:`,
        ``,
        `   ${code}`,
        ``,
        `تنتهي صلاحية هذا الرمز بعد 100 دقيقة.`,
        `إذا لم تطلب هذا الرمز، يرجى تغيير كلمة المرور فوراً.`,
        ``,
        `باب إنترناشونال`,
      ].join('\n')
    : [
        `Hello,`,
        ``,
        `Your verification code for BAB CMS Admin login is:`,
        ``,
        `   ${code}`,
        ``,
        `This code expires in 100 minutes.`,
        `If you did not request this login, please change your password immediately.`,
        ``,
        `BAB International Corp`,
      ].join('\n')

  await transporter.sendMail({
    from: env.smtpFrom,
    to: email,
    subject,
    text,
  })
}
