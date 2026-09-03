'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ADMIN_SESSION_IDLE_MS } from '@/lib/admin-session'
import { withBasePath } from '@/lib/base-path'

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const

function isLoginPage(pathname: string) {
  return pathname === '/admin' || pathname.endsWith('/admin')
}

/**
 * Client idle logout (UX). Server-side enforcement is JWT expiry + Redis session denylist
 * on logout (admin-security-findings #1 / #4). Hidden-tab time counts toward idle.
 */
export function AdminSessionGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastActivityAt = useRef(Date.now())

  useEffect(() => {
    if (isLoginPage(pathname)) return

    const logout = async () => {
      try {
        await fetch(withBasePath('/api/admin/logout'), { method: 'POST' })
      } catch {
        /* still redirect to login */
      }
      router.push('/admin?reason=idle')
    }

    const schedule = (delayMs: number) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        void logout()
      }, delayMs)
    }

    const markActivity = () => {
      lastActivityAt.current = Date.now()
      schedule(ADMIN_SESSION_IDLE_MS)
    }

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return
      const elapsed = Date.now() - lastActivityAt.current
      if (elapsed >= ADMIN_SESSION_IDLE_MS) {
        void logout()
        return
      }
      schedule(ADMIN_SESSION_IDLE_MS - elapsed)
    }

    lastActivityAt.current = Date.now()
    schedule(ADMIN_SESSION_IDLE_MS)

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, markActivity, { passive: true })
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, markActivity)
      }
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [pathname, router])

  return children
}
