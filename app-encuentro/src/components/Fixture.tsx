"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Calendar, ChevronDown, Clock, MapPin, Search, X } from "lucide-react"
import { fixtureCategoryA, fixtureCategoryB, fixtureMeta } from "@/data/encuentro"
import { SectionHeading } from "@/components/SectionHeading"
import { trackEvent } from "@/lib/analytics"
import { cn, normalize } from "@/lib/utils"

type CategoryFilter = "all" | "A" | "B"
type BlockFilter = "all" | "manana" | "tarde"
type CourtFilter = "all" | "1" | "4" | "2a" | "2b" | "3a" | "3b"

const COURT_PILLS: Array<{ id: CourtFilter; label: string; cat: "A" | "B" | "all" }> = [
  { id: "all", label: "Todas", cat: "all" },
  { id: "1", label: "Cancha 1", cat: "A" },
  { id: "4", label: "Cancha 4", cat: "A" },
  { id: "2a", label: "Cancha 2a", cat: "B" },
  { id: "2b", label: "Cancha 2b", cat: "B" },
  { id: "3a", label: "Cancha 3a", cat: "B" },
  { id: "3b", label: "Cancha 3b", cat: "B" },
]

export function Fixture() {
  const [category, setCategory] = useState<CategoryFilter>("all")
  const [blockFilter, setBlockFilter] = useState<BlockFilter>("all")
  const [court, setCourt] = useState<CourtFilter>("all")
  const [query, setQuery] = useState("")
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(["cat-a-manana"]))
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
  const autoExpand = Boolean(q) || blockFilter !== "all" || court !== "all"

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
          const matchC1 = (court === "all" || court === "1") && (!q || normalize(slot.cancha1).includes(q))
          const matchC4 = (court === "all" || court === "4") && (!q || normalize(slot.cancha4).includes(q))
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
            ([cid, matchText]) => (court === "all" || court === cid) && (!q || normalize(matchText).includes(q))
          )
        }),
      }))
      .filter((r) => r.slots.length > 0)
  }, [showCatB, blockFilter, court, q])

  const visibleIds = [
    ...filteredBlocksA.map((b) => b.id),
    ...filteredRoundsB.map((r) => r.id),
  ]
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
    if (allOpen) {
      setOpenIds(new Set())
    } else {
      setOpenIds(new Set(visibleIds))
    }
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

  return (
    <section id="fixture" className="scroll-mt-16 border-b border-ink/10 bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Domingo 22 · Fixture Rugby"
            title="Partidos y canchas"
            description="Buscá tu equipo o desplegá cada bloque horario del domingo para ver tus partidos."
          />

          <div className="relative mb-10 w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar equipo en el fixture…"
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

        {/* Datos clave del fixture */}
        <ul className="mb-6 flex flex-wrap gap-2">
          <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-ink ring-1 ring-ink/10">
            <Clock className="h-3.5 w-3.5 text-brand" />
            Inicio: {fixtureMeta.start} · {fixtureMeta.slotDuration}
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-ink ring-1 ring-ink/10">
            <Calendar className="h-3.5 w-3.5 text-tangerine" />
            {fixtureMeta.lunchBreak}
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-ink ring-1 ring-ink/10">
            <MapPin className="h-3.5 w-3.5 text-lime" />
            {fixtureMeta.distribution}
          </li>
        </ul>

        {/* Selector de día / bloque horario */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por bloque del domingo">
            {(
              [
                { id: "all", label: "Domingo 22 · Todo el día" },
                { id: "manana", label: "Bloque Mañana (10:00 a 12:55 hs)" },
                { id: "tarde", label: "Bloque Tarde (14:00 a 16:15 hs)" },
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

        {/* Selector de categoría y cancha */}
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

        {!hasResults ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-ink/15 bg-white py-16 text-center">
            <p className="font-display text-2xl font-bold uppercase text-ink">
              Sin partidos para “{query}”
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setCategory("all")
                setBlockFilter("all")
                setCourt("all")
              }}
              className="cursor-pointer rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-brand"
            >
              Ver fixture completo
            </button>
          </div>
        ) : (
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
                    const c1 = (court === "all" || court === "1") && (!q || normalize(slot.cancha1).includes(q)) ? 1 : 0
                    const c4 = (court === "all" || court === "4") && (!q || normalize(slot.cancha4).includes(q)) ? 1 : 0
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
                            const showC1 = (court === "all" || court === "1") && (!q || normalize(slot.cancha1).includes(q))
                            const showC4 = (court === "all" || court === "4") && (!q || normalize(slot.cancha4).includes(q))
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
                        ([cid, m]) => (court === "all" || court === cid) && (!q || normalize(m).includes(q))
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
                                { id: "2a", label: "Cancha 2a", zone: round.zones.cancha2a, match: slot.cancha2a, badge: "bg-brand" },
                                { id: "2b", label: "Cancha 2b", zone: round.zones.cancha2b, match: slot.cancha2b, badge: "bg-sky" },
                                { id: "3a", label: "Cancha 3a", zone: round.zones.cancha3a, match: slot.cancha3a, badge: "bg-tangerine" },
                                { id: "3b", label: "Cancha 3b", zone: round.zones.cancha3b, match: slot.cancha3b, badge: "bg-berry" },
                              ] as const
                            ).filter(
                              (item) => (court === "all" || court === item.id) && (!q || normalize(item.match).includes(q))
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
        )}
      </div>
    </section>
  )
}
