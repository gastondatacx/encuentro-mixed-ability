"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowRight, Calendar, ChevronDown, Clock, Info, MapPin, Search, X } from "lucide-react"
import {
  fixtureCategoryA,
  fixtureCategoryB,
  fixtureHockey,
  fixtureMeta,
  hockeyFixtureMeta,
  hockeyZones,
  rugbyZones,
  type HockeyMatchCell,
} from "@/data/encuentro"
import { SectionHeading } from "@/components/SectionHeading"
import { trackEvent } from "@/lib/analytics"
import { cn, normalize } from "@/lib/utils"

type SportTab = "rugby" | "hockey"
type CategoryFilter = "all" | "A" | "B"
type BlockFilter = "all" | "manana" | "tarde"
type CourtFilter = "all" | "1" | "4" | "2a" | "2b" | "3a" | "3b"
type HockeyZoneFilter = "all" | "proyeccion" | "desarrollo"
type HockeyCourtFilter = "all" | "1" | "2" | "3"

const COURT_PILLS: Array<{ id: CourtFilter; label: string; cat: "A" | "B" | "all" }> = [
  { id: "all", label: "Todas", cat: "all" },
  { id: "1", label: "Cancha 1", cat: "A" },
  { id: "4", label: "Cancha 4", cat: "A" },
  { id: "2a", label: "Cancha 2a", cat: "B" },
  { id: "2b", label: "Cancha 2b", cat: "B" },
  { id: "3a", label: "Cancha 3a", cat: "B" },
  { id: "3b", label: "Cancha 3b", cat: "B" },
]

const HOCKEY_COURT_PILLS: Array<{ id: HockeyCourtFilter; label: string }> = [
  { id: "all", label: "Todas" },
  { id: "1", label: "Cancha 1" },
  { id: "2", label: "Cancha 2" },
  { id: "3", label: "Cancha 3" },
]

