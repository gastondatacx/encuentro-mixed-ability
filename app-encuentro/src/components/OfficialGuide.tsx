"use client"

import { useState } from "react"
import {
  AlertTriangle,
  Backpack,
  Ban,
  Check,
  CheckCircle2,
  ChevronDown,
  CloudRain,
  WifiOff,
} from "lucide-react"
import { faqs, packingLists, weatherAlert } from "@/data/encuentro"
import { SectionHeading } from "@/components/SectionHeading"
import { cn } from "@/lib/utils"

function formatRecommendedItem(item: string) {
  const marker = "(CON NOMBRE)"
  if (!item.includes(marker)) return { label: item, needsName: false }
  return { label: item.replace(marker, "").trim(), needsName: true }
}

export function OfficialGuide() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <section id="guia" className="scroll-mt-16 border-b border-ink/10 bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Guía Oficial 9° ENMA"
          title="Info útil, recomendaciones y FAQ"
          description="Todo lo que necesitás saber antes y durante el encuentro: clima, qué llevar, qué está permitido y respuestas rápidas."
        />

        {/* Precauciones por lluvias + Aviso app sin señal */}
        <div className="mt-4 grid items-stretch gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
          <div className="flex flex-col justify-between gap-6 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-ink/10 sm:p-9">
            <div>
              <div className="mb-5 flex items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tangerine text-white shadow-sm">
                  <CloudRain className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-tangerine">
                    Aviso climático
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-extrabold uppercase text-ink sm:text-3xl">
                    {weatherAlert.title}
                  </h3>
                </div>
              </div>

              <p className="text-base leading-relaxed text-ink/80">{weatherAlert.intro}</p>

              <ul className="mt-5 flex flex-wrap gap-3">
                {weatherAlert.tips.map((tip) => (
                  <li
                    key={tip}
                    className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-xs font-bold text-ink ring-1 ring-ink/10"
                  >
                    <Check className="h-3.5 w-3.5 text-tangerine" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl bg-berry/10 p-5 text-sm ring-1 ring-berry/20">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-berry" />
              <div className="space-y-2 leading-relaxed">
                <p className="font-bold text-berry">{weatherAlert.cancellationNote}</p>
                <p className="text-ink/75">{weatherAlert.noticeChannel}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 rounded-3xl bg-ink p-7 text-white shadow-sm sm:p-9">
            <div>
              <div className="mb-5 flex items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
                  <WifiOff className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky">
                    Aplicación sin señal
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-extrabold uppercase sm:text-3xl">
                    Instalá la app antes de ir
                  </h3>
                </div>
              </div>
              <p className="text-base leading-relaxed text-white/80">{weatherAlert.offlineNote}</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 text-xs font-semibold leading-relaxed text-sky ring-1 ring-white/10">
              Una vez abierta con internet, el cronograma, fixture, mapa oficial y fichas de equipos funcionan 100% sin conexión.
            </div>
          </div>
        </div>

        {/* Qué llevo y qué no llevo */}
        <div className="mt-20 sm:mt-24">
          <div className="mb-8 flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Checklist</p>
            <h3 className="font-display text-3xl font-extrabold uppercase text-ink sm:text-4xl">
              Qué llevo y qué no llevo
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
            {/* Recomendamos traer */}
            <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-ink/10">
              <div className="flex items-center gap-3.5 border-b border-ink/10 bg-brand/5 px-7 py-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                  <Backpack className="h-5 w-5" />
                </span>
                <h4 className="font-display text-xl font-extrabold uppercase text-ink">
                  Recomendamos traer
                </h4>
              </div>
              <ul className="flex flex-1 flex-col gap-4 p-7 text-[15px] leading-relaxed text-ink/85">
                {packingLists.recommended.map((item) => {
                  const { label, needsName } = formatRecommendedItem(item)
                  return (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-brand" />
                      <span className="flex flex-wrap items-center gap-2">
                        <span>{label}</span>
                        {needsName && (
                          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand">
                            Con nombre
                          </span>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Sí se puede ingresar */}
            <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-ink/10">
              <div className="flex items-center gap-3.5 border-b border-ink/10 bg-lime/10 px-7 py-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <h4 className="font-display text-xl font-extrabold uppercase text-ink">
                  Sí se puede ingresar con
                </h4>
              </div>
              <ul className="flex flex-1 flex-col gap-4 p-7 text-[15px] leading-relaxed text-ink/85">
                {packingLists.allowed.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-lime" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* No se puede ingresar */}
            <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-ink/10">
              <div className="flex items-center gap-3.5 border-b border-ink/10 bg-berry/10 px-7 py-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-berry text-white">
                  <Ban className="h-5 w-5" />
                </span>
                <h4 className="font-display text-xl font-extrabold uppercase text-ink">
                  No se puede ingresar con
                </h4>
              </div>
              <ul className="flex flex-1 flex-col gap-4 p-7 text-[15px] leading-relaxed text-ink/85">
                {packingLists.prohibited.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Ban className="mt-1 h-4 w-4 shrink-0 text-berry" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Preguntas frecuentes en acordeón */}
        <div className="mt-20 sm:mt-24">
          <div className="mb-8 flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Dudas rápidas</p>
            <h3 className="font-display text-3xl font-extrabold uppercase text-ink sm:text-4xl">
              Preguntas frecuentes
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => {
              const open = openFaq === idx
              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/10"
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`faq-panel-${idx}`}
                    onClick={() => setOpenFaq(open ? null : idx)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left transition hover:bg-paper/50 sm:p-6"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-base font-extrabold transition-colors",
                          open ? "bg-brand text-white" : "bg-paper text-brand"
                        )}
                      >
                        {idx + 1}
                      </span>
                      <h4 className="font-display text-xl font-bold uppercase text-ink sm:text-2xl">
                        {faq.question}
                      </h4>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-brand transition-transform duration-200",
                        open && "rotate-180"
                      )}
                    />
                  </button>

                  {open && (
                    <div
                      id={`faq-panel-${idx}`}
                      className="mx-5 border-t border-ink/10 pb-6 pt-4 sm:mx-6"
                    >
                      <p className="text-base leading-relaxed text-ink/75 sm:pl-[52px]">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
