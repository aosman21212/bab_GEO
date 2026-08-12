import { Reveal } from './reveal'

export type LegalSection = {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string
  intro: string
  sections: LegalSection[]
}) {
  return (
    <div className="flex flex-col">
      <section className="bg-secondary">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <Reveal>
            <h1 className="text-balance text-3xl font-extrabold leading-tight text-navy md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{intro}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 md:py-20">
        <div className="flex flex-col gap-10">
          {sections.map((s) => (
            <Reveal key={s.heading}>
              <h2 className="text-xl font-bold text-navy md:text-2xl">{s.heading}</h2>
              {s.paragraphs?.map((p) => (
                <p key={p} className="mt-3 leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="mt-4 flex flex-col gap-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-2 leading-relaxed text-muted-foreground">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  )
}
