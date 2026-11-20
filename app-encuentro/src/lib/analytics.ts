"use client"

import { track } from "@vercel/analytics"
import {
  applyEventsToSnapshot,
  createEmptySnapshot,
  normalizeSnapshot,
  type AnalyticsDevice,
  type AnalyticsEventItem,
  type AnalyticsEventType,
  type AnalyticsMode,
  type AnalyticsSnapshot,
} from "@/lib/analytics-schema"

const VISITOR_ID_KEY = "encuentro-visitor-id"
const VISITED_BEFORE_KEY = "encuentro-visited-before"
const SESSION_ID_KEY = "encuentro-session-id"
const SESSION_STARTED_KEY = "encuentro-session-started"
const QUEUE_KEY = "encuentro-analytics-queue-v1"
const LOCAL_SNAPSHOT_KEY = "encuentro-analytics-local-v1"

let flushTimer: number | null = null
let flushing = false

function makeId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

export function getVisitorInfo(): { visitorId: string; isReturning: boolean } {
  if (typeof window === "undefined") return { visitorId: "srv", isReturning: false }
  try {
    let visitorId = window.localStorage.getItem(VISITOR_ID_KEY)
    const visitedBefore = window.localStorage.getItem(VISITED_BEFORE_KEY) === "1"
    const isReturning = Boolean(visitorId) && visitedBefore
    if (!visitorId) {
      visitorId = makeId("v")
      window.localStorage.setItem(VISITOR_ID_KEY, visitorId)
    }
    window.localStorage.setItem(VISITED_BEFORE_KEY, "1")
    return { visitorId, isReturning }
  } catch {
    return { visitorId: makeId("v"), isReturning: false }
  }
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "srv_session"
  try {
    let sid = window.sessionStorage.getItem(SESSION_ID_KEY)
    if (!sid) {
      sid = makeId("s")
      window.sessionStorage.setItem(SESSION_ID_KEY, sid)
    }
    return sid
  } catch {
    return makeId("s")
  }
}

export function hasSessionFlag(flagKey: string): boolean {
  if (typeof window === "undefined") return true
  try {
    return window.sessionStorage.getItem(flagKey) === "1"
  } catch {
    return false
  }
}

export function setSessionFlag(flagKey: string): void {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(flagKey, "1")
  } catch {
    // Ignorar en modo privado estricto
  }
}

export function detectDevice(): AnalyticsDevice {
  if (typeof window === "undefined") return "desktop"
  const ua = window.navigator.userAgent.toLowerCase()
  if (/android/.test(ua)) return "android"
  if (
    /iphone|ipad|ipod/.test(ua) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1)
  ) {
    return "ios"
  }
  return "desktop"
}

export function detectMode(): AnalyticsMode {
  if (typeof window === "undefined") return "browser"
  const nav = window.navigator as Navigator & { standalone?: boolean }
  if (nav.standalone === true) return "pwa"
  if (
    ["standalone", "fullscreen", "minimal-ui"].some(
      (mode) => window.matchMedia(`(display-mode: ${mode})`).matches
    )
  ) {
    return "pwa"
  }
  return "browser"
}

function readQueue(): AnalyticsEventItem[] {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeQueue(events: AnalyticsEventItem[]): void {
  try {
    if (events.length === 0) {
      window.localStorage.removeItem(QUEUE_KEY)
    } else {
      window.localStorage.setItem(QUEUE_KEY, JSON.stringify(events.slice(-200)))
    }
  } catch {
    // Sin espacio en localStorage
  }
}

export function readLocalAnalyticsMirror(): AnalyticsSnapshot {
  if (typeof window === "undefined") return createEmptySnapshot()
  try {
    const raw = window.localStorage.getItem(LOCAL_SNAPSHOT_KEY)
    if (!raw) return createEmptySnapshot()
    return normalizeSnapshot(JSON.parse(raw))
  } catch {
    return createEmptySnapshot()
  }
}

export function clearLocalAnalyticsMirror(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(LOCAL_SNAPSHOT_KEY)
    window.localStorage.removeItem(QUEUE_KEY)
  } catch {
    // Ignorar
  }
}

