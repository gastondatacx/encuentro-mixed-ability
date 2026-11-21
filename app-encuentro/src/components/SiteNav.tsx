"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { BookOpen, CalendarDays, Camera, Home, Lock, MapPin, Trophy, Users } from "lucide-react"
import { ShareButton } from "@/components/ShareButton"
import { UsabilityPanel } from "@/components/UsabilityPanel"
import { trackEvent } from "@/lib/analytics"
import { cn } from "@/lib/utils"

const LINKS = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "fixture", label: "Fixture", icon: Trophy },
  { id: "equipos", label: "Equipos", icon: Users },
  { id: "sede", label: "Sede", icon: MapPin },
  { id: "guia", label: "Guía", icon: BookOpen },
  { id: "fotos", label: "Fotos", icon: Camera },
] as const

function useActiveSection() {
  const [active, setActive] = useState<string>("inicio")

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null
    )
    if (!sections.length) return

    let rafId: number | null = null
    const updateActive = () => {
      rafId = null
      const anchorY = Math.min(window.innerHeight * 0.35, 220)
      let current = sections[0].id
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= anchorY) {
          current = section.id
        } else {
          break
        }
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40) {
        current = sections[sections.length - 1].id
      }
      setActive((prev) => (prev === current ? prev : current))
    }

    const onScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateActive)
      }
    }

    updateActive()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return active
}

export function SiteNav() {
  const active = useActiveSection()
  const [scrolled, setScrolled] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const openPanel = () => setPanelOpen(true)
    window.addEventListener("open-usability-panel", openPanel)
    return () => window.removeEventListener("open-usability-panel", openPanel)
  }, [])

  useEffect(() => {
    if (!panelOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [panelOpen])

  return (
    <>
      {/* Barra superior */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-colors duration-200",
          scrolled
            ? "border-b border-ink/10 bg-white/85 shadow-sm backdrop-blur-lg"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="#inicio" className="flex items-center gap-2.5" aria-label="Ir al inicio">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-ink/10">
              <Image src="/icon-192.png" alt="" fill sizes="40px" loading="eager" className="object-contain p-0.5" />
            </span>
            <span className="font-display text-lg font-bold uppercase leading-none tracking-wide text-ink">
              9º Encuentro 2026
              <span className="block text-xs font-semibold tracking-[0.18em] text-brand">
                Mixed Ability · Córdoba
              </span>
            </span>
          </a>

          <div className="flex items-center gap-2">
            <nav aria-label="Secciones" className="hidden md:block">
              <ul className="flex items-center gap-1">
                {LINKS.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      aria-current={active === link.id ? "true" : undefined}
                      onClick={() => trackEvent("nav_click", { section: link.id })}
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
                    onClick={() => trackEvent("nav_click", { section: "contacto" })}
                    className="ml-2 rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-white"
                  >
                    Contacto
                  </a>
                </li>
              </ul>
            </nav>

            <ShareButton className="rounded-full bg-brand/10 px-3.5 py-2 text-xs font-bold text-brand ring-1 ring-brand/20 hover:bg-brand hover:text-white sm:text-sm" />
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              aria-label="Abrir panel de usabilidad"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink/5 px-3 py-2 text-xs font-bold text-ink/80 ring-1 ring-ink/15 transition hover:bg-ink hover:text-white sm:text-sm"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Panel</span>
            </button>
          </div>
        </div>
      </header>

      {/* Barra inferior (móvil) */}
      <nav
        aria-label="Secciones"
        className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-ink/10 bg-white/95 shadow-[0_10px_40px_-10px_rgba(11,22,64,0.45)] backdrop-blur-lg md:hidden"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid grid-cols-7">
          {LINKS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => trackEvent("nav_click", { section: id })}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors",
                    isActive ? "text-brand" : "text-ink/55"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-9 items-center justify-center rounded-full transition-colors",
                      isActive && "bg-brand/10"
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  {label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {panelOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Panel de Usabilidad"
          className="fixed inset-0 z-50 overflow-y-auto bg-paper"
        >
          <UsabilityPanel onClose={() => setPanelOpen(false)} />
        </div>
      )}
    </>
  )
}

