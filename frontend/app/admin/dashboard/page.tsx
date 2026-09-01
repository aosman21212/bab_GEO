'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdminShell } from '@/components/admin-shell'
import { useAdminLocale } from '@/components/admin-locale-provider'
import { FileText, Handshake, Mail, Plus, Users } from 'lucide-react'
import { withBasePath } from '@/lib/base-path'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { t } = useAdminLocale()
  const [stats, setStats] = useState({
    pages: 0,
    partners: 0,
    inquiries: 0,
    newInquiries: 0,
    users: 0,
  })

  useEffect(() => {
    const load = async () => {
      const [pagesRes, partnersRes, inquiriesRes, usersRes] = await Promise.all([
        fetch(withBasePath('/api/admin/proxy/pages')),
        fetch(withBasePath('/api/admin/proxy/partners/admin/all')),
        fetch(withBasePath('/api/admin/proxy/inquiries')),
        fetch(withBasePath('/api/admin/proxy/users')),
      ])
      if (pagesRes.status === 401) {
        router.push('/admin')
        return
      }
      const pages = pagesRes.ok ? await pagesRes.json() : []
      const partners = partnersRes.ok ? await partnersRes.json() : []
      const inquiries = inquiriesRes.ok ? await inquiriesRes.json() : []
      const users = usersRes.ok ? await usersRes.json() : []
      setStats({
        pages: pages.length,
        partners: partners.length,
        inquiries: inquiries.length,
        newInquiries: inquiries.filter((i: { status: string }) => i.status === 'new').length,
        users: users.length,
      })
    }
    load()
  }, [router])

  const cards = [
    {
      label: t('overview.contentPages'),
      value: stats.pages,
      href: '/admin/library',
      icon: FileText,
    },
    {
      label: t('overview.partners'),
      value: stats.partners,
      href: '/admin/partners',
      icon: Handshake,
    },
    {
      label: t('overview.newInquiries'),
      value: stats.newInquiries,
      href: '/admin/inquiries',
      icon: Mail,
    },
    {
      label: t('overview.adminUsers'),
      value: stats.users,
      href: '/admin/users',
      icon: Users,
    },
  ]

  return (
    <AdminShell
      title={t('overview.title')}
      description={t('overview.description')}
      actions={
        <Link
          href="/admin/library/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> {t('overview.addContent')}
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-navy">{card.value}</p>
            </Link>
          )
        })}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Link
          href="/admin/settings"
          className="rounded-2xl border border-border bg-white p-6 shadow-sm hover:border-primary/40"
        >
          <h2 className="font-bold text-navy">{t('overview.siteSettings')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('overview.siteSettingsBody')}</p>
        </Link>
        <Link
          href="/admin/users"
          className="rounded-2xl border border-border bg-white p-6 shadow-sm hover:border-primary/40"
        >
          <h2 className="font-bold text-navy">{t('overview.usersTitle')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('overview.usersBody')}</p>
        </Link>
        <Link
          href="/admin/library"
          className="rounded-2xl border border-border bg-white p-6 shadow-sm hover:border-primary/40"
        >
          <h2 className="font-bold text-navy">{t('overview.contentLibrary')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('overview.contentLibraryBody')}</p>
        </Link>
      </div>
    </AdminShell>
  )
}
