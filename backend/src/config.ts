import 'dotenv/config'

function required(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback
  if (!value) throw new Error(`Missing env: ${name}`)
  return value
}

export const env = {
  port: Number(process.env.PORT ?? 4001),
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/bab_cms'),
  redisUrl: required('REDIS_URL', 'redis://127.0.0.1:6379'),
  jwtSecret: required('JWT_SECRET', 'dev-secret'),
  corsOrigin: required('CORS_ORIGIN', 'http://localhost:3003'),
  adminEmail: required('ADMIN_EMAIL', 'admin@bab.com.sa'),
  adminPassword: required('ADMIN_PASSWORD', 'Admin123!'),
}
