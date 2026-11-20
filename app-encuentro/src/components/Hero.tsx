import Image from "next/image"
import { ArrowRight, CalendarDays, Camera, ExternalLink, Radio } from "lucide-react"
import { EVENT, LIVE_STREAMS, VENUE, teams } from "@/data/encuentro"
import { Countdown } from "@/components/Countdown"
import { Mosaic } from "@/components/Mosaic"
import { ShareButton } from "@/components/ShareButton"

const SPORT_COLORS = ["bg-lime", "bg-tangerine", "bg-sky"]

export function Hero() {
  const stats = [
    { value: "2", label: "días de encuentro" },
    { value: String(teams.length), label: "equipos inscriptos" },
    { value: EVENT.participants, label: "participantes" },
    { value: String(EVENT.sports.length), label: "deportes" },
  ]

  return (
    <section id="inicio" className="relative overflow-hidden pt-24 sm:pt-28">
      {/* Fondo de mosaico */}
      <Mosaic
        cols={9}
        rows={9}
        seed={21}
        fade="left"
        className="pointer-events-none absolute -right-24 top-0 h-[520px] w-[620px] opacity-25 sm:opacity-35 lg:right-0 lg:h-[640px] lg:w-[720px] lg:opacity-100"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-paper via-paper/90 to-transparent lg:via-paper/70" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-14 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:pb-20">
        <div className="flex flex-col gap-6">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand shadow-sm ring-1 ring-ink/10">
            <CalendarDays className="h-4 w-4" />
            {EVENT.datesLabel} · {VENUE.name}
          </p>

          <h1 className="font-display text-[3.4rem] font-extrabold uppercase leading-[0.88] tracking-tight text-ink sm:text-7xl lg:text-[5.5rem]">
            <span className="text-brand">{EVENT.edition}</span> Encuentro
            <br />
            Nacional
            <br />
            <span className="bg-gradient-to-r from-brand via-grape to-berry bg-clip-text text-transparent">
              Mixed Ability
            </span>
          </h1>

          <ul className="flex flex-wrap gap-2" aria-label="Deportes">
            {EVENT.sports.map((sport, i) => (
              <li
                key={sport}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-display text-lg font-bold uppercase tracking-wide text-ink ring-1 ring-ink/10"
              >
                <span className={`h-2.5 w-2.5 rotate-45 ${SPORT_COLORS[i % SPORT_COLORS.length]}`} />
                {sport}
              </li>
            ))}
          </ul>

          <Countdown />

          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href="#agenda"
              data-track-event="nav_click"
              data-track-meta='{"section":"agenda","source":"hero"}'
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 font-bold text-white shadow-lg shadow-brand/30 transition-colors hover:bg-brand-dark"
            >
              Ver cronograma
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#fotos"
              data-track-event="nav_click"
              data-track-meta='{"section":"fotos","source":"hero"}'
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-bold text-ink ring-2 ring-ink/15 transition hover:ring-ink"
            >
              <Camera className="h-5 w-5" />
              Subir fotos
            </a>
            <ShareButton
              label="Compartir app"
              className="rounded-full bg-white px-6 py-3.5 font-bold text-ink ring-2 ring-ink/15 hover:ring-ink [&>svg]:h-5 [&>svg]:w-5"
            />
          </div>

          <div className="mt-1 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/10">
            <p className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-berry">
              <span className="h-2.5 w-2.5 rounded-full bg-berry" aria-hidden="true" />
              Transmisión en vivo · YouTube Live
            </p>
            <div className="flex flex-wrap gap-2.5">
              {LIVE_STREAMS.map((stream) => (
                <a
                  key={stream.dayId}
                  href={stream.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track-event="stream_click"
                  data-track-meta={JSON.stringify({ day: stream.dayId, source: "hero" })}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white transition hover:bg-berry sm:text-sm"
                >
                  <Radio className="h-4 w-4 text-sky" />
                  {stream.shortLabel}
                  <ExternalLink className="h-3.5 w-3.5 opacity-75" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative rounded-[2rem] bg-white p-6 shadow-[0_30px_80px_-20px_rgba(11,22,64,0.45)] ring-1 ring-ink/5 sm:p-8">
            <div className="relative aspect-[1256/768] w-full">
              <Image
                src="/logo.png"
                alt={`Logo ${EVENT.edition} ${EVENT.name} ${EVENT.city} ${EVENT.year}`}
                fill
                preload
                loading="eager"
                sizes="(max-width: 1024px) 90vw, 480px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Números clave */}
      <div className="relative border-y border-ink/10 bg-white">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 divide-ink/10 px-5 sm:grid-cols-4 sm:divide-x">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center py-6 text-center">
              <dd className="font-display text-4xl font-extrabold text-brand sm:text-5xl">{s.value}</dd>
              <dt className="text-xs font-semibold uppercase tracking-widest text-ink/60">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

