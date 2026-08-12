'use client'

import { motion } from 'motion/react'
import { usePrefersReducedMotion } from './motion-utils'

/** Decorative circuit / arc / dot field behind the hero — not over media. */
export function HeroMotionBg() {
  const reduced = usePrefersReducedMotion()

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Soft brand washes */}
      <div className="absolute -start-24 -top-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -end-20 top-1/3 h-80 w-80 rounded-full bg-[color:var(--brand-indigo)]/10 blur-3xl" />
      <div className="absolute bottom-0 start-1/3 h-56 w-56 rounded-full bg-navy/5 blur-3xl" />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.55]"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Circuit-adjacent paths */}
        <path
          d="M80 120 H220 V280 H360"
          stroke="#f37021"
          strokeWidth="1.25"
          strokeOpacity="0.35"
          strokeLinecap="square"
        />
        <path
          d="M360 280 H480 V400 H620"
          stroke="#373689"
          strokeWidth="1.25"
          strokeOpacity="0.3"
          strokeLinecap="square"
        />
        <path
          d="M980 80 V200 H860 V320 H740"
          stroke="#1d253d"
          strokeWidth="1.25"
          strokeOpacity="0.2"
          strokeLinecap="square"
        />
        <path
          d="M100 620 H260 V520 H400 V640"
          stroke="#373689"
          strokeWidth="1.25"
          strokeOpacity="0.25"
          strokeLinecap="square"
        />
        <path
          d="M900 560 H1040 V680 H1120"
          stroke="#f37021"
          strokeWidth="1.25"
          strokeOpacity="0.28"
          strokeLinecap="square"
        />

        {/* Nodes on circuit */}
        {[
          [220, 120],
          [360, 280],
          [480, 280],
          [620, 400],
          [860, 200],
          [740, 320],
          [260, 620],
          [400, 520],
          [1040, 560],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={3.5}
            fill={i % 2 === 0 ? '#f37021' : '#373689'}
            fillOpacity="0.45"
          />
        ))}

        {/* Arcs */}
        <circle
          cx="1050"
          cy="160"
          r="90"
          stroke="#f37021"
          strokeWidth="1"
          strokeOpacity="0.22"
          strokeDasharray="4 10"
        />
        <circle
          cx="160"
          cy="520"
          r="70"
          stroke="#373689"
          strokeWidth="1"
          strokeOpacity="0.2"
          strokeDasharray="3 8"
        />
      </svg>

      {!reduced ? (
        <>
          {/* Drifting dots */}
          {[
            { x: '12%', y: '22%', delay: 0, color: '#f37021' },
            { x: '78%', y: '18%', delay: 0.4, color: '#373689' },
            { x: '88%', y: '62%', delay: 0.8, color: '#f37021' },
            { x: '18%', y: '70%', delay: 1.2, color: '#373689' },
            { x: '45%', y: '12%', delay: 0.6, color: '#1d253d' },
            { x: '55%', y: '78%', delay: 1.5, color: '#f37021' },
          ].map((dot, i) => (
            <motion.span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full"
              style={{ left: dot.x, top: dot.y, backgroundColor: dot.color, opacity: 0.4 }}
              animate={{ y: [0, -14, 0], opacity: [0.25, 0.55, 0.25] }}
              transition={{
                duration: 5 + i * 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: dot.delay,
              }}
            />
          ))}

          {/* Slow rotating arcs */}
          <motion.div
            className="absolute -end-8 top-8 h-48 w-48 rounded-full border border-dashed border-primary/25"
            animate={{ rotate: 360 }}
            transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute -start-10 bottom-16 h-40 w-40 rounded-full border border-dashed border-[color:var(--brand-indigo)]/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 56, repeat: Infinity, ease: 'linear' }}
          />
        </>
      ) : null}
    </div>
  )
}
