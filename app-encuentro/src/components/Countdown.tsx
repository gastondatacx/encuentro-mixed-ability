"use client"

import { EVENT } from "@/data/encuentro"
import { useNow } from "@/lib/use-now"

const START = new Date(EVENT.startsAt)
const END = new Date(EVENT.endsAt)

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return {
    días: Math.floor(total / 86400),
    horas: Math.floor((total % 86400) / 3600),
    min: Math.floor((total % 3600) / 60),
    seg: total % 60,
  }
}

export function Countdown() {
  const now = useNow(1000)

  if (now && now >= END) {
    return (
      <p className="rounded-2xl bg-ink px-5 py-4 font-display text-xl font-bold uppercase tracking-wide text-white">
        ¡Gracias por ser parte del {EVENT.edition} Encuentro! Nos vemos en el próximo.
      </p>
    )
  }

  if (now && now >= START) {
    return (
      <a
        href="#agenda"
        className="inline-flex items-center gap-3 rounded-2xl bg-berry px-5 py-4 font-display text-xl font-bold uppercase tracking-wide text-white shadow-lg shadow-berry/30"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
        </span>
        ¡El Encuentro está en marcha! Ver qué pasa ahora
      </a>
    )
  }

  const p = parts(now ? START.getTime() - now.getTime() : 0)

  return (
    <div aria-live="off" aria-label="Cuenta regresiva para el inicio del Encuentro">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-ink/60">Faltan</p>
      <dl className="flex gap-2 sm:gap-3">
        {Object.entries(p).map(([label, value]) => (
          <div
            key={label}
            className="flex w-[72px] flex-col items-center rounded-2xl bg-ink py-3 text-white shadow-lg shadow-ink/20 sm:w-20"
          >
            <dd className="font-display text-3xl font-bold tabular-nums leading-none sm:text-4xl">
              {now ? String(value).padStart(2, "0") : "--"}
            </dd>
            <dt className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/60">
              {label}
            </dt>
          </div>
        ))}
      </dl>
    </div>
  )
}

