"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { SECTION_IDS, type AnalyticsEventType } from "@/lib/analytics-schema"
import {
  flushAnalyticsQueue,
  getVisitorInfo,
  hasSessionFlag,
  isSessionAlreadyStarted,
  markSessionStarted,
  setSessionFlag,
  trackEvent,
} from "@/lib/analytics"

const OFFLINE_LOGGED_KEY = "encuentro-offline-logged"

export function AnalyticsTracker() {
  const pathname = usePathname()
  const seenSectionsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!pathname || pathname.startsWith("/panel")) return

    if (!isSessionAlreadyStarted()) {
      markSessionStarted()
      const { isReturning } = getVisitorInfo()
      trackEvent("session_start", { isReturning })
    }

    const logOfflineOnce = () => {
      if (!hasSessionFlag(OFFLINE_LOGGED_KEY)) {
        setSessionFlag(OFFLINE_LOGGED_KEY)
        trackEvent("offline_usage")
      }
    }

    if (!window.navigator.onLine) {
      logOfflineOnce()
    } else {
      void flushAnalyticsQueue(false)
    }

    const onOnline = () => {
      void flushAnalyticsQueue(false)
    }
    const onOffline = () => {
      logOfflineOnce()
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void flushAnalyticsQueue(true)
      }
    }
    const onPageHide = () => {
      void flushAnalyticsQueue(true)
    }

    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    document.addEventListener("visibilitychange", onVisibilityChange)
    window.addEventListener("pagehide", onPageHide)

    // Latido de permanencia cada 30s mientras la pestaña está visible
    const heartbeatTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        trackEvent("heartbeat", { durationSec: 30 })
      }
    }, 30_000)

    // Seguimiento de secciones vistas con permanencia mínima de 1.2s
    const sectionTimers = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id
          if (!id || seenSectionsRef.current.has(id)) continue

          if (entry.isIntersecting) {
            if (!sectionTimers.has(id)) {
              const t = window.setTimeout(() => {
                sectionTimers.delete(id)
                if (!seenSectionsRef.current.has(id)) {
                  seenSectionsRef.current.add(id)
                  trackEvent("section_view", { section: id })
                }
              }, 1200)
              sectionTimers.set(id, t)
            }
          } else {
            const existing = sectionTimers.get(id)
            if (existing !== undefined) {
              window.clearTimeout(existing)
              sectionTimers.delete(id)
            }
          }
        }
      },
      { threshold: 0.25 }
    )

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    // Delegación global de clics para botones/enlaces en Server Components
    const onDocumentClick = (e: MouseEvent) => {
      const target = e.target as Element | null
      const tracked = target?.closest<HTMLElement>("[data-track-event]")
      if (!tracked) return
      const eventType = tracked.dataset.trackEvent as AnalyticsEventType | undefined
      if (!eventType) return
      let meta: Record<string, string | number | boolean> | undefined
      if (tracked.dataset.trackMeta) {
        try {
          meta = JSON.parse(tracked.dataset.trackMeta) as Record<string, string | number | boolean>
        } catch {
          meta = undefined
        }
      }
      trackEvent(eventType, meta)
    }

    document.addEventListener("click", onDocumentClick)

    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("pagehide", onPageHide)
      document.removeEventListener("click", onDocumentClick)
      window.clearInterval(heartbeatTimer)
      sectionTimers.forEach((t) => window.clearTimeout(t))
      sectionTimers.clear()
      observer.disconnect()
      void flushAnalyticsQueue(true)
    }
  }, [pathname])

  return null
}
