"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Maximize2, X } from "lucide-react"
import { trackEvent } from "@/lib/analytics"

function PictogramParking() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 drop-shadow-sm" aria-hidden="true">
      <circle cx="18" cy="18" r="16.5" fill="#182b73" stroke="#ffffff" strokeWidth="2" />
      <circle cx="18" cy="18" r="14" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="0.9" />
      {/* Auto visto de frente */}
      <path
        d="M12.2 15 L13.8 10.6 C14.1 9.8 14.8 9.4 15.6 9.4 H20.4 C21.2 9.4 21.9 9.8 22.2 10.6 L23.8 15 Z"
        fill="#ffffff"
      />
      <path d="M13.8 14.6 L14.8 11.4 H21.2 L22.2 14.6 Z" fill="#182b73" />
      <rect x="9.5" y="14.5" width="17" height="7.5" rx="2.4" fill="#ffffff" />
      <circle cx="12.5" cy="18.2" r="1.4" fill="#182b73" />
      <circle cx="23.5" cy="18.2" r="1.4" fill="#182b73" />
      <rect x="15.3" y="17.6" width="5.4" height="1.3" rx="0.6" fill="#182b73" />
      <rect x="10.7" y="21.4" width="3.2" height="3.2" rx="1" fill="#ffffff" />
      <rect x="22.1" y="21.4" width="3.2" height="3.2" rx="1" fill="#ffffff" />
    </svg>
  )
}

function PictogramMedic() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 drop-shadow-sm" aria-hidden="true">
      <circle cx="18" cy="18" r="16.5" fill="#e31e24" stroke="#ffffff" strokeWidth="2" />
      <rect x="14.7" y="8.5" width="6.6" height="19" rx="1.2" fill="#ffffff" />
      <rect x="8.5" y="14.7" width="19" height="6.6" rx="1.2" fill="#ffffff" />
    </svg>
  )
}

function PictogramAmbulance() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 drop-shadow-sm" aria-hidden="true">
      <circle cx="18" cy="18" r="16.5" fill="#e31e24" stroke="#ffffff" strokeWidth="2" />
      {/* Sirena */}
      <rect x="20.5" y="9.8" width="2.8" height="2" rx="0.8" fill="#ffffff" />
      {/* Carrocería ambulancia */}
      <path
        d="M8.5 13 C8.5 12 9.3 11.4 10.3 11.4 H21.6 C22.5 11.4 23.3 11.9 23.8 12.7 L26.1 16.2 H27.5 C28.2 16.2 28.7 16.8 28.7 17.5 V22.4 C28.7 23 28.2 23.5 27.5 23.5 H9.7 C9 23.5 8.5 23 8.5 22.3 Z"
        fill="#ffffff"
      />
      {/* Ventana cabina */}
      <path d="M21.8 12.8 H23.3 L25.1 15.9 H21.8 Z" fill="#e31e24" />
      {/* Cruz médica */}
      <rect x="14.1" y="14.3" width="2.2" height="6" rx="0.4" fill="#e31e24" />
      <rect x="12.2" y="16.2" width="6" height="2.2" rx="0.4" fill="#e31e24" />
      {/* Ruedas */}
      <circle cx="13" cy="23.8" r="2.6" fill="#e31e24" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="24.3" cy="23.8" r="2.6" fill="#e31e24" stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  )
}

function PictogramStage() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 drop-shadow-sm" aria-hidden="true">
      <circle cx="18" cy="18" r="16.5" fill="#b84cc9" stroke="#ffffff" strokeWidth="2" />
      <circle cx="18" cy="18" r="14" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="0.9" />
      {/* Estructura de escenario */}
      <rect x="9.5" y="10.2" width="17" height="2.3" rx="0.8" fill="#ffffff" />
      <rect x="10.2" y="12.2" width="2.1" height="13.2" rx="0.6" fill="#ffffff" />
      <rect x="23.7" y="12.2" width="2.1" height="13.2" rx="0.6" fill="#ffffff" />
      <rect x="8.8" y="24.5" width="18.4" height="2" rx="0.8" fill="#ffffff" />
      {/* Micrófono de pie central */}
      <rect x="16.3" y="14.2" width="3.4" height="5.2" rx="1.7" fill="#ffffff" />
      <path d="M15 17.8 C15 19.8 16.3 21 18 21 C19.7 21 21 19.8 21 17.8" fill="none" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="18" y1="21" x2="18" y2="24.5" stroke="#ffffff" strokeWidth="1.6" />
    </svg>
  )
}

