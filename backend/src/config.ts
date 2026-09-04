import 'dotenv/config'

const isProd = process.env.NODE_ENV === 'production'

const WEAK_JWT_SECRETS = new Set([
  'dev-secret',
  'change-me',
  'change-me-in-production-bab-cms',
  'secret',
  'jwt-secret',
])

const WEAK_ADMIN_PASSWORDS = new Set(['Admin123!', 'admin', 'password', '12345678'])

function required(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback
  if (!value) throw new Error(`Missing env: ${name}`)
  return value
}

/** Local/dev may use fallbacks; production must set real secrets (no weak known defaults). */
function requiredSecret(name: string, devFallback?: string) {
  const fromEnv = process.env[name]?.trim()
  if (isProd) {
    if (!fromEnv) throw new Error(`Missing env: ${name} (required in production)`)
    return fromEnv
  }
  return fromEnv || devFallback || ''
}

/** Rejecting here exits the process before listen(), so the reason must name the fix. */
function insecureSecretError(name: string, reason: string, requirement: string) {
  return new Error(
    `Insecure ${name} in production (${reason}). The API cannot start. ` +
      `Set ${name} to ${requirement} in the root .env next to docker-compose.yml, ` +
      'then run: docker compose up -d backend',
  )
}

function assertProductionSecrets(jwtSecret: string, adminPassword: string) {
  if (!isProd) return
  if (WEAK_JWT_SECRETS.has(jwtSecret)) {
    throw insecureSecretError('JWT_SECRET', 'known placeholder value', 'a strong random secret (24+ chars)')
  }
  if (jwtSecret.length < 24) {
    throw insecureSecretError('JWT_SECRET', `only ${jwtSecret.length} chars`, 'a strong random secret (24+ chars)')
  }
  if (WEAK_ADMIN_PASSWORDS.has(adminPassword)) {
    throw insecureSecretError('ADMIN_PASSWORD', 'known weak password', 'a strong password (12+ chars)')
  }
  if (adminPassword.length < 12) {
    throw insecureSecretError('ADMIN_PASSWORD', `only ${adminPassword.length} chars`, 'a strong password (12+ chars)')
  }
}

const jwtSecret = requiredSecret('JWT_SECRET', 'dev-secret')
const adminPassword = requiredSecret('ADMIN_PASSWORD', 'Admin123!')
assertProductionSecrets(jwtSecret, adminPassword)

export const env = {
  port: Number(process.env.PORT ?? 4001),
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/bab_cms'),
  redisUrl: required('REDIS_URL', 'redis://127.0.0.1:6379'),
  jwtSecret,
  corsOrigin: required('CORS_ORIGIN', 'http://localhost:3003'),
  adminEmail: requiredSecret('ADMIN_EMAIL', 'admin@bab.com.sa') || 'admin@bab.com.sa',
  adminPassword,
  /** Contact Us inquiry notifications */
  inquiryNotifyTo: process.env.INQUIRY_NOTIFY_TO?.trim() || 'sales@bab.com.sa',
  smtpHost: process.env.SMTP_HOST?.trim() || '',
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER?.trim() || '',
  smtpPass: process.env.SMTP_PASS?.trim() || '',
  smtpFrom: process.env.SMTP_FROM?.trim() || 'noreply@bab.com.sa',
  smtpSecure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1',
}