function updateLocalMirror(events: AnalyticsEventItem[]): void {
  try {
    const current = readLocalAnalyticsMirror()
    const next = applyEventsToSnapshot(current, events)
    window.localStorage.setItem(LOCAL_SNAPSHOT_KEY, JSON.stringify(next))
  } catch {
    // Ignorar
  }
}

export async function flushAnalyticsQueue(useBeacon = false): Promise<void> {
  if (typeof window === "undefined") return
  if (!window.navigator.onLine) return
  if (flushing && !useBeacon) return

  const queue = readQueue()
  if (queue.length === 0) return

  const batch = queue.slice(0, 50)
  const payload = JSON.stringify({ action: "track", events: batch })

  if (useBeacon && typeof window.navigator.sendBeacon === "function") {
    try {
      const sent = window.navigator.sendBeacon(
        "/api/analytics",
        new Blob([payload], { type: "application/json" })
      )
      if (sent) {
        const sentIds = new Set(batch.map((e) => e.id))
        writeQueue(readQueue().filter((e) => !sentIds.has(e.id)))
      }
      return
    } catch {
      // Continuar con fetch keepalive
    }
  }

  flushing = true
  try {
    const res = await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: useBeacon,
    })
    if (res.ok) {
      const sentIds = new Set(batch.map((e) => e.id))
      const remaining = readQueue().filter((e) => !sentIds.has(e.id))
      writeQueue(remaining)
      if (remaining.length > 0 && window.navigator.onLine) {
        scheduleFlush(500)
      }
    }
  } catch {
    // Reintentar cuando vuelva conexión o en próximo evento
  } finally {
    flushing = false
  }
}

function scheduleFlush(delayMs = 2000): void {
  if (typeof window === "undefined") return
  if (flushTimer !== null) {
    window.clearTimeout(flushTimer)
  }
  flushTimer = window.setTimeout(() => {
    flushTimer = null
    void flushAnalyticsQueue(false)
  }, delayMs)
}

function sendToVercelAnalytics(
  type: AnalyticsEventType,
  meta?: Record<string, string | number | boolean>
): void {
  if (type === "heartbeat") return
  try {
    if (!meta) {
      track(type)
      return
    }
    const cleanProps: Record<string, string | number | boolean> = {}
    for (const [key, value] of Object.entries(meta)) {
      if (typeof value === "string") cleanProps[key] = value.slice(0, 200)
      else if (typeof value === "number" || typeof value === "boolean") cleanProps[key] = value
    }
    track(type, cleanProps)
  } catch {
    // Bloqueador de anuncios o sin script de Vercel Analytics
  }
}

export function trackEvent(
  type: AnalyticsEventType,
  meta?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return
  if (window.location.pathname.startsWith("/panel")) return

  const { visitorId } = getVisitorInfo()
  const sessionId = getSessionId()
  const event: AnalyticsEventItem = {
    id: makeId("ev"),
    type,
    ts: Date.now(),
    visitorId,
    sessionId,
    device: detectDevice(),
    mode: detectMode(),
    online: window.navigator.onLine,
    ...(meta ? { meta } : {}),
  }

  sendToVercelAnalytics(type, meta)
  updateLocalMirror([event])

  const nextQueue = [...readQueue(), event]
  writeQueue(nextQueue)

  if (window.navigator.onLine) {
    const immediate = type === "session_start" || type === "photo_upload_success" || type === "pwa_installed"
    scheduleFlush(immediate ? 400 : 2000)
  }
}

export function isSessionAlreadyStarted(): boolean {
  return hasSessionFlag(SESSION_STARTED_KEY)
}

export function markSessionStarted(): void {
  setSessionFlag(SESSION_STARTED_KEY)
}
