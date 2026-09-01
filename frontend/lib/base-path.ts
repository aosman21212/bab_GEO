export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '/bab_geo').replace(/\/$/, '')

export function withBasePath(path: string) {
  if (!path.startsWith('/')) return `${basePath}/${path}`
  if (basePath && path.startsWith(basePath)) return path
  if (path === '/' && basePath) return basePath
  return `${basePath}${path}`
}

/** Prefix internal asset/API paths stored in CMS (e.g. /api/files/..., /uploads/...). */
export function withBasePathIfInternal(src: string) {
  const trimmed = src?.trim()
  if (!trimmed) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return withBasePath(trimmed)
}
