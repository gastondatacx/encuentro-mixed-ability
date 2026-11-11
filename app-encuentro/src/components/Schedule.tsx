"use client"

import { useEffect, useMemo, useState } from "react"
import { PartyPopper } from "lucide-react"
import { schedule } from "@/data/encuentro"
import { SectionHeading } from "@/components/SectionHeading"
import { useNow } from "@/lib/use-now"
import { cn, defaultDayId, statusOf, withTimes, type ItemStatus } from "@/lib/utils"

export function Schedule() {
  const now = useNow(30_000)
  const [dayId, setDayId] = useState(schedule[0].id)
  const [touched, setTouched] = useState(false)

  // Si el evento está en curso, abrimos automáticamente el día de hoy.
  useEffect(() => {
    if (now && !touched) setDayId(defaultDayId(now))
  }, [now, touched])

  const day = schedule.find((d) => d.id === dayId) ?? schedule[0]
  const items = useMemo(() => withTimes(day), [day])
  const statuses: ItemStatus[] = items.map((it) => (now ? statusOf(it, now) : "upcoming"))
  const nextIndex = statuses.findIndex((s) => s === "upcoming")
  const hasLive = statuses.includes("live")

  return (
    <section id="agenda" className="relative scroll-mt-16 overflow-hidden bg-ink py-20 text-white sm:py-28">
      <div
        className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-brand/50 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-grape/40 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-5">
        <SectionHeading
          eyebrow="Cronograma"
          title="Dos días a puro encuentro"
          description="Horarios de Argentina. Durante el evento vas a ver qué actividad está en curso en este momento."
          tone="dark"
        />

        {/* Selector de día */}
        <div
          role="tablist"
          aria-label="Día del evento"
          className="mb-8 grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1.5 ring-1 ring-white/10"
        >
          {schedule.map((d) => {
            const selected = d.id === day.id
            return (
              <button
                key={d.id}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`panel-${d.id}`}
                id={`tab-${d.id}`}
                onClick={() => {
                  setTouched(true)
                  setDayId(d.id)
                }}
                className={cn(
                  "flex flex-col items-start rounded-xl px-4 py-3 text-left transition-all sm:px-5",
                  selected ? "bg-white text-ink shadow-lg" : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-[0.2em]",
                    selected ? "text-brand" : "text-white/50"
                  )}
                >
                  {d.dayLabel} · {d.tag}
                </span>
                <span className="font-display text-2xl font-bold uppercase sm:text-3xl">
                  {d.weekday} {Number(d.date.slice(-2))}
                </span>
              </button>
            )
          })}
        </div>

        <div role="tabpanel" id={`panel-${day.id}`} aria-labelledby={`tab-${day.id}`}>
          <div className="mb-8">
            <h3 className="font-display text-2xl font-bold uppercase text-white sm:text-3xl">{day.title}</h3>
            <p className="text-white/60">{day.subtitle}</p>
          </div>

          <ol className="relative flex flex-col gap-3">
            {items.map((item, i) => {
              const status = statuses[i]
              const isNext = !hasLive && i === nextIndex && now !== null
              return (
                <li
                  key={`${day.id}-${item.start}`}
                  className={cn(
                    "grid grid-cols-[76px_1fr] gap-4 sm:grid-cols-[110px_1fr] sm:gap-6",
                    status === "past" && "opacity-45"
                  )}
                >
                  <div className="pt-4 text-right">
                    <p className="font-display text-2xl font-bold tabular-nums leading-none sm:text-3xl">
                      {item.start}
                    </p>
                    {item.end && (
                      <p className="mt-1 text-xs font-semibold tabular-nums text-white/50">a {item.end} hs</p>
                    )}
                  </div>

                  <div
                    className={cn(
                      "relative rounded-2xl p-5 ring-1 transition-colors",
                      item.highlight
                        ? "bg-gradient-to-br from-berry to-grape ring-white/20"
                        : status === "live"
                          ? "bg-white text-ink ring-white"
                          : "bg-white/[0.06] ring-white/10 hover:bg-white/10"
                    )}
                  >
                    {(status === "live" || isNext) && (
                      <span
                        className={cn(
                          "mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest",
                          status === "live" ? "bg-berry text-white" : "bg-sky/20 text-sky"
                        )}
                      >
                        {status === "live" && (
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                          </span>
                        )}
                        {status === "live" ? "Ahora" : "Próximo"}
                      </span>
                    )}
                    <h4 className="flex items-start gap-2 font-display text-xl font-bold uppercase leading-tight sm:text-2xl">
                      {item.highlight && <PartyPopper className="mt-0.5 h-6 w-6 shrink-0" />}
                      {item.title}
                    </h4>
                    <p
                      className={cn(
                        "mt-1 text-[15px] leading-relaxed",
                        status === "live" && !item.highlight ? "text-ink/70" : "text-white/75"
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}