function PictogramDining() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 drop-shadow-sm" aria-hidden="true">
      <circle cx="18" cy="18" r="16.5" fill="#f58220" stroke="#ffffff" strokeWidth="2" />
      {/* Pan superior */}
      <path d="M10.2 15.8 C10.2 10.6 25.8 10.6 25.8 15.8 Z" fill="#ffffff" />
      {/* Lechuga y medallón */}
      <path
        d="M9.6 17.4 C11 16.6 12.2 18.2 13.7 17.4 C15.2 16.6 16.4 18.2 18 17.4 C19.6 16.6 20.8 18.2 22.3 17.4 C23.8 16.6 25 18.2 26.4 17.4"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <rect x="9.6" y="19.1" width="16.8" height="2.6" rx="1.3" fill="#ffffff" />
      {/* Pan inferior */}
      <path d="M10.4 22.8 H25.6 V23.8 C25.6 25 24.6 25.8 23.4 25.8 H12.6 C11.4 25.8 10.4 25 10.4 23.8 Z" fill="#ffffff" />
    </svg>
  )
}

function PictogramHydration() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 drop-shadow-sm" aria-hidden="true">
      <circle cx="18" cy="18" r="16.5" fill="#2488c6" stroke="#ffffff" strokeWidth="2" />
      <circle cx="18" cy="18" r="13.4" fill="none" stroke="#ffffff" strokeWidth="1.2" />
      {/* Gota de agua */}
      <path
        d="M18 8.6 C18 8.6 11.8 16.2 11.8 20.8 A6.2 6.2 0 0 0 24.2 20.8 C24.2 16.2 18 8.6 18 8.6 Z"
        fill="#ffffff"
      />
      <path
        d="M14.7 20.5 A3.5 3.5 0 0 0 18.2 24"
        fill="none"
        stroke="#2488c6"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PictogramEntrances() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 drop-shadow-sm" aria-hidden="true">
      <path
        d="M18 4.8 L29.5 16.8 H22.8 V30.8 H13.2 V16.8 H6.5 Z"
        fill="#ffffff"
        stroke="#182b73"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PictogramShowers() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 drop-shadow-sm" aria-hidden="true">
      <circle cx="18" cy="18" r="16.5" fill="#f3914f" stroke="#ffffff" strokeWidth="2" />
      {/* Flor de ducha arriba a la izquierda */}
      <path d="M10.5 15 L14.5 11 L16.2 12.7 L12.2 16.7 Z" fill="#ffffff" />
      <path d="M10.2 11.2 H13.4 L14.2 12" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      {/* Chorros de agua */}
      <line x1="15.2" y1="15.2" x2="17.5" y2="17.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="1.5 2" />
      <line x1="13.5" y1="17" x2="15.8" y2="19.3" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="1.5 2" />
      <line x1="17" y1="13.6" x2="19.3" y2="15.9" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="1.5 2" />
      {/* Persona debajo de la ducha */}
      <circle cx="22" cy="19.6" r="2.6" fill="#ffffff" />
      <path d="M17.2 26.8 C17.4 24 19.4 22.8 22 22.8 C24.6 22.8 26.6 24 26.8 26.8 Z" fill="#ffffff" />
    </svg>
  )
}

function PictogramRestrooms() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 drop-shadow-sm" aria-hidden="true">
      <circle cx="18" cy="18" r="16.5" fill="#f3914f" stroke="#ffffff" strokeWidth="2" />
      {/* Mujer (izquierda) */}
      <circle cx="12.5" cy="11.2" r="2" fill="#ffffff" />
      <path d="M10.8 14 H14.2 L15.6 21.2 H13.8 V26.2 H11.2 V21.2 H9.4 Z" fill="#ffffff" />
      {/* Línea divisoria */}
      <line x1="18" y1="9.5" x2="18" y2="26.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
      {/* Varón (derecha) */}
      <circle cx="23.5" cy="11.2" r="2" fill="#ffffff" />
      <path d="M21 14 H26 C26.6 14 27 14.4 27 15 V20.2 H25.3 V26.2 H21.7 V20.2 H20 V15 C20 14.4 20.4 14 21 14 Z" fill="#ffffff" />
    </svg>
  )
}

const LEGEND_ITEMS: Array<{ label: string; pictogram: () => ReactNode }> = [
  { label: "Estacionamiento", pictogram: () => <PictogramParking /> },
  { label: "Médico", pictogram: () => <PictogramMedic /> },
  { label: "Ambulancia", pictogram: () => <PictogramAmbulance /> },
  { label: "Escenario", pictogram: () => <PictogramStage /> },
  { label: "Comedor", pictogram: () => <PictogramDining /> },
  { label: "Puesto hidratación", pictogram: () => <PictogramHydration /> },
  { label: "2 Ingresos", pictogram: () => <PictogramEntrances /> },
  { label: "Duchas", pictogram: () => <PictogramShowers /> },
  { label: "Baños", pictogram: () => <PictogramRestrooms /> },
]

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

      {/* Referencias pictográficas idénticas a los marcadores del mapa */}
      <ul className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {LEGEND_ITEMS.map(({ label, pictogram }) => (
          <li
            key={label}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white px-2 py-2.5 text-center text-xs font-bold leading-tight text-ink ring-1 ring-ink/10"
          >
            {pictogram()}
            <span>{label}</span>
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
