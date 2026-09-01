'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ADMIN_SESSION_IDLE_MS } from '@/lib/admin-session'
import { withBasePath } from '@/lib/base-path'

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const

function isLoginPage(pathname: string) {
  return pathname === '/admin' || pathname.endsWith('/admin')
}

export function AdminSessionGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isLoginPage(pathname)) return

    const logout = async () => {
      await fetch(withBasePath('/api/admin/logout'), { method: 'POST' })
      router.push('/admin?reason=idle')
    }

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        void logout()
      }, ADMIN_SESSION_IDLE_MS)
    }

    resetTimer()

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true })
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer)
      }
    }
  }, [pathname, router])

  return children
}
