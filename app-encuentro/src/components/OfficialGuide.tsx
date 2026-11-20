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
    <section id="guia" className="scroll-mt-16 border-b border-ink/10 bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Guía Oficial 9° ENMA"
          title="Info útil, recomendaciones y FAQ"
          description="Todo lo que necesitás saber antes y durante el encuentro: clima, qué llevar, qué está permitido y respuestas rápidas."
        />

        {/* Precauciones por lluvias + Aviso app sin señal */}
        <div className="grid items-stretch gap-5 lg:grid-cols-[1.35fr_1fr]">
          <div className="flex flex-col justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/10 sm:p-7">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tangerine text-white shadow-sm">
                  <CloudRain className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-tangerine">
                    Aviso climático
                  </p>
                  <h3 className="font-display text-2xl font-extrabold uppercase text-ink sm:text-3xl">
                    {weatherAlert.title}
                  </h3>
                </div>
              </div>

              <p className="text-[15px] leading-relaxed text-ink/80">{weatherAlert.intro}</p>

              <ul className="mt-4 flex flex-wrap gap-2">
                {weatherAlert.tips.map((tip) => (
                  <li
                    key={tip}
                    className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3.5 py-1.5 text-xs font-bold text-ink ring-1 ring-ink/10"
                  >
                    <Check className="h-3.5 w-3.5 text-tangerine" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-berry/10 p-4 text-sm ring-1 ring-berry/20">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-berry" />
              <div>
                <p className="font-bold text-berry">{weatherAlert.cancellationNote}</p>
                <p className="mt-1 text-ink/75">{weatherAlert.noticeChannel}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 rounded-3xl bg-ink p-6 text-white shadow-sm sm:p-7">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
                  <WifiOff className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky">
                    Aplicación sin señal
                  </p>
                  <h3 className="font-display text-2xl font-extrabold uppercase sm:text-3xl">
                    Instalá la app antes de ir
                  </h3>
                </div>
              </div>
              <p className="text-[15px] leading-relaxed text-white/80">{weatherAlert.offlineNote}</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 text-xs font-semibold leading-relaxed text-sky ring-1 ring-white/10">
              Una vez abierta con internet, el cronograma, fixture, mapa oficial y fichas de equipos funcionan 100% sin conexión.
            </div>
          </div>
        </div>

        {/* Qué llevo y qué no llevo */}
        <div className="mt-14">
          <div className="mb-6 flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Checklist</p>
            <h3 className="font-display text-3xl font-extrabold uppercase text-ink">
              Qué llevo y qué no llevo
            </h3>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Recomendamos traer */}
            <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-ink/10">
              <div className="flex items-center gap-3 border-b border-ink/10 bg-brand/5 px-6 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                  <Backpack className="h-5 w-5" />
                </span>
                <h4 className="font-display text-xl font-extrabold uppercase text-ink">
                  Recomendamos traer
                </h4>
              </div>
              <ul className="flex flex-1 flex-col gap-3 p-6 text-sm text-ink/85">
                {packingLists.recommended.map((item) => {
                  const { label, needsName } = formatRecommendedItem(item)
                  return (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span className="flex flex-wrap items-center gap-1.5 leading-snug">
                        <span>{label}</span>
                        {needsName && (
                          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand">
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
              <div className="flex items-center gap-3 border-b border-ink/10 bg-lime/10 px-6 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <h4 className="font-display text-xl font-extrabold uppercase text-ink">
                  Sí se puede ingresar con
                </h4>
              </div>
              <ul className="flex flex-1 flex-col gap-3 p-6 text-sm text-ink/85">
                {packingLists.allowed.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 leading-snug">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* No se puede ingresar */}
            <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-ink/10">
              <div className="flex items-center gap-3 border-b border-ink/10 bg-berry/10 px-6 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-berry text-white">
                  <Ban className="h-5 w-5" />
                </span>
                <h4 className="font-display text-xl font-extrabold uppercase text-ink">
                  No se puede ingresar con
                </h4>
              </div>
              <ul className="flex flex-1 flex-col gap-3 p-6 text-sm text-ink/85">
                {packingLists.prohibited.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 leading-snug">
                    <Ban className="mt-0.5 h-4 w-4 shrink-0 text-berry" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Preguntas frecuentes en acordeón */}
        <div className="mt-14">
          <div className="mb-6 flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Dudas rápidas</p>
            <h3 className="font-display text-3xl font-extrabold uppercase text-ink">
              Preguntas frecuentes
            </h3>
          </div>

          <div className="divide-y divide-ink/10 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-ink/10">
            {faqs.map((faq, idx) => {
              const open = openFaq === idx
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`faq-panel-${idx}`}
                    onClick={() => setOpenFaq(open ? null : idx)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-paper/60 sm:px-7 sm:py-5"
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-extrabold transition-colors",
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
                    <div id={`faq-panel-${idx}`} className="px-5 pb-5 pl-16 sm:px-7 sm:pb-6 sm:pl-[74px]">
                      <p className="text-[15px] leading-relaxed text-ink/75">{faq.answer}</p>
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
