import Image from 'next/image'
import { Link } from '@/i18n/navigation'

/** Official BAB logo (orange BAB + door icon + indigo باب) */
export function BabLogo({
  className = '',
  size = 'md',
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClass =
    size === 'sm' ? 'h-7 md:h-8' : size === 'lg' ? 'h-11 md:h-12' : 'h-8 md:h-9'

  return (
    <Link
      href="/"
      aria-label="BAB International Corp home"
      className={`inline-flex shrink-0 items-center ${className}`}
    >
      <Image
        src="/images/logo-bab.png"
        alt="BAB International Corp"
        width={140}
        height={54}
        className={`${sizeClass} w-auto max-w-[140px] object-contain object-left`}
        priority
        unoptimized
      />
    </Link>
  )
}
