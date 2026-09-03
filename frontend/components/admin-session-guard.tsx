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
 * Client idle logout (UX). Server-side enforcement is the short-lived JWT + cookie maxAge
 * (see admin-security-findings #1 / #4): tokens expire ~20m even if this timer never runs.
 */
export function AdminSessionGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        void logout()
      }, ADMIN_SESSION_IDLE_MS)
    }

    const onVisibility = () => {
      // Pausing the tab still counts toward idle; resume resets when the user returns.
      if (document.visibilityState === 'visible') resetTimer()
    }

    resetTimer()

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true })
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer)
      }
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [pathname, router])

  return children
}
