export type NavLink = { labelKey: string; href: string }

export type NavGroup = { labelKey: string; items: NavLink[] }

/** Solutions mega-menu groups — shared by header + HTML sitemap */
export const solutionGroups: NavGroup[] = [
  {
    labelKey: 'omnichannelGroup',
    items: [
      { labelKey: 'omnichannel', href: '/omnichannel' },
      { labelKey: 'liveEngagement', href: '/live-engagement-platform' },
      { labelKey: 'rcs', href: '/rich-communication-services' },
      { labelKey: 'socialMessaging', href: '/social-media-messaging-integration' },
    ],
  },
  {
    labelKey: 'solutionsGroup',
    items: [
      { labelKey: 'digitalTransform', href: '/digital-transformation' },
      { labelKey: 'voiceBot', href: '/voice-bot' },
      { labelKey: 'aiSolution', href: '/ai-solution' },
      { labelKey: 'callCenter', href: '/call-center' },
    ],
  },
  {
    labelKey: 'callCenterGroup',
    items: [
      { labelKey: 'foodBeverage', href: '/food-and-beverage' },
      { labelKey: 'government', href: '/government-public-sector' },
      { labelKey: 'healthcare', href: '/healthcare-solutions' },
      { labelKey: 'insurance', href: '/insurance-bpo-solutions' },
      { labelKey: 'retail', href: '/retail-support-solutions' },
    ],
  },
]

/** Company links for HTML sitemap (footer keys for labels) */
export const companySitemapLinks: { footerKey: string; href: string }[] = [
  { footerKey: 'home', href: '/' },
  { footerKey: 'about', href: '/about-us' },
  { footerKey: 'contact', href: '/contact-us' },
  { footerKey: 'privacy', href: '/privacy-policy' },
  { footerKey: 'terms', href: '/terms-conditions' },
]
