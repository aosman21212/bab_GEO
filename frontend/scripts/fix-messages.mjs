import fs from 'fs'

for (const locale of ['en', 'ar']) {
  const p = `messages/${locale}.json`
  const data = JSON.parse(fs.readFileSync(p, 'utf8'))

  data.channels = {
    ...data.channels,
    titleBefore: data.channels.titleBefore ?? (locale === 'en' ? 'Your' : ''),
    titleAccent: data.channels.titleAccent ?? (locale === 'en' ? 'customers' : 'عملائك'),
    titleAfter: data.channels.titleAfter ?? (locale === 'en' ? '.' : '!'),
    titleLine2: data.channels.titleLine2 ?? (locale === 'en' ? 'Their Channels.' : 'قنواتهم.'),
  }

  data.testimonials = {
    title: data.testimonials?.title ?? (locale === 'en' ? 'What Our Clients Say' : 'آراء عملائنا'),
    titleBefore: data.testimonials?.titleBefore ?? (locale === 'en' ? 'What Our' : 'آراء'),
    titleAccent: data.testimonials?.titleAccent ?? (locale === 'en' ? 'Clients' : 'عملائنا'),
    titleAfter: data.testimonials?.titleAfter ?? (locale === 'en' ? 'Say' : ''),
  }

  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(locale, 'OK', data.channels.titleBefore, data.channels.titleAccent)
}
