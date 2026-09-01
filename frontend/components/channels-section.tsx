'use client'

import Image from '@/components/app-image'
import { useTranslations } from 'next-intl'
import { Reveal, StaggerGroup, StaggerItem } from './reveal'

const channelKeys = [
  { key: 'sms', icon: '/images/channels/sms.svg' },
  { key: 'mms', icon: '/images/channels/vector-1.svg' },
  { key: 'voice', icon: '/images/channels/vector-2.svg' },
  { key: 'liveChat', icon: '/images/channels/vector-3.svg' },
  { key: 'rcs', icon: '/images/channels/group.svg' },
  { key: 'email', icon: '/images/channels/vector-5.svg' },
  { key: 'instagram', icon: '/images/channels/group-5.svg' },
  { key: 'whatsapp', icon: '/images/channels/group-6.svg' },
  { key: 'messenger', icon: '/images/channels/group-7.svg' },
  { key: 'telegram', icon: '/images/channels/vector-7.svg' },
  { key: 'viber', icon: '/images/channels/vector-8.svg' },
  { key: 'apple', icon: '/images/channels/sms.svg' },
] as const

export function ChannelsSection() {
  const t = useTranslations('channels')

  return (
    <section id="solutions" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold leading-tight text-navy md:text-4xl lg:text-5xl">
            {t.rich('headline', {
              accent: (chunks) => <span className="text-primary">{chunks}</span>,
              muted: (chunks) => <span className="text-navy">{chunks}</span>,
              br: () => <br />,
            })}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t('body')}</p>
        </Reveal>

        <StaggerGroup className="mt-12 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 md:gap-4">
          {channelKeys.map((c) => (
            <StaggerItem
              key={c.key}
              hoverLift
              className="flex flex-col items-center justify-center gap-2.5 rounded-2xl bg-muted/50 px-3 py-5 transition-colors hover:bg-muted"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background shadow-sm md:h-14 md:w-14">
                <Image src={c.icon} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
              </div>
              <span className="text-center text-[11px] font-semibold text-navy sm:text-xs md:text-sm">
                {t(c.key)}
              </span>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