export function Fixture() {
  const [sport, setSport] = useState<SportTab>("rugby")
  const [category, setCategory] = useState<CategoryFilter>("all")
  const [blockFilter, setBlockFilter] = useState<BlockFilter>("all")
  const [court, setCourt] = useState<CourtFilter>("all")
  const [hockeyZone, setHockeyZone] = useState<HockeyZoneFilter>("all")
  const [hockeyCourt, setHockeyCourt] = useState<HockeyCourtFilter>("all")
  const [showRugbyZones, setShowRugbyZones] = useState(false)
  const [showHockeyZones, setShowHockeyZones] = useState(false)
  const [query, setQuery] = useState("")
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(["cat-a-manana", "hockey-manana"])
  )
  const lastTrackedQuery = useRef("")

  const q = normalize(query)

  useEffect(() => {
    if (q.length < 3 || q === lastTrackedQuery.current) return
    const t = window.setTimeout(() => {
      lastTrackedQuery.current = q
      trackEvent("fixture_search", { query: q })
    }, 900)
    return () => window.clearTimeout(t)
  }, [q])

  const autoExpand =
    sport === "rugby"
      ? Boolean(q) || blockFilter !== "all" || court !== "all"
      : Boolean(q) || blockFilter !== "all" || hockeyZone !== "all" || hockeyCourt !== "all"

  const showCatA = category !== "B" && (court === "all" || court === "1" || court === "4")
  const showCatB =
    category !== "A" &&
    (court === "all" || court === "2a" || court === "2b" || court === "3a" || court === "3b")

  const matchesBlockTime = (title: string) => {
    if (blockFilter === "all") return true
    const norm = normalize(title)
    return blockFilter === "manana" ? norm.includes("manana") : norm.includes("tarde")
  }

  const filteredBlocksA = useMemo(() => {
    if (!showCatA) return []
    return fixtureCategoryA
      .filter((block) => matchesBlockTime(block.title))
      .map((block) => ({
        ...block,
        slots: block.slots.filter((slot) => {
          const matchC1 =
            (court === "all" || court === "1") && (!q || normalize(slot.cancha1).includes(q))
          const matchC4 =
            (court === "all" || court === "4") && (!q || normalize(slot.cancha4).includes(q))
          return matchC1 || matchC4
        }),
      }))
      .filter((b) => b.slots.length > 0)
  }, [showCatA, blockFilter, court, q])

  const filteredRoundsB = useMemo(() => {
    if (!showCatB) return []
    return fixtureCategoryB
      .filter((round) => matchesBlockTime(round.title))
      .map((round) => ({
        ...round,
        slots: round.slots.filter((slot) => {
          const checks: Array<[CourtFilter, string]> = [
            ["2a", slot.cancha2a],
            ["2b", slot.cancha2b],
            ["3a", slot.cancha3a],
            ["3b", slot.cancha3b],
          ]
          return checks.some(
            ([cid, matchText]) =>
              (court === "all" || court === cid) && (!q || normalize(matchText).includes(q))
          )
        }),
      }))
      .filter((r) => r.slots.length > 0)
  }, [showCatB, blockFilter, court, q])

  const filteredHockeyBlocks = useMemo(() => {
    return fixtureHockey
      .filter((block) => blockFilter === "all" || block.block === blockFilter)
      .map((block) => ({
        ...block,
        slots: block.slots
          .map((slot) => {
            const entries: Array<{
              id: Exclude<HockeyCourtFilter, "all">
              label: string
              defaultSub: string
              cell: HockeyMatchCell
            }> = [
              { id: "1", label: "Cancha 1", defaultSub: "Proyección", cell: slot.cancha1 },
              { id: "2", label: "Cancha 2", defaultSub: "Desarrollo 1", cell: slot.cancha2 },
              { id: "3", label: "Cancha 3", defaultSub: "Desarrollo 2", cell: slot.cancha3 },
            ]

            const visibleEntries = entries.filter((entry) => {
              if (hockeyCourt !== "all" && hockeyCourt !== entry.id) return false
              if (hockeyZone !== "all" && entry.cell.category !== hockeyZone) return false
              if (q && !normalize(entry.cell.match).includes(q)) return false
              return true
            })

            return { time: slot.time, entries: visibleEntries }
          })
          .filter((slot) => slot.entries.length > 0),
      }))
      .filter((b) => b.slots.length > 0)
  }, [blockFilter, hockeyZone, hockeyCourt, q])

  const crossSportMatches = useMemo(() => {
    if (!q) return { rugby: 0, hockey: 0 }
    let rugby = 0
    for (const block of fixtureCategoryA) {
      for (const slot of block.slots) {
        if (normalize(slot.cancha1).includes(q)) rugby++
        if (normalize(slot.cancha4).includes(q)) rugby++
      }
    }
    for (const round of fixtureCategoryB) {
      for (const slot of round.slots) {
        if (normalize(slot.cancha2a).includes(q)) rugby++
        if (normalize(slot.cancha2b).includes(q)) rugby++
        if (normalize(slot.cancha3a).includes(q)) rugby++
        if (normalize(slot.cancha3b).includes(q)) rugby++
      }
    }
    let hockey = 0
    for (const block of fixtureHockey) {
      for (const slot of block.slots) {
        if (normalize(slot.cancha1.match).includes(q)) hockey++
        if (normalize(slot.cancha2.match).includes(q)) hockey++
        if (normalize(slot.cancha3.match).includes(q)) hockey++
      }
    }
    return { rugby, hockey }
  }, [q])

  const visibleIds =
    sport === "rugby"
      ? [...filteredBlocksA.map((b) => b.id), ...filteredRoundsB.map((r) => r.id)]
      : filteredHockeyBlocks.map((b) => b.id)

  const allOpen = visibleIds.length > 0 && visibleIds.every((id) => openIds.has(id))
  const hasResults = visibleIds.length > 0

  const isBlockOpen = (id: string) => autoExpand || openIds.has(id)

  const toggleBlock = (id: string) => {
    trackEvent("fixture_block_toggle", { blockId: id })
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    trackEvent("fixture_block_toggle", { blockId: allOpen ? "collapse_all" : "expand_all" })
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (allOpen) {
        visibleIds.forEach((id) => next.delete(id))
      } else {
        visibleIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  const handleSportChange = (next: SportTab) => {
    setSport(next)
    trackEvent("fixture_filter", { filter: `deporte:${next}` })
  }

  const handleCategoryChange = (next: CategoryFilter) => {
    setCategory(next)
    trackEvent("fixture_filter", { filter: `categoria:${next}` })
    if (next === "A" && court !== "all" && court !== "1" && court !== "4") setCourt("all")
    if (next === "B" && (court === "1" || court === "4")) setCourt("all")
    if (next === "B" && !openIds.has("fecha-1")) {
      setOpenIds((prev) => new Set([...prev, "fecha-1"]))
    }
  }

  const activeMeta = sport === "rugby" ? fixtureMeta : hockeyFixtureMeta
  const otherSportCount = sport === "rugby" ? crossSportMatches.hockey : crossSportMatches.rugby

  return (
    <section id="fixture" className="scroll-mt-16 border-b border-ink/10 bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Domingo 22 · Fixture Oficial"
            title="Partidos y canchas"
            description="Elegí el deporte, buscá tu equipo o desplegá cada bloque horario del domingo para ver tus partidos."
          />

          <div className="relative mb-10 w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                sport === "rugby" ? "Buscar equipo en el fixture…" : "Buscar equipo en Hockey…"
              }
              aria-label="Buscar equipo en el fixture"
              className="h-14 w-full rounded-full bg-white pl-12 pr-12 text-base text-ink shadow-sm ring-1 ring-ink/15 outline-none transition placeholder:text-ink/40 focus:ring-2 focus:ring-brand [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-ink/60 hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Selector principal de deporte */}
        <div
          className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-ink/10 sm:inline-grid sm:w-auto"
          role="tablist"
          aria-label="Deporte del fixture"
        >
          {(
            [
              { id: "rugby", title: "Rugby", sub: "6 canchas · Pre Mix y Recreativo" },
              { id: "hockey", title: "Hockey", sub: "3 canchas · Proyección y Desarrollo" },
            ] as const
          ).map((tab) => {
            const active = sport === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => handleSportChange(tab.id)}
                className={cn(
                  "flex cursor-pointer flex-col items-start rounded-xl px-4 py-2.5 text-left transition sm:px-6",
                  active
                    ? "bg-ink text-white shadow-sm"
                    : "text-ink/70 hover:bg-paper hover:text-ink"
                )}
              >
                <span className="font-display text-xl font-extrabold uppercase leading-none sm:text-2xl">
                  {tab.title}
                </span>
                <span
                  className={cn(
                    "mt-1 text-[11px] font-semibold",
                    active ? "text-sky" : "text-ink/50"
                  )}
                >
                  {tab.sub}
                </span>
              </button>
            )
          })}
        </div>

        {/* Aviso si la búsqueda tiene resultados en el otro deporte */}
        {q && otherSportCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand/10 px-4 py-3 text-sm ring-1 ring-brand/25">
            <p className="font-semibold text-ink">
              {otherSportCount === 1 ? "Hay 1 partido" : `Hay ${otherSportCount} partidos`} para “
              {query}” en{" "}
              <strong>{sport === "rugby" ? "Hockey" : "Rugby"}</strong>.
            </p>
            <button
              type="button"
              onClick={() => handleSportChange(sport === "rugby" ? "hockey" : "rugby")}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-dark"
            >
              Ver en {sport === "rugby" ? "Hockey" : "Rugby"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Datos clave del fixture */}
        <ul className="mb-6 flex flex-wrap gap-2">
          <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-ink ring-1 ring-ink/10">
            <Clock className="h-3.5 w-3.5 text-brand" />
            Inicio: {activeMeta.start} · {activeMeta.slotDuration}
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-ink ring-1 ring-ink/10">
            <Calendar className="h-3.5 w-3.5 text-tangerine" />
            {sport === "rugby" ? fixtureMeta.lunchBreak : hockeyFixtureMeta.matchFormat}
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-ink ring-1 ring-ink/10">
            <MapPin className="h-3.5 w-3.5 text-lime" />
            {activeMeta.distribution}
          </li>
        </ul>

        {/* Distribución de zonas y canchas (Rugby) */}
        {sport === "rugby" && (
          <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/10">
            <button
              type="button"
              aria-expanded={showRugbyZones}
              onClick={() => setShowRugbyZones((v) => !v)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3.5 text-left transition hover:bg-paper/60"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-brand">
                  Zonas y canchas
                </span>
                <span className="text-sm font-bold text-ink">
                  Composición de zonas de Pre Mix (Cat. A), Recreativo (Cat. B) y Especiales
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-brand transition-transform duration-200",
                  showRugbyZones && "rotate-180"
                )}
              />
            </button>

            {showRugbyZones && (
              <div className="space-y-4 border-t border-ink/10 p-5">
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Pre Mix (Cat. A) */}
                  <div className="rounded-2xl bg-brand/5 p-4 ring-1 ring-brand/20">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="font-display text-lg font-extrabold uppercase text-ink">
                        Pre Mix (Cat. A)
                      </p>
                      <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-brand ring-1 ring-brand/20">
                        Canchas 1 y 4
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {rugbyZones.preMix.map((z) => (
                        <div key={z.name} className="rounded-xl bg-white p-3 ring-1 ring-ink/10">
                          <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-brand">
                            {z.name}
                          </p>
                          <ul className="space-y-1 text-xs font-bold text-ink">
                            {z.teams.map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recreativo (Cat. B) */}
                  <div className="rounded-2xl bg-berry/5 p-4 ring-1 ring-berry/20">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="font-display text-lg font-extrabold uppercase text-ink">
                        Recreativo (Cat. B)
                      </p>
                      <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-berry ring-1 ring-berry/20">
                        Canchas 2a, 2b, 3a y 3b
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {rugbyZones.recreativo.map((z) => (
                        <div key={z.name} className="rounded-xl bg-white p-3 ring-1 ring-ink/10">
                          <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-berry">
                            {z.name}
                          </p>
                          <ul className="space-y-1 text-xs font-bold text-ink">
                            {z.teams.map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Especiales (Fuera de Zona) */}
                <div className="rounded-2xl bg-tangerine/10 p-4 ring-1 ring-tangerine/30">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-base font-extrabold uppercase text-ink">
                        Especiales · Fuera de Zona
                      </p>
                      <p className="text-xs font-semibold text-ink/65">
                        Encuentros especiales programados en Cancha 1
                      </p>
                    </div>
                    <ul className="flex flex-wrap gap-2">
                      {rugbyZones.especiales.map((team) => (
                        <li
                          key={team}
                          className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink ring-1 ring-ink/10"
                        >
                          {team}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Distribución de zonas y canchas (Hockey) */}
        {sport === "hockey" && (
          <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/10">
            <button
              type="button"
              aria-expanded={showHockeyZones}
              onClick={() => setShowHockeyZones((v) => !v)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3.5 text-left transition hover:bg-paper/60"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-amber-400/25 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-ink">
                  Zonas y canchas
                </span>
                <span className="text-sm font-bold text-ink">
                  Distribución oficial de Proyección y Desarrollo (3 canchas)
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-brand transition-transform duration-200",
                  showHockeyZones && "rotate-180"
                )}
              />
            </button>

            {showHockeyZones && (
              <div className="space-y-5 border-t border-ink/10 p-5">
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Proyección */}
                  <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-300/70">
                    <p className="mb-3 font-display text-lg font-extrabold uppercase text-ink">
                      Proyección
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {hockeyZones.proyeccion.map((z) => (
                        <div key={z.name} className="rounded-xl bg-white p-3 ring-1 ring-ink/10">
                          <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-amber-700">
                            {z.name}
                          </p>
                          <ul className="space-y-1 text-xs font-bold text-ink">
                            {z.teams.map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desarrollo */}
                  <div className="rounded-2xl bg-sky/10 p-4 ring-1 ring-sky/30">
                    <p className="mb-3 font-display text-lg font-extrabold uppercase text-ink">
                      Desarrollo
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {hockeyZones.desarrollo.map((z) => (
                        <div key={z.name} className="rounded-xl bg-white p-3 ring-1 ring-ink/10">
                          <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-brand">
                            {z.name}
                          </p>
                          <ul className="space-y-1 text-xs font-bold text-ink">
                            {z.teams.map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Esquema de canchas */}
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink/60">
                    Distribución de canchas en el campo de juego
                  </p>
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-lime/20 p-3 ring-1 ring-lime/40 sm:grid-cols-4">
                    <div className="col-span-2 flex flex-col items-center justify-center rounded-xl bg-amber-300/80 px-4 py-4 text-center ring-1 ring-amber-500/40">
                      <span className="font-display text-xl font-extrabold uppercase text-ink">
                        Cancha 1
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-ink/80">
                        Proyección
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-xl bg-white px-3 py-4 text-center ring-1 ring-ink/15">
                      <span className="font-display text-xl font-extrabold uppercase text-ink">
                        Cancha 2
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand">
                        Desarrollo 1
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-xl bg-white px-3 py-4 text-center ring-1 ring-ink/15">
                      <span className="font-display text-xl font-extrabold uppercase text-ink">
                        Cancha 3
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand">
                        Desarrollo 2
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selector de día / bloque horario */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por bloque del domingo">
            {(
              [
                { id: "all", label: "Domingo 22 · Todo el día" },
                {
                  id: "manana",
                  label:
                    sport === "rugby"
                      ? "Bloque Mañana (10:00 a 12:55 hs)"
                      : "Bloque Mañana (10:00 a 12:40 hs)",
                },
                {
                  id: "tarde",
                  label:
                    sport === "rugby"
                      ? "Bloque Tarde (14:00 a 16:35 hs)"
                      : "Bloque Tarde (13:00 a 16:00 hs)",
                },
              ] as const
            ).map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setBlockFilter(b.id)
                  trackEvent("fixture_filter", { filter: `bloque:${b.id}` })
                }}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition sm:text-sm",
                  blockFilter === b.id
                    ? "bg-ink text-white shadow-sm"
                    : "bg-white text-ink/75 ring-1 ring-ink/10 hover:text-ink"
                )}
              >
                {b.label}
              </button>
            ))}
          </div>

          {!autoExpand && hasResults && (
            <button
              type="button"
              onClick={toggleAll}
              className="cursor-pointer rounded-full bg-white px-4 py-2 text-xs font-bold text-brand ring-1 ring-brand/25 transition hover:bg-brand hover:text-white"
            >
              {allOpen ? "Contraer todos" : "Expandir todos"}
            </button>
          )}
        </div>

        {/* Filtros específicos por deporte */}
        {sport === "rugby" ? (
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categoría de fixture">
              {(
                [
                  { id: "all", label: "Todas las categorías" },
                  { id: "A", label: "Categoría A · Pre Mix (2 canchas)" },
                  { id: "B", label: "Categoría B · Recreativo (4 canchas)" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={category === tab.id}
                  onClick={() => handleCategoryChange(tab.id)}
                  className={cn(
                    "cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition sm:text-sm",
                    category === tab.id
                      ? "bg-brand text-white shadow-sm"
                      : "bg-white text-ink/75 ring-1 ring-ink/10 hover:text-ink"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por cancha">
              {COURT_PILLS.filter(
                (p) => category === "all" || p.cat === "all" || p.cat === category
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setCourt(p.id)
                    trackEvent("fixture_filter", { filter: `cancha:${p.id}` })
                  }}
                  className={cn(
                    "cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold transition",
                    court === p.id
                      ? "bg-ink text-white"
                      : "bg-white text-ink/70 ring-1 ring-ink/10 hover:text-ink"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Zona de Hockey">
              {(
                [
                  { id: "all", label: "Todas las zonas" },
                  { id: "proyeccion", label: "Zona Proyección" },
                  { id: "desarrollo", label: "Zona Desarrollo" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={hockeyZone === tab.id}
                  onClick={() => {
                    setHockeyZone(tab.id)
                    trackEvent("fixture_filter", { filter: `hockey_zona:${tab.id}` })
                  }}
                  className={cn(
                    "cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition sm:text-sm",
                    hockeyZone === tab.id
                      ? "bg-brand text-white shadow-sm"
                      : "bg-white text-ink/75 ring-1 ring-ink/10 hover:text-ink"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por cancha de Hockey">
              {HOCKEY_COURT_PILLS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setHockeyCourt(p.id)
                    trackEvent("fixture_filter", { filter: `hockey_cancha:${p.id}` })
                  }}
                  className={cn(
                    "cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold transition",
                    hockeyCourt === p.id
                      ? "bg-ink text-white"
                      : "bg-white text-ink/70 ring-1 ring-ink/10 hover:text-ink"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resultados */}
        {!hasResults ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-ink/15 bg-white py-16 text-center">
            <p className="font-display text-2xl font-bold uppercase text-ink">
              {query ? `Sin partidos para “${query}”` : "Sin partidos con estos filtros"}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setBlockFilter("all")
                if (sport === "rugby") {
                  setCategory("all")
                  setCourt("all")
                } else {
                  setHockeyZone("all")
                  setHockeyCourt("all")
                }
              }}
              className="cursor-pointer rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-brand"
            >
              Ver fixture completo de {sport === "rugby" ? "Rugby" : "Hockey"}
            </button>
          </div>
        ) : sport === "rugby" ? (
          <div className="flex flex-col gap-10">
            {/* CATEGORÍA A: PRE MIX */}
            {filteredBlocksA.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                      2 Canchas
                    </span>
                    <h3 className="font-display text-3xl font-extrabold uppercase text-ink">
                      Categoría A · Pre Mix
                    </h3>
                  </div>
                  <span className="rounded-full bg-white px-3.5 py-1 text-xs font-bold text-ink/75 ring-1 ring-ink/10">
                    Cancha 1 y Cancha 4
                  </span>
                </div>

                {filteredBlocksA.map((block) => {
                  const open = isBlockOpen(block.id)
                  const matchCount = block.slots.reduce((acc, slot) => {
                    const c1 =
                      (court === "all" || court === "1") && (!q || normalize(slot.cancha1).includes(q))
                        ? 1
                        : 0
                    const c4 =
                      (court === "all" || court === "4") && (!q || normalize(slot.cancha4).includes(q))
                        ? 1
                        : 0
                    return acc + c1 + c4
                  }, 0)

                  return (
                    <div
                      key={block.id}
                      className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/10"
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={`panel-${block.id}`}
                        onClick={() => toggleBlock(block.id)}
                        className="flex w-full cursor-pointer items-center justify-between gap-3 bg-ink px-5 py-4 text-left text-white transition hover:bg-ink/95"
                      >
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                            Domingo 22
                          </span>
                          <span className="font-display text-xl font-bold uppercase tracking-wide">
                            {block.title}
                          </span>
                          <span className="text-xs font-semibold text-sky">{block.hours}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="hidden rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/85 sm:inline-block">
                            {matchCount} {matchCount === 1 ? "partido" : "partidos"}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 shrink-0 text-sky transition-transform duration-200",
                              open && "rotate-180"
                            )}
                          />
                        </div>
                      </button>

                      {open && (
                        <div id={`panel-${block.id}`} className="divide-y divide-ink/10">
                          {block.slots.map((slot) => {
                            const showC1 =
                              (court === "all" || court === "1") &&
                              (!q || normalize(slot.cancha1).includes(q))
                            const showC4 =
                              (court === "all" || court === "4") &&
                              (!q || normalize(slot.cancha4).includes(q))
                            return (
                              <div
                                key={`${block.id}-${slot.time}`}
                                className="grid gap-3 px-4 py-3.5 sm:grid-cols-[84px_1fr] sm:items-center sm:px-5"
                              >
                                <span className="font-display text-2xl font-extrabold tabular-nums text-brand">
                                  {slot.time}
                                </span>
                                <div
                                  className={cn(
                                    "grid gap-2.5",
                                    showC1 && showC4 ? "md:grid-cols-2" : "grid-cols-1"
                                  )}
                                >
                                  {showC1 && (
                                    <div className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3.5 py-2.5">
                                      <span className="shrink-0 rounded-md bg-brand px-2 py-0.5 text-[11px] font-bold uppercase text-white">
                                        Cancha 1
                                      </span>
                                      <span className="flex-1 text-sm font-bold text-ink">
                                        {slot.cancha1}
                                      </span>
                                    </div>
                                  )}
                                  {showC4 && (
                                    <div className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3.5 py-2.5">
                                      <span className="shrink-0 rounded-md bg-grape px-2 py-0.5 text-[11px] font-bold uppercase text-white">
                                        Cancha 4
                                      </span>
                                      <span className="flex-1 text-sm font-bold text-ink">
                                        {slot.cancha4}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* CATEGORÍA B: RECREATIVO */}
            {filteredRoundsB.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-berry">
                      4 Canchas · Rotación por fecha
                    </span>
                    <h3 className="font-display text-3xl font-extrabold uppercase text-ink">
                      Categoría B · Recreativo
                    </h3>
                  </div>
                  <span className="rounded-full bg-white px-3.5 py-1 text-xs font-bold text-ink/75 ring-1 ring-ink/10">
                    Canchas 2a, 2b, 3a y 3b
                  </span>
                </div>

                {filteredRoundsB.map((round) => {
                  const open = isBlockOpen(round.id)
                  const matchCount = round.slots.reduce((acc, slot) => {
                    const list: Array<[CourtFilter, string]> = [
                      ["2a", slot.cancha2a],
                      ["2b", slot.cancha2b],
                      ["3a", slot.cancha3a],
                      ["3b", slot.cancha3b],
                    ]
                    return (
                      acc +
                      list.filter(
                        ([cid, m]) =>
                          (court === "all" || court === cid) && (!q || normalize(m).includes(q))
                      ).length
                    )
                  }, 0)

                  return (
                    <div
                      key={round.id}
                      className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/10"
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={`panel-${round.id}`}
                        onClick={() => toggleBlock(round.id)}
                        className="flex w-full cursor-pointer items-center justify-between gap-3 bg-ink px-5 py-4 text-left text-white transition hover:bg-ink/95"
                      >
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="rounded-full bg-berry px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                            Domingo 22
                          </span>
                          <span className="font-display text-xl font-bold uppercase tracking-wide">
                            {round.title}
                          </span>
                          <span className="text-xs font-semibold text-sky">{round.hours}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="hidden rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/85 sm:inline-block">
                            {matchCount} {matchCount === 1 ? "turno" : "turnos"}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 shrink-0 text-sky transition-transform duration-200",
                              open && "rotate-180"
                            )}
                          />
                        </div>
                      </button>

                      {open && (
                        <div id={`panel-${round.id}`} className="divide-y divide-ink/10">
                          {round.slots.map((slot) => {
                            const entries = (
                              [
                                {
                                  id: "2a",
                                  label: "Cancha 2a",
                                  zone: round.zones.cancha2a,
                                  match: slot.cancha2a,
                                  badge: "bg-brand",
                                },
                                {
                                  id: "2b",
                                  label: "Cancha 2b",
                                  zone: round.zones.cancha2b,
                                  match: slot.cancha2b,
                                  badge: "bg-sky",
                                },
                                {
                                  id: "3a",
                                  label: "Cancha 3a",
                                  zone: round.zones.cancha3a,
                                  match: slot.cancha3a,
                                  badge: "bg-tangerine",
                                },
                                {
                                  id: "3b",
                                  label: "Cancha 3b",
                                  zone: round.zones.cancha3b,
                                  match: slot.cancha3b,
                                  badge: "bg-berry",
                                },
                              ] as const
                            ).filter(
                              (item) =>
                                (court === "all" || court === item.id) &&
                                (!q || normalize(item.match).includes(q))
                            )

                            return (
                              <div
                                key={`${round.id}-${slot.time}`}
                                className="grid gap-3 px-4 py-3.5 sm:grid-cols-[84px_1fr] sm:items-center sm:px-5"
                              >
                                <span className="font-display text-2xl font-extrabold tabular-nums text-brand">
                                  {slot.time}
                                </span>
                                <div
                                  className={cn(
                                    "grid gap-2.5",
                                    entries.length > 1 ? "md:grid-cols-2" : "grid-cols-1"
                                  )}
                                >
                                  {entries.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center gap-3 rounded-xl bg-paper px-3.5 py-2.5"
                                    >
                                      <div className="flex shrink-0 flex-col items-start">
                                        <span
                                          className={cn(
                                            "rounded-md px-2 py-0.5 text-[11px] font-bold uppercase text-white",
                                            item.badge
                                          )}
                                        >
                                          {item.label}
                                        </span>
                                        <span className="mt-0.5 text-[10px] font-semibold text-ink/55">
                                          {item.zone}
                                        </span>
                                      </div>
                                      <span className="flex-1 text-sm font-bold text-ink">
                                        {item.match}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          /* HOCKEY */
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                  3 Canchas · Proyección y Desarrollo
                </span>
                <h3 className="font-display text-3xl font-extrabold uppercase text-ink">
                  Fixture Hockey
                </h3>
              </div>
              <span className="rounded-full bg-white px-3.5 py-1 text-xs font-bold text-ink/75 ring-1 ring-ink/10">
                Cancha 1 · Cancha 2 · Cancha 3
              </span>
            </div>

            {filteredHockeyBlocks.map((block) => {
              const open = isBlockOpen(block.id)
              const matchCount = block.slots.reduce((acc, slot) => acc + slot.entries.length, 0)

              return (
                <div
                  key={block.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/10"
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`panel-${block.id}`}
                    onClick={() => toggleBlock(block.id)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 bg-ink px-5 py-4 text-left text-white transition hover:bg-ink/95"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="rounded-full bg-lime px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-ink">
                        Domingo 22
                      </span>
                      <span className="font-display text-xl font-bold uppercase tracking-wide">
                        {block.title}
                      </span>
                      <span className="text-xs font-semibold text-sky">{block.hours}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/85 sm:inline-block">
                        {matchCount} {matchCount === 1 ? "partido" : "partidos"}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 shrink-0 text-sky transition-transform duration-200",
                          open && "rotate-180"
                        )}
                      />
                    </div>
                  </button>

                  {open && (
                    <div id={`panel-${block.id}`} className="divide-y divide-ink/10">
                      {block.slots.map((slot) => (
                        <div
                          key={`${block.id}-${slot.time}`}
                          className="grid gap-3 px-4 py-3.5 sm:grid-cols-[84px_1fr] sm:items-center sm:px-5"
                        >
                          <span className="font-display text-2xl font-extrabold tabular-nums text-brand">
                            {slot.time}
                          </span>
                          <div
                            className={cn(
                              "grid gap-2.5",
                              slot.entries.length >= 3
                                ? "lg:grid-cols-3"
                                : slot.entries.length === 2
                                  ? "md:grid-cols-2"
                                  : "grid-cols-1"
                            )}
                          >
                            {slot.entries.map((entry) => {
                              const isCrossProyeccion =
                                entry.cell.category === "proyeccion" && entry.id !== "1"
                              const isSpecial = entry.cell.category === "especial"

                              const badgeColor = isSpecial
                                ? "bg-tangerine text-white"
                                : entry.cell.category === "proyeccion"
                                  ? "bg-amber-400 text-ink"
                                  : entry.id === "2"
                                    ? "bg-sky text-white"
                                    : "bg-brand text-white"

                              return (
                                <div
                                  key={entry.id}
                                  className={cn(
                                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5",
                                    isSpecial
                                      ? "bg-tangerine/15 ring-2 ring-tangerine/40"
                                      : isCrossProyeccion
                                        ? "bg-amber-50 ring-2 ring-amber-300"
                                        : "bg-paper"
                                  )}
                                >
                                  <div className="flex shrink-0 flex-col items-start">
                                    <span
                                      className={cn(
                                        "rounded-md px-2 py-0.5 text-[11px] font-bold uppercase",
                                        badgeColor
                                      )}
                                    >
                                      {entry.label}
                                    </span>
                                    <span className="mt-0.5 text-[10px] font-semibold text-ink/65">
                                      {isSpecial
                                        ? "Especial"
                                        : isCrossProyeccion
                                          ? "Proyección"
                                          : entry.defaultSub}
                                    </span>
                                  </div>
                                  <span className="flex-1 text-sm font-bold text-ink">
                                    {entry.cell.match}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold text-ink ring-1 ring-amber-300/80">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p>
                {hockeyFixtureMeta.yellowNote} {hockeyFixtureMeta.matchFormat}.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
