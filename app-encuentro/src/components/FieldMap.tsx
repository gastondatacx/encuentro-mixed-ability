"use client"

import { useEffect, useState } from "react"
import { Maximize2, X } from "lucide-react"
import { cn } from "@/lib/utils"

type CourtId = "all" | "cancha-1" | "cancha-2" | "cancha-3" | "cancha-4"

interface CourtInfo {
  id: Exclude<CourtId, "all">
  pillLabel: string
  title: string
  badge: string
  details: string
  specs: string[]
}

const COURTS: CourtInfo[] = [
  {
    id: "cancha-1",
    pillLabel: "Cancha 1",
    title: "Cancha 1 — Principal",
    badge: "Sector Norte · Horizontal",
    details:
      "Cancha principal ubicada en la parte superior derecha del predio, paralela a la tribuna y a la línea de arboleda y gazebos.",
    specs: ["Orientación horizontal", "Tribuna al sur", "Arboleda / Gazebos"],
  },
  {
    id: "cancha-2",
    pillLabel: "Cancha 2 (2A · 2B)",
    title: "Cancha 2 — Subdividida en 2A y 2B",
    badge: "Sector Sureste · 2 subcanchas",
    details:
      "Cancha doble dividida en dos sectores transversales de 40 m (2A al norte y 2B al sur), con márgenes perimetrales de 5 m y acceso por el corredor central.",
    specs: ["Cancha 2A (40 m)", "Cancha 2B (40 m)", "Márgenes 5 m", "Puesto central al oeste"],
  },
  {
    id: "cancha-3",
    pillLabel: "Cancha 3 (3C · 3D)",
    title: "Cancha 3 — Subdividida en 3C y 3D",
    badge: "Sector Suroeste · 2 subcanchas",
    details:
      "Cancha doble con zonas de ingoal marcadas en ambos extremos, pasillo central divisor entre 3C (norte) y 3D (sur) de 40 m cada una, y retiros de seguridad de 5 m.",
    specs: ["Cancha 3C (40 m)", "Cancha 3D (40 m)", "Pasillo central", "Ingoals y retiros 5 m"],
  },
  {
    id: "cancha-4",
    pillLabel: "Cancha 4",
    title: "Cancha 4",
    badge: "Sector Noroeste · Vertical",
    details:
      "Cancha ubicada en el extremo superior izquierdo del predio, al oeste de Cancha 1 y al norte de Cancha 3.",
    specs: ["Orientación vertical", "H-posts norte y sur"],
  },
]

function RugbyHPost({
  x,
  y,
  orientation,
}: {
  x: number
  y: number
  orientation: "horizontal" | "vertical"
}) {
  if (orientation === "vertical") {
    return (
      <g stroke="#ffffff" strokeWidth={2.5} strokeLinecap="round">
        <line x1={x - 14} y1={y - 10} x2={x - 14} y2={y + 8} />
        <line x1={x + 14} y1={y - 10} x2={x + 14} y2={y + 8} />
        <line x1={x - 14} y1={y} x2={x + 14} y2={y} />
      </g>
    )
  }
  return (
    <g stroke="#ffffff" strokeWidth={2.5} strokeLinecap="round">
      <line x1={x - 10} y1={y - 14} x2={x + 8} y2={y - 14} />
      <line x1={x - 10} y1={y + 14} x2={x + 8} y2={y + 14} />
      <line x1={x} y1={y - 14} x2={x} y2={y + 14} />
    </g>
  )
}

