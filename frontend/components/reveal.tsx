'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from './motion-utils'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  as?: 'div' | 'section' | 'span' | 'li' | 'article'
  /** Soft ken-burns scale on reveal (for image panels). */
  scaleIn?: boolean
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = 'div',
  scaleIn = false,
}: RevealProps) {
  const reduced = usePrefersReducedMotion()
  const MotionTag = motion[as]

  if (reduced) {
    return <MotionTag className={className}>{children}</MotionTag>
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, ...(scaleIn ? { scale: 1.04 } : {}) }}
      whileInView={{ opacity: 1, y: 0, ...(scaleIn ? { scale: 1 } : {}) }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  )
}

type StaggerProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function StaggerGroup({ children, className, delay = 0 }: StaggerProps) {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ staggerChildren: 0.12, delayChildren: delay }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  hoverLift = false,
}: {
  children: ReactNode
  className?: string
  hoverLift?: boolean
}) {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
      }}
      {...(hoverLift
        ? {
            whileHover: { y: -4, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
          }
        : {})}
    >
      {children}
    </motion.div>
  )
}
