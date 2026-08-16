'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Reveal } from '@/components/reveal'
import { companySitemapLinks, solutionGroups } from '@/lib/nav-tree'

function TreeBranch({ children }: { children: React.ReactNode }) {
  return (
    <ul className="ms-3 space-y-1 border-s border-navy/15 ps-4 md:ms-4 md:ps-5">{children}</ul>
  )
}

function TreeNode({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <li className={`relative py-1 ${className}`}>
      <span
        aria-hidden
        className="absolute -start-[1.05rem] top-[0.95rem] h-px w-3 bg-navy/20 md:-start-[1.3rem] md:w-4"
      />
      {children}
    </li>
  )
}

export default function SitemapPage() {
  const t = useTranslations('sitemapPage')
  const nav = useTranslations('nav')
  const footer = useTranslations('footer')

  return (
    <div className="flex flex-col bg-[linear-gradient(180deg,#f7f6fb_0%,#ffffff_45%)]">
      <section className="border-b border-border/60 bg-[linear-gradient(115deg,#1a1a3d_0%,#2a2a5c_55%,#1f1f45_100%)] pt-20 pb-12 md:pt-24 md:pb-16">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="text-[11px] font-bold tracking-[0.16em] text-primary">{t('root')}</p>
            <h1 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">{t('title')}</h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/75">{t('body')}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
        <Reveal>
          <nav aria-label={t('title')} className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-lg font-extrabold text-navy">{t('root')}</span>
            </div>

            <TreeBranch>
              <TreeNode>
                <p className="text-sm font-bold uppercase tracking-wide text-navy/70">{t('company')}</p>
                <TreeBranch>
                  {companySitemapLinks.map((item) => (
                    <TreeNode key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm font-medium text-navy transition hover:text-primary"
                      >
                        {footer(item.footerKey as 'home')}
                      </Link>
                    </TreeNode>
                  ))}
                </TreeBranch>
              </TreeNode>

              <TreeNode>
                <p className="text-sm font-bold uppercase tracking-wide text-navy/70">
                  {t('solutions')}
                </p>
                <TreeBranch>
                  {solutionGroups.map((group) => (
                    <TreeNode key={group.labelKey}>
                      <p className="text-xs font-bold tracking-[0.12em] text-primary">
                        {nav(group.labelKey as 'omnichannelGroup')}
                      </p>
                      <TreeBranch>
                        {group.items.map((item) => (
                          <TreeNode key={item.href}>
                            <Link
                              href={item.href}
                              className="text-sm font-medium text-navy transition hover:text-primary"
                            >
                              {nav(item.labelKey as 'omnichannel')}
                            </Link>
                          </TreeNode>
                        ))}
                      </TreeBranch>
                    </TreeNode>
                  ))}
                </TreeBranch>
              </TreeNode>
            </TreeBranch>
          </nav>
        </Reveal>
      </section>
    </div>
  )
}
