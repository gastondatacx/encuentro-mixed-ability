import {
  AlertTriangle,
  Backpack,
  Ban,
  CheckCircle2,
  CloudRain,
  HelpCircle,
  WifiOff,
} from "lucide-react"
import { faqs, packingLists, weatherAlert } from "@/data/encuentro"
import { SectionHeading } from "@/components/SectionHeading"

export function OfficialGuide() {
  return (
    <section id="guia" className="scroll-mt-16 bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Guía Oficial 9° ENMA"
          title="Info útil, recomendaciones y FAQ"
          description="Todo lo que necesitás saber antes y durante el encuentro: qué llevar, qué está permitido, precauciones por clima y preguntas frecuentes."
        />

        {/* Precauciones por lluvias + Aviso app sin señal */}
        <div className="mb-12 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-2 ring-tangerine/35 sm:p-7">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tangerine text-white">
                <CloudRain className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-tangerine">
                  Aviso climático
                </p>
                <h3 className="font-display text-2xl font-extrabold uppercase text-ink">
                  {weatherAlert.title}
                </h3>
              </div>
            </div>
            <p className="text-[15px] leading-relaxed text-ink/80">{weatherAlert.intro}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {weatherAlert.tips.map((tip) => (
                <li
                  key={tip}
                  className="rounded-full bg-paper px-3.5 py-1 text-xs font-bold text-ink"
                >
                  • {tip}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-berry/10 p-4 text-sm font-semibold text-ink">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-berry" />
              <div>
                <p className="font-bold text-berry">{weatherAlert.cancellationNote}</p>
                <p className="mt-1 font-normal text-ink/75">{weatherAlert.noticeChannel}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-3xl bg-ink p-6 text-white shadow-sm sm:p-7">
            <div>
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
                <WifiOff className="h-6 w-6" />
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky">
                Aplicación sin señal
              </p>
              <h3 className="mt-1 font-display text-2xl font-extrabold uppercase">
                Instalá la app antes de ir
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/80">
                {weatherAlert.offlineNote}
              </p>
            </div>
            <p className="rounded-2xl bg-white/10 px-4 py-3 text-xs font-semibold text-sky">
              Una vez abierta con internet, el cronograma, fixture, mapa y fichas de equipos funcionan 100% sin conexión.
            </p>
          </div>
        </div>

        {/* Qué llevo y qué no llevo */}
        <div className="mb-14">
          <h3 className="mb-5 font-display text-3xl font-extrabold uppercase text-ink">
            Qué llevo y qué no llevo
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-ink/10">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
                  <Backpack className="h-5 w-5" />
                </span>
                <h4 className="font-display text-xl font-extrabold uppercase text-ink">
                  Recomendamos traer
                </h4>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-ink/80">
                {packingLists.recommended.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-6 ring-1 ring-ink/10">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <h4 className="font-display text-xl font-extrabold uppercase text-ink">
                  Sí se puede ingresar con
                </h4>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-ink/80">
                {packingLists.allowed.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-6 ring-1 ring-ink/10">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-berry text-white">
                  <Ban className="h-5 w-5" />
                </span>
                <h4 className="font-display text-xl font-extrabold uppercase text-ink">
                  No se puede ingresar con
                </h4>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-ink/80">
                {packingLists.prohibited.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-berry" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Preguntas frecuentes */}
        <div>
          <h3 className="mb-5 font-display text-3xl font-extrabold uppercase text-ink">
            Preguntas frecuentes
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl bg-white p-5 ring-1 ring-ink/10 sm:p-6"
              >
                <h4 className="flex items-start gap-2.5 font-display text-xl font-bold uppercase text-ink">
                  <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  <span>{faq.question}</span>
                </h4>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/75">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
