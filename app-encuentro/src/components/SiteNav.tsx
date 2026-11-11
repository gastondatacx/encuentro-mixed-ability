"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { CalendarDays, Camera, Home, MapPin, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const LINKS = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "equipos", label: "Equipos", icon: Users },
  { id: "sede", label: "Sede", icon: MapPin },
  { id: "fotos", label: "Fotos", icon: Camera },
] as const

function useActiveSection() {
  const [active, setActive] = useState<string>("inicio")

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null
    )
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return active
}

export function SiteNav() {
  const active = useActiveSection()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      {/* Barra superior */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-300",
          scrolled
            ? "border-b border-ink/10 bg-white/85 shadow-sm backdrop-blur-lg"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="#inicio" className="flex items-center gap-2.5" aria-label="Ir al inicio">
            <span className="relative h-9 w-[58px] overflow-hidden rounded-md bg-white ring-1 ring-ink/10">
              <Image src="/logo.png" alt="" fill sizes="58px" className="object-contain" />
            </span>
            <span className="font-display text-lg font-bold uppercase leading-none tracking-wide text-ink">
              Encuentro MA
              <span className="block text-xs font-semibold tracking-[0.2em] text-brand">
                Córdoba 2026
              </span>
            </span>
          </a>

          <nav aria-label="Secciones" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    aria-current={active === link.id ? "true" : undefined}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                      active === link.id
                        ? "bg-brand text-white"
                        : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contacto"
                  className="ml-2 rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-white"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Barra inferior (móvil) */}
      <nav
        aria-label="Secciones"
        className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-ink/10 bg-white/95 shadow-[0_10px_40px_-10px_rgba(11,22,64,0.45)] backdrop-blur-lg md:hidden"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid grid-cols-5">
          {LINKS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors",
                    isActive ? "text-brand" : "text-ink/55"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                      isActive && "bg-brand/10"
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  {label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
