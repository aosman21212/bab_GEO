import type { ReactNode } from 'react'

export function adminFieldClass() {
  return 'w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-navy outline-none transition focus:border-primary focus:bg-white'
}

/** @deprecated Prefer adminFieldClass — kept as fieldClass for drop-in imports */
export function fieldClass() {
  return adminFieldClass()
}

export function AdminFormCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-extrabold text-navy">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}

export function AdminFormLabel({
  label,
  children,
  dir,
}: {
  label: string
  children: ReactNode
  dir?: 'ltr' | 'rtl'
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy" dir={dir}>
      {label}
      {children}
    </label>
  )
}
