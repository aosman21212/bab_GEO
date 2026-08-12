'use client'

import Image from 'next/image'
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
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <Reveal>
            <h2 className="text-3xl font-extrabold leading-tight text-navy md:text-4xl">
              {t.rich('headline', {
                accent: (chunks) => <span className="text-primary">{chunks}</span>,
                muted: (chunks) => <span className="text-muted-foreground">{chunks}</span>,
                br: () => <br />,
              })}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="leading-relaxed text-muted-foreground">{t('body')}</p>
          </Reveal>
        </div>

        <StaggerGroup className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {channelKeys.map((c) => (
            <StaggerItem
              key={c.key}
              hoverLift
              className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-muted/70 px-4 py-6"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background shadow-sm">
                <Image src={c.icon} alt="" width={32} height={32} className="h-8 w-8 object-contain" />
              </div>
              <span className="text-center text-xs font-semibold text-navy md:text-sm">{t(c.key)}</span>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
