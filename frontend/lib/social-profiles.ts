/** Public social profiles used in footer + Organization sameAs; editable in Admin → Site Settings → Contact */
export const SOCIAL_NETWORKS = [
  {
    key: 'socialFacebook',
    label: 'Facebook',
    defaultUrl: 'https://www.facebook.com/profile.php?id=100086215290185',
  },
  {
    key: 'socialYoutube',
    label: 'YouTube',
    defaultUrl: 'https://www.youtube.com/channel/UCUMxO0j0IZdnLLRd1QUa6Zw',
  },
  {
    key: 'socialLinkedin',
    label: 'LinkedIn',
    defaultUrl: 'https://www.linkedin.com/company/bab-international-corp-for-specialized-services',
  },
  { key: 'socialX', label: 'X', defaultUrl: 'https://x.com/babportal' },
  { key: 'socialInstagram', label: 'Instagram', defaultUrl: 'https://www.instagram.com/bab.portal/' },
] as const

export type SocialKey = (typeof SOCIAL_NETWORKS)[number]['key']

export type SocialSettings = Partial<Record<SocialKey, string>>

/** A key saved as an empty string hides that network; a missing key falls back to the default URL. */
export function resolveSocialLinks(settings?: SocialSettings | null) {
  return SOCIAL_NETWORKS.map((network) => ({
    key: network.key,
    label: network.label,
    href: (settings?.[network.key] ?? network.defaultUrl).trim(),
  })).filter((link) => /^https?:\/\//i.test(link.href))
}
