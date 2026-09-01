import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/geo-content'

/** Paths AI/search crawlers should skip (admin + API). Relative to base path when robots.txt is served under a subpath. */
const disallow = ['/admin', '/api/'] as const

/** Major LLM / AI-search crawler tokens — explicit Allow for GEO visibility. */
const aiUserAgents = [
  // OpenAI
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  // Anthropic
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // DeepSeek
  'DeepSeekBot',
  // Google / Gemini
  'Google-Extended',
  'GoogleOther',
  'Google-CloudVertexBot',
  'Gemini-Deep-Research',
  // Microsoft / Copilot
  'Bingbot',
  'MicrosoftPreview',
  // Apple
  'Applebot-Extended',
  // Meta
  'FacebookBot',
  'meta-externalagent',
  'meta-externalfetcher',
  // Amazon
  'Amazonbot',
  // Cohere
  'cohere-ai',
  // You.com
  'YouBot',
  // Mistral
  'MistralAI-User',
  // xAI / Grok
  'Grok',
  // Common Crawl / others
  'CCBot',
  'Bytespider',
  'Diffbot',
  'DuckAssistBot',
  'AI2Bot',
  'PhindBot',
] as const

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl()
  const shared = {
    allow: '/' as const,
    disallow: [...disallow],
  }

  return {
    rules: [
      { userAgent: '*', ...shared },
      ...aiUserAgents.map((userAgent) => ({ userAgent, ...shared })),
    ],
    sitemap: `${site}/sitemap.xml`,
    host: new URL(site).host,
  }
}
