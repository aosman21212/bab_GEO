'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminShell } from '@/components/admin-shell'
import { useAdminLocale } from '@/components/admin-locale-provider'
import { Activity, Pencil, Trash2, Users } from 'lucide-react'
import { withBasePath } from '@/lib/base-path'

type AdminUser = {
  _id: string
  email: string
  role: string
  createdAt?: string
}

type LoginActivityRow = {
  _id: string
  email: string
  ip: string
  userAgent: string
  city: string
  country: string
  createdAt?: string
}

type FormState = {
  email: string
  password: string
}

type Tab = 'users' | 'activity'

const emptyForm: FormState = { email: '', password: '' }

function fieldClass() {
  return 'w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-navy outline-none transition focus:border-primary focus:bg-white'
}

function shortUserAgent(ua: string): string {
  const value = ua.trim()
  if (!value) return '—'
  if (value.length <= 72) return value
  return `${value.slice(0, 69)}…`
}

function formatLocation(city: string, country: string): string {
  const parts = [city.trim(), country.trim()].filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { t } = useAdminLocale()
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [activity, setActivity] = useState<LoginActivityRow[]>([])
  const [activityLoaded, setActivityLoaded] = useState(false)
  const [meId, setMeId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const loadUsers = async () => {
    const [usersRes, meRes] = await Promise.all([
      fetch(withBasePath('/api/admin/proxy/users')),
      fetch(withBasePath('/api/admin/proxy/auth/me')),
    ])
    if (usersRes.status === 401 || meRes.status === 401) {
      router.push('/admin')
      return
    }
    if (usersRes.ok) {
      setUsers((await usersRes.json()) as AdminUser[])
    }
    if (meRes.ok) {
      const me = (await meRes.json()) as { id: string }
      setMeId(me.id)
    }
  }

  const loadActivity = async () => {
    const res = await fetch(withBasePath('/api/admin/proxy/users/activity'))
    if (res.status === 401) {
      router.push('/admin')
      return
    }
    if (!res.ok) {
      setStatus(t('users.activityLoadFailed'))
      setActivityLoaded(true)
      return
    }
    setActivity((await res.json()) as LoginActivityRow[])
    setActivityLoaded(true)
  }

  useEffect(() => {
    loadUsers()
  }, [router])

  useEffect(() => {
    if (tab === 'activity' && !activityLoaded) {
      void loadActivity()
    }
  }, [tab, activityLoaded, router])

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setStatus(null)
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setStatus(null)
  }

  const startEdit = (user: AdminUser) => {
    setEditingId(user._id)
    setForm({ email: user.email, password: '' })
    setStatus(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email.trim()) {
      setStatus(t('users.emailRequired'))
      return
    }
    if (!editingId && form.password.length < 8) {
      setStatus(t('users.passwordMin'))
      return
    }
    if (editingId && form.password && form.password.length < 8) {
      setStatus(t('users.passwordMin'))
      return
    }

    setPending(true)
    setStatus(null)

    const payload: { email: string; password?: string } = {
      email: form.email.trim().toLowerCase(),
    }
    if (form.password) payload.password = form.password

    const res = await fetch(
      editingId ? withBasePath(`/api/admin/proxy/users/${editingId}`) : withBasePath('/api/admin/proxy/users'),
      {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingId
            ? {
                email: payload.email,
                ...(payload.password ? { password: payload.password } : {}),
              }
            : { email: payload.email, password: form.password },
        ),
      },
    )
    setPending(false)

    if (res.status === 409) {
      setStatus(t('users.emailInUse'))
      return
    }
    if (!res.ok) {
      setStatus(t('common.saveFailed'))
      return
    }

    setStatus(editingId ? t('common.updated') : t('common.added'))
    resetForm()
    await loadUsers()
  }

  const remove = async (user: AdminUser) => {
    if (user._id === meId) {
      setStatus(t('users.cannotDeleteSelf'))
      return
    }
    if (users.length <= 1) {
      setStatus(t('users.cannotDeleteLast'))
      return
    }
    if (!confirm(t('users.deleteConfirm'))) return

    const res = await fetch(withBasePath(`/api/admin/proxy/users/${user._id}`), { method: 'DELETE' })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (data.error?.includes('own')) setStatus(t('users.cannotDeleteSelf'))
      else if (data.error?.includes('last')) setStatus(t('users.cannotDeleteLast'))
      else setStatus(t('common.saveFailed'))
      return
    }
    if (editingId === user._id) resetForm()
    setStatus(t('users.deleted'))
    await loadUsers()
  }

  return (
    <AdminShell title={t('users.title')} description={t('users.description')}>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab('users')}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === 'users'
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-white text-navy hover:border-primary hover:text-primary'
          }`}
        >
          <Users className="h-4 w-4" />
          {t('users.tabUsers')}
        </button>
        <button
          type="button"
          onClick={() => setTab('activity')}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === 'activity'
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-white text-navy hover:border-primary hover:text-primary'
          }`}
        >
          <Activity className="h-4 w-4" />
          {t('users.tabActivity')}
        </button>
      </div>

      {tab === 'users' ? (
        <>
          <form
            onSubmit={save}
            className="mb-6 grid gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm sm:grid-cols-2"
          >
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
              {t('common.email')}
              <input
                className={fieldClass()}
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                required
                autoComplete="off"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
              {editingId ? t('users.newPassword') : t('login.password')}
              <input
                className={fieldClass()}
                type="password"
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                required={!editingId}
                minLength={editingId ? undefined : 8}
                autoComplete="new-password"
                placeholder={editingId ? t('users.passwordOptional') : undefined}
              />
            </label>

            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              {status ? <span className="text-sm text-muted-foreground">{status}</span> : null}
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {pending
                  ? t('common.saving')
                  : editingId
                    ? t('users.updateUser')
                    : t('users.addUser')}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-navy"
                >
                  {t('common.cancelEdit')}
                </button>
              ) : null}
            </div>
          </form>

          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-start text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t('common.email')}</th>
                    <th className="px-4 py-3 font-semibold">{t('users.role')}</th>
                    <th className="px-4 py-3 font-semibold">{t('common.date')}</th>
                    <th className="px-4 py-3 text-end font-semibold">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                        <Users className="mx-auto mb-2 h-8 w-8 opacity-40" />
                        {t('users.empty')}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="border-t border-border">
                        <td className="px-4 py-3 font-semibold text-navy">
                          {user.email}
                          {user._id === meId ? (
                            <span className="ms-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                              {t('users.you')}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 capitalize text-muted-foreground">{user.role}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(user)}
                              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy hover:border-primary hover:text-primary"
                            >
                              <Pencil className="h-3.5 w-3.5" /> {t('common.edit')}
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(user)}
                              disabled={user._id === meId || users.length <= 1}
                              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-red-600 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> {t('common.delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-start text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t('common.email')}</th>
                  <th className="px-4 py-3 font-semibold">{t('users.activityIp')}</th>
                  <th className="px-4 py-3 font-semibold">{t('users.activityLocation')}</th>
                  <th className="px-4 py-3 font-semibold">{t('users.activityDevice')}</th>
                  <th className="px-4 py-3 font-semibold">{t('users.activityTime')}</th>
                </tr>
              </thead>
              <tbody>
                {!activityLoaded ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      {t('common.saving')}
                    </td>
                  </tr>
                ) : activity.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      <Activity className="mx-auto mb-2 h-8 w-8 opacity-40" />
                      {t('users.activityEmpty')}
                    </td>
                  </tr>
                ) : (
                  activity.map((row) => (
                    <tr key={row._id} className="border-t border-border">
                      <td className="px-4 py-3 font-semibold text-navy">{row.email}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {row.ip || '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatLocation(row.city, row.country)}
                      </td>
                      <td
                        className="max-w-[280px] truncate px-4 py-3 text-xs text-muted-foreground"
                        title={row.userAgent || undefined}
                      >
                        {shortUserAgent(row.userAgent)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
