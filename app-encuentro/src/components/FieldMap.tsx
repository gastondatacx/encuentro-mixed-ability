"use client"

import { useEffect, useState } from "react"
import {
  Ambulance,
  ArrowUpRight,
  Car,
  Cross,
  Droplets,
  Maximize2,
  Mic,
  ShowerHead,
  Users,
  Utensils,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ZoneId =
  | "all"
  | "rugby-1"
  | "rugby-2-3"
  | "rugby-4"
  | "hockey"
  | "basquet"
  | "central"
  | "accesos"

interface ZoneInfo {
  id: Exclude<ZoneId, "all">
  pillLabel: string
  title: string
  badge: string
  details: string
  services: string[]
}

const LEGEND_ITEMS = [
  { label: "Estacionamiento", icon: Car, color: "bg-brand" },
  { label: "Médico", icon: Cross, color: "bg-berry" },
  { label: "Ambulancia", icon: Ambulance, color: "bg-berry" },
  { label: "Escenario", icon: Mic, color: "bg-grape" },
  { label: "Comedor", icon: Utensils, color: "bg-tangerine" },
  { label: "Puesto hidratación", icon: Droplets, color: "bg-sky" },
  { label: "2 Ingresos", icon: ArrowUpRight, color: "bg-ink" },
  { label: "Duchas", icon: ShowerHead, color: "bg-tangerine" },
  { label: "Baños", icon: Users, color: "bg-tangerine" },
] as const

const ZONES: ZoneInfo[] = [
  {
    id: "rugby-1",
    pillLabel: "Rugby 1 + Postas",
    title: "Cancha Rugby 1 y Postas Rugby",
    badge: "Categoría A · Pre Mix · Desfile",
    details:
      "Cancha principal del predio, ubicada en el sector este sobre el acceso vehicular. Al norte limita con Postas Rugby y al oeste con la Mesa de Control, Carpa de artistas / Streaming, Escenario y Ambulancia.",
    services: ["Categoría A (Pre Mix)", "Postas Rugby", "Mesa de Control", "Carpa Streaming", "Ambulancia"],
  },
  {
    id: "rugby-2-3",
    pillLabel: "Rugby 2 y 3 (2a·2b·3a·3b)",
    title: "Canchas Rugby 2 (2a·2b) y Rugby 3 (3a·3b)",
    badge: "Categoría B · Recreativo (4 subcanchas)",
    details:
      "Sector oeste con dos canchas paralelas subdivididas en 4 subcanchas transversales (2a, 2b, 3a y 3b). Entre ambas se ubican la Mesa de Control y un Puesto de Hidratación.",
    services: ["Canchas 2a, 2b, 3a y 3b", "Mesa de Control", "Puesto Hidratación", "Baños al noreste"],
  },
  {
    id: "rugby-4",
    pillLabel: "Rugby 4",
    title: "Cancha Rugby 4",
    badge: "Categoría A · Pre Mix · Sector Norte",
    details:
      "Cancha ubicada en el sector norte del club, con Mesa de Control y Puesto de Hidratación propios sobre su acceso sur.",
    services: ["Categoría A (Pre Mix)", "Mesa de Control", "Puesto Hidratación"],
  },
  {
    id: "hockey",
    pillLabel: "Hockey",
    title: "Cancha de Hockey",
    badge: "Sector Suroeste · Junto al ingreso",
    details:
      "Ubicada inmediatamente a la izquierda del ingreso principal por Av. Juan B. Justo 6500. Cuenta con Carpa de Autoridades al norte y Mesa de Control, Hidratación, Duchas y Baños sobre su frente sur.",
    services: ["Carpa Autoridades", "Mesa de Control", "Puesto Hidratación", "Duchas y Baños"],
  },
  {
    id: "basquet",
    pillLabel: "Básquet",
    title: "Cancha de Básquet",
    badge: "Sector Noreste · Edificio",
    details:
      "Sector de Básquet Mixed Ability ubicado en el complejo edilicio del noreste del predio, cruzando la calle interna hacia el norte de Rugby 1.",
    services: ["Básquet Mixed Ability", "Acceso por calle interna este"],
  },
  {
    id: "central",
    pillLabel: "Gazebos · Comedor · Escenario",
    title: "Corredor Central de Delegaciones y Servicios",
    badge: "Corazón del encuentro",
    details:
      "Eje central entre Rugby 2/3 y Rugby 1 donde se encuentran los Gazebos de todas las delegaciones, Baños, Médico / Kinesiología, Hidratación, Escenario principal, Comedor (retiro de viandas y ágape), Acreditaciones y Cantina.",
    services: ["Gazebos Delegaciones", "Acreditaciones", "Comedor", "Escenario", "Médico / Kinesiología", "Cantina"],
  },
  {
    id: "accesos",
    pillLabel: "Ingresos y Estacionamiento",
    title: "Av. Juan B. Justo 6500 · 2 Ingresos y Estacionamiento",
    badge: "Accesos al Club",
    details:
      "Dos ingresos señalados sobre Av. Juan B. Justo 6500 (acceso central peatonal/vehicular frente a Hockey y acceso este hacia el estacionamiento lateral). Estacionamiento interno en forma de L ($5.000).",
    services: ["Ingreso Central", "Ingreso Este", "Estacionamiento interno", "Duchas y Baños cercanos"],
  },
]

export function FieldMap() {
  const [selected, setSelected] = useState<ZoneId>("all")
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

  const activeInfo = selected === "all" ? null : ZONES.find((z) => z.id === selected) ?? null

  return (
    <div className="mt-16 rounded-3xl bg-paper p-5 ring-1 ring-ink/10 sm:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
            Guía Oficial · Plano del club
          </p>
          <h3 className="mt-1 font-display text-3xl font-extrabold uppercase text-ink">
            Mapa oficial del predio
          </h3>
          <p className="mt-1 text-sm text-ink/65">
            Ubicá las canchas de Rugby (1, 2, 3, 4), Hockey, Básquet, los 2 ingresos por Av. Juan B. Justo 6500, gazebos, comedor y puestos médicos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-ink ring-1 ring-ink/15 transition hover:ring-ink"
        >
          <Maximize2 className="h-4 w-4 text-brand" />
          Ampliar mapa
        </button>
      </div>

      {/* Referencias oficiales de la Hoja 2 */}
      <ul className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {LEGEND_ITEMS.map(({ label, icon: Icon, color }) => (
          <li
            key={label}
            className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-xs font-bold text-ink ring-1 ring-ink/10"
          >
            <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white", color)}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="truncate">{label}</span>
          </li>
        ))}
      </ul>

      {/* Selector rápido de sectores */}
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Consultar sector del mapa">
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
          Todo el predio
        </button>
        {ZONES.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => setSelected(selected === zone.id ? "all" : zone.id)}
            className={cn(
              "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition sm:text-sm",
              selected === zone.id
                ? "bg-brand text-white"
                : "bg-white text-ink/75 ring-1 ring-ink/10 hover:text-ink"
            )}
          >
            {zone.pillLabel}
          </button>
        ))}
      </div>

      {/* Mapa oficial 3D */}
      <div className="overflow-hidden rounded-2xl bg-[#07183c] p-2 shadow-sm ring-1 ring-ink/10 sm:p-4">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mapa-predio.jpg"
            alt="Mapa oficial de Córdoba Rugby Club con ubicación de canchas, ingresos, gazebos, comedor y servicios"
            className="block h-auto w-full cursor-zoom-in"
            onClick={() => setExpanded(true)}
          />
        </div>
      </div>

      {/* Detalle del sector seleccionado */}
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
              {activeInfo.services.map((svc) => (
                <li
                  key={svc}
                  className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/75"
                >
                  {svc}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <h4 className="font-display text-xl font-bold uppercase text-ink">
              Distribución completa de Córdoba Rugby Club
            </h4>
            <p className="mt-1 text-sm text-ink/65">
              Dos ingresos sobre Av. Juan B. Justo 6500 con estacionamiento interno. Canchas de Rugby 1, 2 (2a·2b), 3 (3a·3b), 4, Postas Rugby, Hockey y Básquet, con el corredor central de Gazebos, Comedor, Escenario, Acreditaciones, Médico y Ambulancia.
            </p>
          </div>
        )}
      </div>

      {/* Modal ampliado */}
      {expanded && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mapa ampliado del predio"
          onClick={() => setExpanded(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-3 backdrop-blur-sm sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-[#07183c] p-3 shadow-2xl ring-1 ring-white/20 sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-display text-xl font-extrabold uppercase text-white sm:text-2xl">
                Mapa Oficial · Córdoba Rugby Club
              </p>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Cerrar mapa ampliado"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-ink transition hover:bg-sky hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mapa-predio.jpg"
              alt="Mapa oficial de Córdoba Rugby Club"
              className="block h-auto w-full rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
