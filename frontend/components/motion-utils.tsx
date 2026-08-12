'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { animate, motion, useInView } from 'motion/react'

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return reduced
}

export const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const } },
  whileTap: { scale: 0.98 },
} as const

export function HoverLift({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div className={className} {...hoverLift}>
      {children}
    </motion.div>
  )
}

/** Count from 0 → target once in view; shows final value immediately if reduced motion. */
export function CountUp({
  to,
  className,
  duration = 1.25,
}: {
  to: number
  className?: string
  duration?: number
}) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(reduced ? to : 0)

  useEffect(() => {
    if (reduced) {
      setDisplay(to)
      return
    }
    if (!inView) return

    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })

    return () => controls.stop()
  }, [inView, to, reduced, duration])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
