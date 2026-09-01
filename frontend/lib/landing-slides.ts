
export function buildLandingSlideImages(page: {
  image?: string
  galleryImages?: string[]
}): string[] {
  const primary = page.image?.trim()
  const gallery = page.galleryImages?.map((src) => src.trim()).filter(Boolean) ?? []
  const combined = [...(primary ? [primary] : []), ...gallery.filter((src) => src !== primary)]
  return [...new Set(combined)]
}
