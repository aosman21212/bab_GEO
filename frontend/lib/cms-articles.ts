import type { Locale } from '@/i18n/routing'
import { fetchPublishedCards, type PublishedCard } from '@/lib/cms-published-cards'

export type ArticleCard = PublishedCard

/** Published CMS articles for the Articles / مقالات listing. */
export async function fetchArticles(locale: Locale, timeoutMs = 4000): Promise<ArticleCard[]> {
  return fetchPublishedCards(locale, 'article', timeoutMs)
}
