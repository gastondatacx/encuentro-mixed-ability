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
import { trackEvent } from "@/lib/analytics"
import { cn } from "@/lib/utils"

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

export function FieldMap() {
  const [expanded, setExpanded] = useState(false)

  const openExpanded = () => {
    setExpanded(true)
    trackEvent("map_expand")
  }

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
          onClick={openExpanded}
          className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-ink ring-1 ring-ink/15 transition hover:ring-ink"
        >
          <Maximize2 className="h-4 w-4 text-brand" />
          Ampliar mapa
        </button>
      </div>

      {/* Referencias oficiales de la Hoja 2 */}
      <ul className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
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

      {/* Mapa oficial 3D */}
      <div className="overflow-hidden rounded-2xl bg-[#07183c] p-2 shadow-sm ring-1 ring-ink/10 sm:p-4">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mapa-predio.jpg?v=2"
            alt="Mapa oficial de Córdoba Rugby Club con ubicación de canchas, ingresos, gazebos, comedor y servicios"
            className="block h-auto w-full cursor-zoom-in"
            onClick={openExpanded}
          />
        </div>
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
              src="/mapa-predio.jpg?v=2"
              alt="Mapa oficial de Córdoba Rugby Club"
              className="block h-auto w-full rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
