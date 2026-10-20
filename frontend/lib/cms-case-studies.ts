import type { Locale } from '@/i18n/routing'
import { fetchPublishedCards, type PublishedCard } from '@/lib/cms-published-cards'

export type SuccessStoryCard = PublishedCard

/** Published CMS case studies for the Success Stories listing. */
export async function fetchSuccessStories(
  locale: Locale,
  timeoutMs = 4000,
): Promise<SuccessStoryCard[]> {
  return fetchPublishedCards(locale, 'case-study', timeoutMs)
}
