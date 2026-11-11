"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { EVENT, teams, type Team } from "@/data/encuentro"
import { SectionHeading } from "@/components/SectionHeading"
import { cn, normalize } from "@/lib/utils"

const FALLBACK_BG = ["bg-brand", "bg-sky", "bg-lime", "bg-tangerine", "bg-berry", "bg-grape"]

function TeamCard({ team, index }: { team: Team; index: number }) {
  const [failed, setFailed] = useState(false)

  return (
    <li className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-4 text-center ring-1 ring-ink/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(11,22,64,0.45)] hover:ring-brand/40 sm:p-5">
      <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-paper ring-4 ring-paper transition-transform duration-300 group-hover:scale-105 sm:h-24 sm:w-24">
        {!failed ? (
          // Se usa <img> para poder detectar logos faltantes y mostrar las siglas.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={team.logo}
            alt={`Escudo de ${team.name}`}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-full object-contain p-1.5"
          />
        ) : (
          <span
            aria-hidden="true"
            className={cn(
              "flex h-full w-full items-center justify-center font-display text-2xl font-bold text-white",
              FALLBACK_BG[index % FALLBACK_BG.length]
            )}
          >
            {team.initials}
          </span>
        )}
      </div>
      <h3 className="font-display text-base font-bold uppercase leading-tight text-ink sm:text-lg">
        {team.name}
      </h3>
    </li>
  )
}

export function Teams() {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = normalize(query)
    if (!q) return teams
    return teams.filter((t) => normalize(t.name).includes(q) || normalize(t.initials).includes(q))
  }, [query])

  return (
    <section id="equipos" className="scroll-mt-16 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow={`${teams.length} clubes · ${EVENT.participants} participantes`}
            title="Equipos inscriptos"
            description="Clubes de todo el país que hacen posible el Encuentro. Buscá el tuyo."
          />

          <div className="relative mb-10 w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar equipo…"
              aria-label="Buscar equipo por nombre"
              className="h-14 w-full rounded-full bg-white pl-12 pr-12 text-base text-ink shadow-sm ring-1 ring-ink/15 outline-none transition placeholder:text-ink/40 focus:ring-2 focus:ring-brand [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink/60 hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {filtered.length} equipos encontrados
        </p>

        {filtered.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((team) => (
              <TeamCard key={team.name} team={team} index={teams.indexOf(team)} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-ink/15 bg-white py-16 text-center">
            <p className="font-display text-2xl font-bold uppercase text-ink">
              Sin resultados para “{query}”
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-brand"
            >
              Ver los {teams.length} equipos
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

