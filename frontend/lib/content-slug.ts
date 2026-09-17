const ARABIC_TO_LATIN: Record<string, string> = {
  ا: 'a',
  أ: 'a',
  إ: 'a',
  آ: 'a',
  ء: 'a',
  ب: 'b',
  ت: 't',
  ث: 'th',
  ج: 'j',
  ح: 'h',
  خ: 'kh',
  د: 'd',
  ذ: 'dh',
  ر: 'r',
  ز: 'z',
  س: 's',
  ش: 'sh',
  ص: 's',
  ض: 'd',
  ط: 't',
  ظ: 'z',
  ع: 'a',
  غ: 'gh',
  ف: 'f',
  ق: 'q',
  ك: 'k',
  ل: 'l',
  م: 'm',
  ن: 'n',
  ه: 'h',
  و: 'w',
  ي: 'y',
  ى: 'a',
  ة: 'h',
  ئ: 'y',
  ؤ: 'w',
}

function transliterateArabic(value: string) {
  return Array.from(value)
    .map((ch) => ARABIC_TO_LATIN[ch] ?? ch)
    .join('')
    .replace(/[\u064B-\u065F\u0670]/g, '')
}

export function slugifyContentTitle(value: string) {
  return transliterateArabic(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export type SlugTitleFields = {
  heroHeading?: string
  metaTitle?: string
}

export function slugFromLocalePair(primary: SlugTitleFields, secondary: SlugTitleFields) {
  const sources = [
    primary.heroHeading,
    primary.metaTitle,
    secondary.heroHeading,
    secondary.metaTitle,
  ]
  for (const source of sources) {
    const slug = slugifyContentTitle(source || '')
    if (slug) return slug
  }
  return ''
}

export function fallbackContentSlug() {
  return `content-${Date.now()}`
}