function CroquisSvg({
  selected,
  onSelect,
}: {
  selected: CourtId
  onSelect: (id: CourtId) => void
}) {
  const opacityFor = (id: Exclude<CourtId, "all">) =>
    selected === "all" || selected === id ? 1 : 0.35

  const strokeFor = (id: Exclude<CourtId, "all">) =>
    selected === id ? "#facc15" : "#ffffff"

  const toggle = (id: Exclude<CourtId, "all">) =>
    onSelect(selected === id ? "all" : id)

  const handleKey = (e: React.KeyboardEvent, id: Exclude<CourtId, "all">) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggle(id)
    }
  }

  return (
    <svg
      viewBox="0 0 920 760"
      role="img"
      aria-label="Croquis de distribución de canchas en Córdoba Rugby Club"
      className="h-auto w-full select-none"
    >
      {/* Fondo del predio */}
      <rect x={0} y={0} width={920} height={760} rx={24} fill="#eef3ea" />

      {/* Etiqueta general superior */}
      <text
        x={24}
        y={28}
        fill="#0b1640"
        fontSize={12}
        fontWeight={700}
        letterSpacing={1.8}
        opacity={0.6}
      >
        CÓRDOBA RUGBY CLUB · DISTRIBUCIÓN DE CANCHAS
      </text>

      {/* ================= CANCHA 4 (Arriba Izquierda) ================= */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Seleccionar Cancha 4"
        onClick={() => toggle("cancha-4")}
        onKeyDown={(e) => handleKey(e, "cancha-4")}
        style={{ opacity: opacityFor("cancha-4"), cursor: "pointer", transition: "opacity 200ms" }}
      >
        <rect
          x={40}
          y={52}
          width={230}
          height={240}
          rx={10}
          fill="#247a3d"
          stroke={strokeFor("cancha-4")}
          strokeWidth={selected === "cancha-4" ? 4 : 2}
        />
        {/* Líneas interiores */}
        <rect
          x={56}
          y={74}
          width={198}
          height={196}
          fill="none"
          stroke="#ffffff"
          strokeWidth={2}
          opacity={0.9}
        />
        <line x1={56} y1={172} x2={254} y2={172} stroke="#ffffff" strokeWidth={2} opacity={0.9} />
        <RugbyHPost x={155} y={74} orientation="vertical" />
        <RugbyHPost x={155} y={270} orientation="vertical" />
        {/* Número de cancha */}
        <circle cx={155} cy={126} r={24} fill="#ffffff" />
        <text
          x={155}
          y={134}
          textAnchor="middle"
          fill="#0b1640"
          fontSize={22}
          fontWeight={800}
        >
          4
        </text>
        <text
          x={155}
          y={224}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={15}
          fontWeight={800}
          letterSpacing={1.4}
        >
          CANCHA 4
        </text>
      </g>

      {/* ================= CANCHA 1 (Arriba Derecha) ================= */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Seleccionar Cancha 1"
        onClick={() => toggle("cancha-1")}
        onKeyDown={(e) => handleKey(e, "cancha-1")}
        style={{ opacity: opacityFor("cancha-1"), cursor: "pointer", transition: "opacity 200ms" }}
      >
        <rect
          x={400}
          y={52}
          width={475}
          height={186}
          rx={10}
          fill="#1e7037"
          stroke={strokeFor("cancha-1")}
          strokeWidth={selected === "cancha-1" ? 4 : 2}
        />
        <rect
          x={426}
          y={68}
          width={423}
          height={154}
          fill="none"
          stroke="#ffffff"
          strokeWidth={2}
          opacity={0.9}
        />
        <line x1={637} y1={68} x2={637} y2={222} stroke="#ffffff" strokeWidth={2} opacity={0.9} />
        <RugbyHPost x={426} y={145} orientation="horizontal" />
        <RugbyHPost x={849} y={145} orientation="horizontal" />
        <circle cx={720} cy={145} r={26} fill="#ffffff" />
        <text
          x={720}
          y={153}
          textAnchor="middle"
          fill="#0b1640"
          fontSize={24}
          fontWeight={800}
        >
          1
        </text>
        <text
          x={534}
          y={150}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={17}
          fontWeight={800}
          letterSpacing={1.5}
        >
          CANCHA 1
        </text>
      </g>

      {/* ================= TRIBUNA Y ARBOLEDA / GAZEBOS ================= */}
      <g>
        {/* Tribuna / gradas debajo de Cancha 1 */}
        <rect
          x={525}
          y={250}
          width={225}
          height={28}
          rx={5}
          fill="#cbd5e1"
          stroke="#475569"
          strokeWidth={1.5}
        />
        <line x1={535} y1={259} x2={740} y2={259} stroke="#64748b" strokeWidth={1.5} />
        <line x1={535} y1={269} x2={740} y2={269} stroke="#64748b" strokeWidth={1.5} />
        <text
          x={762}
          y={268}
          fill="#334155"
          fontSize={11}
          fontWeight={700}
          letterSpacing={1}
        >
          TRIBUNA
        </text>

        {/* Línea de arboleda / sombra / gazebos */}
        {[440, 494, 548, 602, 656, 710, 764, 818].map((cx) => (
          <g key={cx}>
            <circle
              cx={cx}
              cy={306}
              r={21}
              fill="#86efac"
              fillOpacity={0.75}
              stroke="#15803d"
              strokeWidth={1.5}
            />
            <circle cx={cx - 4} cy={302} r={8} fill="#4ade80" fillOpacity={0.45} />
          </g>
        ))}
        <text
          x={405}
          y={310}
          textAnchor="end"
          fill="#166534"
          fontSize={11}
          fontWeight={700}
          letterSpacing={0.8}
        >
          ARBOLEDA / SOMBRA
        </text>
      </g>

      {/* ================= CORREDOR Y PUESTO CENTRAL ================= */}
      <g>
        <line
          x1={470}
          y1={352}
          x2={470}
          y2={724}
          stroke="#94a3b8"
          strokeWidth={2}
          strokeDasharray="6 6"
        />
        {/* Indicador superior corredor */}
        <circle cx={470} cy={438} r={14} fill="#ffffff" stroke="#1d3fb8" strokeWidth={2} />
        <text x={470} y={442} textAnchor="middle" fill="#1d3fb8" fontSize={12} fontWeight={800}>
          +
        </text>

        {/* Puesto / mesa central a la altura del pasillo 40m / 40m */}
        <rect
          x={449}
          y={518}
          width={42}
          height={42}
          rx={7}
          fill="#1d3fb8"
          stroke="#ffffff"
          strokeWidth={2.5}
        />
        <text x={470} y={536} textAnchor="middle" fill="#ffffff" fontSize={9} fontWeight={800}>
          PUESTO
        </text>
        <text x={470} y={549} textAnchor="middle" fill="#bae6fd" fontSize={8.5} fontWeight={700}>
          CENTRAL
        </text>

        {/* Cotas 40 m arriba y abajo del pasillo */}
        <text x={470} y={506} textAnchor="middle" fill="#0b1640" fontSize={11} fontWeight={800}>
          40 m
        </text>
        <text x={470} y={580} textAnchor="middle" fill="#0b1640" fontSize={11} fontWeight={800}>
          40 m
        </text>
      </g>

      {/* ================= CANCHA 3 (Abajo Izquierda: 3C y 3D) ================= */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Seleccionar Cancha 3 (3C y 3D)"
        onClick={() => toggle("cancha-3")}
        onKeyDown={(e) => handleKey(e, "cancha-3")}
        style={{ opacity: opacityFor("cancha-3"), cursor: "pointer", transition: "opacity 200ms" }}
      >
        {/* Cabecera numeral Cancha 3 */}
        <circle cx={260} cy={358} r={16} fill="#0b1640" />
        <text x={260} y={364} textAnchor="middle" fill="#ffffff" fontSize={16} fontWeight={800}>
          3
        </text>
        <text x={286} y={363} fill="#0b1640" fontSize={13} fontWeight={800} letterSpacing={1}>
          CANCHA 3
        </text>

        {/* Superficie verde */}
        <rect
          x={96}
          y={382}
          width={328}
          height={342}
          rx={10}
          fill="#247a3d"
          stroke={strokeFor("cancha-3")}
          strokeWidth={selected === "cancha-3" ? 4 : 2}
        />
        {/* Zonas Ingoal superior e inferior */}
        <rect x={118} y={394} width={284} height={28} fill="#166534" opacity={0.85} />
        <text x={260} y={412} textAnchor="middle" fill="#dcfce7" fontSize={11} fontWeight={800} letterSpacing={2}>
          INGOAL
        </text>
        <rect x={118} y={684} width={284} height={28} fill="#166534" opacity={0.85} />
        <text x={260} y={702} textAnchor="middle" fill="#dcfce7" fontSize={11} fontWeight={800} letterSpacing={2}>
          INGOAL
        </text>

        {/* Contorno principal y líneas punteadas de 5 m */}
        <rect x={118} y={394} width={284} height={318} fill="none" stroke="#ffffff" strokeWidth={2} />
        <rect
          x={134}
          y={422}
          width={252}
          height={262}
          fill="none"
          stroke="#fde047"
          strokeWidth={1.5}
          strokeDasharray="5 5"
        />
        {/* Etiquetas 5 m */}
        <text x={125} y={416} fill="#fde047" fontSize={10} fontWeight={800}>5m</text>
        <text x={383} y={416} fill="#fde047" fontSize={10} fontWeight={800}>5m</text>
        <text x={125} y={698} fill="#fde047" fontSize={10} fontWeight={800}>5m</text>
        <text x={383} y={698} fill="#fde047" fontSize={10} fontWeight={800}>5m</text>

        {/* H-Posts */}
        <RugbyHPost x={260} y={394} orientation="vertical" />
        <RugbyHPost x={260} y={712} orientation="vertical" />

        {/* Pasillo central horizontal */}
        <rect x={118} y={538} width={284} height={24} fill="#0b1640" fillOpacity={0.35} />
        <line x1={118} y1={550} x2={402} y2={550} stroke="#ffffff" strokeWidth={2} />
        <text x={260} y={554} textAnchor="middle" fill="#ffffff" fontSize={11} fontWeight={800} letterSpacing={2.5}>
          PASILLO
        </text>

        {/* Subcanchas 3C y 3D */}
        <rect x={222} y={462} width={76} height={42} rx={8} fill="#ffffff" />
        <text x={260} y={491} textAnchor="middle" fill="#0b1640" fontSize={24} fontWeight={900}>
          3C
        </text>

        <rect x={222} y={596} width={76} height={42} rx={8} fill="#ffffff" />
        <text x={260} y={625} textAnchor="middle" fill="#0b1640" fontSize={24} fontWeight={900}>
          3D
        </text>
      </g>

      {/* ================= CANCHA 2 (Abajo Derecha: 2A y 2B) ================= */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Seleccionar Cancha 2 (2A y 2B)"
        onClick={() => toggle("cancha-2")}
        onKeyDown={(e) => handleKey(e, "cancha-2")}
        style={{ opacity: opacityFor("cancha-2"), cursor: "pointer", transition: "opacity 200ms" }}
      >
        {/* Cabecera numeral Cancha 2 */}
        <circle cx={680} cy={358} r={16} fill="#0b1640" />
        <text x={680} y={364} textAnchor="middle" fill="#ffffff" fontSize={16} fontWeight={800}>
          2
        </text>
        <text x={706} y={363} fill="#0b1640" fontSize={13} fontWeight={800} letterSpacing={1}>
          CANCHA 2
        </text>

        {/* Superficie verde */}
        <rect
          x={516}
          y={382}
          width={328}
          height={342}
          rx={10}
          fill="#247a3d"
          stroke={strokeFor("cancha-2")}
          strokeWidth={selected === "cancha-2" ? 4 : 2}
        />

        {/* Contorno y líneas punteadas 5 m */}
        <rect x={538} y={394} width={284} height={318} fill="none" stroke="#ffffff" strokeWidth={2} />
        <rect
          x={554}
          y={422}
          width={252}
          height={262}
          fill="none"
          stroke="#fde047"
          strokeWidth={1.5}
          strokeDasharray="5 5"
        />
        <text x={545} y={416} fill="#fde047" fontSize={10} fontWeight={800}>5m</text>
        <text x={803} y={416} fill="#fde047" fontSize={10} fontWeight={800}>5m</text>
        <text x={545} y={698} fill="#fde047" fontSize={10} fontWeight={800}>5m</text>
        <text x={803} y={698} fill="#fde047" fontSize={10} fontWeight={800}>5m</text>

        {/* H-Posts */}
        <RugbyHPost x={680} y={394} orientation="vertical" />
        <RugbyHPost x={680} y={712} orientation="vertical" />

        {/* Línea divisoria central */}
        <line x1={538} y1={550} x2={822} y2={550} stroke="#ffffff" strokeWidth={2.5} />
        <line x1={538} y1={536} x2={822} y2={536} stroke="#ffffff" strokeWidth={1} strokeDasharray="4 4" opacity={0.7} />
        <line x1={538} y1={564} x2={822} y2={564} stroke="#ffffff" strokeWidth={1} strokeDasharray="4 4" opacity={0.7} />

        {/* Subcanchas 2A y 2B */}
        <rect x={642} y={462} width={76} height={42} rx={8} fill="#ffffff" />
        <text x={680} y={491} textAnchor="middle" fill="#0b1640" fontSize={24} fontWeight={900}>
          2A
        </text>

        <rect x={642} y={596} width={76} height={42} rx={8} fill="#ffffff" />
        <text x={680} y={625} textAnchor="middle" fill="#0b1640" fontSize={24} fontWeight={900}>
          2B
        </text>
      </g>
    </svg>
  )
}

export function FieldMap() {
  const [selected, setSelected] = useState<CourtId>("all")
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!expanded) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [expanded])

  const activeInfo = selected === "all" ? null : COURTS.find((c) => c.id === selected) ?? null

  return (
    <div className="mt-16 rounded-3xl bg-paper p-5 ring-1 ring-ink/10 sm:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
            Plano del club
          </p>
          <h3 className="mt-1 font-display text-3xl font-extrabold uppercase text-ink">
            Croquis de canchas
          </h3>
          <p className="mt-1 text-sm text-ink/65">
            Tocá una cancha para ver su ubicación, divisiones (2A, 2B, 3C, 3D) y referencias del predio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-ink ring-1 ring-ink/15 transition hover:ring-ink"
        >
          <Maximize2 className="h-4 w-4 text-brand" />
          Ampliar croquis
        </button>
      </div>

      {/* Selector rápido */}
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filtrar cancha en el croquis">
        <button
          type="button"
          onClick={() => setSelected("all")}
          className={cn(
            "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition sm:text-sm",
            selected === "all"
              ? "bg-ink text-white"
              : "bg-white text-ink/75 ring-1 ring-ink/10 hover:text-ink"
          )}
        >
          Todas las canchas
        </button>
        {COURTS.map((court) => (
          <button
            key={court.id}
            type="button"
            onClick={() => setSelected(selected === court.id ? "all" : court.id)}
            className={cn(
              "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition sm:text-sm",
              selected === court.id
                ? "bg-brand text-white"
                : "bg-white text-ink/75 ring-1 ring-ink/10 hover:text-ink"
            )}
          >
            {court.pillLabel}
          </button>
        ))}
      </div>

      {/* Mapa vectorial */}
      <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-ink/10 sm:p-4">
        <CroquisSvg selected={selected} onSelect={setSelected} />
      </div>

      {/* Detalle de la cancha seleccionada o resumen general */}
      <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-ink/10">
        {activeInfo ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-display text-2xl font-extrabold uppercase text-ink">
                {activeInfo.title}
              </h4>
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
                {activeInfo.badge}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-ink/75">{activeInfo.details}</p>
            <ul className="mt-1 flex flex-wrap gap-2">
              {activeInfo.specs.map((spec) => (
                <li
                  key={spec}
                  className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/75"
                >
                  {spec}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="font-display text-xl font-bold uppercase text-ink">
                6 sectores de juego activos en el club
              </h4>
              <p className="text-sm text-ink/65">
                Canchas 1 y 4 completas, más las canchas 2 (2A · 2B) y 3 (3C · 3D) divididas en sectores de 40 m con pasillo, retiros de 5 m, tribuna, arboleda y puesto central.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal ampliado */}
      {expanded && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Croquis ampliado de canchas"
          onClick={() => setExpanded(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-3 backdrop-blur-sm sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-white/20 sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-display text-xl font-extrabold uppercase text-ink sm:text-2xl">
                Croquis de canchas · Córdoba Rugby Club
              </p>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Cerrar croquis ampliado"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ink text-white transition hover:bg-brand"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <CroquisSvg selected={selected} onSelect={setSelected} />
          </div>
        </div>
      )}
    </div>
  )
}
