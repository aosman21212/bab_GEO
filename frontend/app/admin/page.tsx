'use client'

import { useEffect, useState } from 'react'
import Image from '@/components/app-image'
import { useRouter } from 'next/navigation'
import { useAdminLocale } from '@/components/admin-locale-provider'
import { withBasePath } from '@/lib/base-path'

export default function AdminLoginPage() {
  const router = useRouter()
  const { t, uiLocale, setUiLocale } = useAdminLocale()
  const [sessionExpired, setSessionExpired] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const idle = new URLSearchParams(window.location.search).get('reason') === 'idle'
    setSessionExpired(idle)
    // Always require a fresh email + password (no default / autofill leftovers).
    setEmail('')
    setPassword('')
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    const res = await fetch(withBasePath('/api/admin/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    setPending(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || t('login.failed'))
      return
    }
    router.push('/admin/dashboard')
  }

  return (
    <main className="admin-theme relative flex min-h-screen items-center justify-center overflow-hidden bg-[color:var(--admin-sidebar)] px-4">
      <div className="pointer-events-none absolute -start-20 -top-20 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -end-16 h-80 w-80 rounded-full bg-brand-indigo/40 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white p-8 shadow-xl shadow-black/20">
        <div className="absolute end-4 top-4">
          <select
            className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-navy outline-none focus:border-primary"
            value={uiLocale}
            onChange={(e) => setUiLocale(e.target.value as 'en' | 'ar')}
            aria-label={t('language')}
          >
            <option value="en">{t('english')}</option>
            <option value="ar">{t('arabic')}</option>
          </select>
        </div>

        <Image
          src="/images/logo-bab-full.png"
          alt="BAB"
          width={180}
          height={56}
          className="h-12 w-auto"
          unoptimized
        />
        <h1 className="mt-6 text-2xl font-extrabold text-navy">{t('login.title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('login.subtitle')}</p>
        {sessionExpired ? (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {t('login.sessionExpired')}
          </p>
        ) : null}

        <form
          onSubmit={onSubmit}
          className="mt-8 flex flex-col gap-4"
          autoComplete="off"
        >
          <label className="flex flex-col gap-1.5 text-sm font-medium text-navy">
            {t('common.email')}
            <input
              className="rounded-xl border border-border bg-[#f6f5fb] px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              type="email"
              name="admin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-navy">
            {t('login.password')}
            <input
              className="rounded-xl border border-border bg-[#f6f5fb] px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              type="password"
              name="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {pending ? t('login.signingIn') : t('login.signIn')}
          </button>
        </form>
      </div>
    </main>
  )
}
