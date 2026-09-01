'use client'

import Image from '@/components/app-image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import {
  LayoutDashboard,
  Settings,
  FileText,
  Handshake,
  Mail,
  Eye,
  LogOut,
  Plus,
  Sparkles,
  Briefcase,
  UserRound,
  Users,
} from 'lucide-react'
import { useAdminLocale } from '@/components/admin-locale-provider'
import { withBasePath } from '@/lib/base-path'

const navItems = [
  { href: '/admin/dashboard', key: 'nav.overview', icon: LayoutDashboard },
  { href: '/admin/settings', key: 'nav.settings', icon: Settings },
  { href: '/admin/users', key: 'nav.users', icon: Users },
  { href: '/admin/geo', key: 'nav.geo', icon: Sparkles },
  { href: '/admin/library', key: 'nav.content', icon: FileText },
  { href: '/admin/partners', key: 'nav.partners', icon: Handshake },
  { href: '/admin/jobs', key: 'nav.jobs', icon: Briefcase },
  { href: '/admin/applications', key: 'nav.applications', icon: UserRound },
  { href: '/admin/inquiries', key: 'nav.contactUs', icon: Mail },
] as const

export function AdminShell({
  title,
  description,
  locale,
  onLocaleChange,
  actions,
  children,
}: {
  title: string
  description?: string
  locale?: 'en' | 'ar'
  onLocaleChange?: (locale: 'en' | 'ar') => void
  actions?: ReactNode
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { t, uiLocale, setUiLocale } = useAdminLocale()

  const logout = async () => {
    await fetch(withBasePath('/api/admin/logout'), { method: 'POST' })
    router.push('/admin')
  }

  return (
    <div className="admin-theme flex min-h-screen bg-[color:var(--background)] text-navy">
      <aside
        className="sticky top-0 flex h-screen w-64 shrink-0 flex-col text-white"
        style={{
          background:
            'linear-gradient(180deg, var(--admin-sidebar) 0%, #14142e 55%, #1f1f45 100%)',
        }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <Image
            src="/images/logo-bab-full.png"
            alt="BAB"
            width={160}
            height={48}
            className="h-10 w-auto"
            unoptimized
          />
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[color:var(--admin-sidebar-hover)] text-white'
                    : 'text-white/65 hover:bg-white/5 hover:text-white'
                }`}
              >
                {active ? (
                  <span className="absolute start-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-e-full bg-primary" />
                ) : null}
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : ''}`} />
                {t(item.key)}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-2 border-t border-white/10 p-4">
          <Link
            href="/admin/library/new"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> {t('newContent')}
          </Link>
          <a
            href={withBasePath('/')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            <Eye className="h-4 w-4" /> {t('viewLive')}
          </a>
          <button
            type="button"
            onClick={logout}
            className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> {t('signOut')}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-white/90 px-6 py-4 backdrop-blur md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] text-primary">{t('dashboard')}</p>
              <h1 className="mt-0.5 text-xl font-extrabold text-navy md:text-2xl">{title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <span className="hidden sm:inline">{t('language')}</span>
                <select
                  className="rounded-full border border-border bg-white px-3 py-2 text-sm font-medium text-navy outline-none focus:border-primary"
                  value={uiLocale}
                  onChange={(e) => setUiLocale(e.target.value as 'en' | 'ar')}
                  aria-label={t('language')}
                >
                  <option value="en">{t('english')}</option>
                  <option value="ar">{t('arabic')}</option>
                </select>
              </label>
              {onLocaleChange ? (
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span className="hidden sm:inline">{t('editingLocale')}</span>
                  <select
                    className="rounded-full border border-border bg-white px-3 py-2 text-sm font-medium text-navy outline-none focus:border-primary"
                    value={locale || 'en'}
                    onChange={(e) => onLocaleChange(e.target.value as 'en' | 'ar')}
                    aria-label={t('editingLocale')}
                  >
                    <option value="en">{t('english')}</option>
                    <option value="ar">{t('arabic')}</option>
                  </select>
                </label>
              ) : null}
              <Image
                src="/images/logo-bab-full.png"
                alt=""
                width={100}
                height={32}
                className="hidden h-8 w-auto sm:block"
                unoptimized
              />
              <a
                href={withBasePath('/')}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-navy hover:border-primary hover:text-primary"
              >
                {t('preview')}
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 md:px-8">
          {(description || actions) && (
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                {description ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                ) : null}
              </div>
              {actions}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
