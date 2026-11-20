"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Camera,
  Check,
  Clock,
  Cloud,
  CloudOff,
  Copy,
  Download,
  ExternalLink,
  HelpCircle,
  Lock,
  LogOut,
  MapPin,
  Radio,
  RefreshCw,
  Search,
  Share2,
  Smartphone,
  Trophy,
  Users,
  WifiOff,
  X,
} from "lucide-react"
import { ANALYTICS_PIN, EVENT } from "@/data/encuentro"
import { flushAnalyticsQueue } from "@/lib/analytics"
import {
  SECTION_IDS,
  SECTION_LABELS,
  createEmptySnapshot,
  normalizeSnapshot,
  type AnalyticsSnapshot,
} from "@/lib/analytics-schema"
import { cn } from "@/lib/utils"

const PANEL_AUTH_KEY = "encuentro-panel-auth-v1"

const SECTION_COLORS: Record<string, string> = {
  inicio: "bg-brand",
  agenda: "bg-sky",
  fixture: "bg-tangerine",
  equipos: "bg-lime",
  sede: "bg-grape",
  guia: "bg-berry",
  fotos: "bg-brand-dark",
  contacto: "bg-ink",
}

function formatDuration(totalSec: number): string {
  const sec = Math.max(0, Math.round(totalSec))
  if (sec < 60) return `${sec}s`
  const mins = Math.floor(sec / 60)
  const rem = sec % 60
  if (mins < 60) return `${mins}m ${rem}s`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m`
}

function formatTimeAR(ts: number): string {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      timeZone: "America/Argentina/Cordoba",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(ts))
  } catch {
    return new Date(ts).toLocaleTimeString()
  }
}

function formatDateTimeAR(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      timeZone: "America/Argentina/Cordoba",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function formatFilterLabel(raw: string): string {
  if (raw === "sabado") return "Agenda: Sábado 21"
  if (raw === "domingo") return "Agenda: Domingo 22"
  if (raw.startsWith("deporte:")) {
    const val = raw.replace("deporte:", "")
    return val === "hockey" ? "Fixture: Deporte Hockey" : "Fixture: Deporte Rugby"
  }
  if (raw.startsWith("hockey_zona:")) {
    const val = raw.replace("hockey_zona:", "")
    if (val === "proyeccion") return "Hockey: Zona Proyección"
    if (val === "desarrollo") return "Hockey: Zona Desarrollo"
    return "Hockey: Todas las zonas"
  }
  if (raw.startsWith("hockey_cancha:")) {
    const val = raw.replace("hockey_cancha:", "")
    return val === "all" ? "Hockey: Todas las canchas" : `Hockey: Cancha ${val}`
  }
  if (raw.startsWith("categoria:")) {
    const val = raw.replace("categoria:", "")
    return val === "all" ? "Fixture: Todas las categorías" : `Fixture: Categoría ${val}`
  }
  if (raw.startsWith("bloque:")) {
    const val = raw.replace("bloque:", "")
    if (val === "manana") return "Fixture: Bloque Mañana"
    if (val === "tarde") return "Fixture: Bloque Tarde"
    return "Fixture: Todo el día"
  }
  if (raw.startsWith("cancha:")) {
    const val = raw.replace("cancha:", "")
    return val === "all" ? "Fixture: Todas las canchas" : `Fixture: Cancha ${val}`
  }
  return raw
}

function topEntries(map: Record<string, number>, limit = 10): Array<[string, number]> {
  return Object.entries(map)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

function sumValues(map: Record<string, number>): number {
  return Object.values(map).reduce((acc, v) => acc + v, 0)
}

export function UsabilityPanel() {
  const [unlocked, setUnlocked] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const [authError, setAuthError] = useState("")
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot>(() => createEmptySnapshot())
  const [driveConnected, setDriveConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null)

  const [showScriptModal, setShowScriptModal] = useState(false)
  const [scriptSource, setScriptSource] = useState<string | null>(null)
  const [copiedScript, setCopiedScript] = useState(false)

  const fetchMetrics = useCallback(async (includeScript = false) => {
    setLoading(true)
    setErrorMsg("")
    try {
      await flushAnalyticsQueue(false)
      const query = includeScript ? "?includeScript=1" : ""
      const res = await fetch(`/api/analytics${query}`, { cache: "no-store" })
      if (!res.ok) throw new Error("No se pudieron cargar las métricas.")
      const data = (await res.json()) as {
        ok: boolean
        driveConnected?: boolean
        snapshot?: unknown
        scriptSource?: string
      }
      if (data.snapshot) {
        setSnapshot(normalizeSnapshot(data.snapshot))
      }
      setDriveConnected(Boolean(data.driveConnected))
      if (data.scriptSource) setScriptSource(data.scriptSource)
      setLastFetchedAt(new Date().toISOString())
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error de conexión al leer el panel.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PANEL_AUTH_KEY)
      if (saved && saved === ANALYTICS_PIN) {
        setUnlocked(true)
      }
    } catch {
      // Ignorar errores de almacenamiento
    } finally {
      setCheckingAuth(false)
    }
  }, [])

  useEffect(() => {
    if (!unlocked) return
    void fetchMetrics(false)
  }, [unlocked, fetchMetrics])

  useEffect(() => {
    if (!unlocked || !autoRefresh) return
    const timer = window.setInterval(() => {
      void fetchMetrics(false)
    }, 15_000)
    return () => window.clearInterval(timer)
  }, [unlocked, autoRefresh, fetchMetrics])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError("")
    const candidate = pinInput.trim()
    if (!candidate) {
      setAuthError("Ingresá el PIN de acceso.")
      return
    }

    let valid = candidate === ANALYTICS_PIN
    if (!valid && window.navigator.onLine) {
      try {
        const res = await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "auth", pin: candidate }),
        })
        valid = res.ok
      } catch {
        valid = false
      }
    }

    if (!valid) {
      setAuthError("PIN incorrecto. Probá nuevamente.")
      return
    }

    try {
      window.localStorage.setItem(PANEL_AUTH_KEY, candidate)
    } catch {
      // Ignorar
    }
    setUnlocked(true)
    setPinInput("")
  }

  const handleLogout = () => {
    try {
      window.localStorage.removeItem(PANEL_AUTH_KEY)
    } catch {
      // Ignorar
    }
    setUnlocked(false)
  }

  const openScriptModal = () => {
    setShowScriptModal(true)
    if (!scriptSource) {
      void fetchMetrics(true)
    }
  }

  const copyScriptSource = async () => {
    if (!scriptSource) return
    try {
      await navigator.clipboard.writeText(scriptSource)
      setCopiedScript(true)
      window.setTimeout(() => setCopiedScript(false), 2500)
    } catch {
      // Ignorar si portapapeles está restringido
    }
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `usabilidad-encuentro-2026-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCsv = () => {
    const rows: string[][] = [
      ["Categoria", "Metrica", "Valor"],
      ["Resumen", "Sesiones totales", String(snapshot.totals.sessions)],
      ["Resumen", "Visitantes unicos", String(snapshot.totals.uniqueVisitors)],
      ["Resumen", "Sesiones recurrentes", String(snapshot.totals.returningSessions)],
      ["Resumen", "Sesiones activas (engagement)", String(snapshot.totals.engagedSessions)],
      ["Resumen", "Interacciones totales", String(snapshot.totals.interactions)],
      ["Resumen", "Duracion total (seg)", String(snapshot.totals.totalDurationSec)],
      ["Resumen", "Sesiones PWA", String(snapshot.totals.pwaSessions)],
      ["Resumen", "Instalaciones PWA", String(snapshot.totals.pwaInstalls)],
      ["Resumen", "Usos sin conexion", String(snapshot.totals.offlineSessions)],
      ["Album", "Fotos/videos subidos", String(snapshot.totals.photosUploaded)],
      ["Album", "En cola sin conexion", String(snapshot.totals.photosQueuedOffline)],
      ["Album", "Aperturas de Google Drive", String(snapshot.totals.driveAlbumClicks)],
      ["Acciones", "Ampliaciones de mapa", String(snapshot.totals.mapExpands)],
      ["Acciones", "Clics en Como llegar", String(snapshot.totals.directionsClicks)],
      ["Acciones", "Copias de direccion", String(snapshot.totals.addressCopies)],
      ["Acciones", "Compartir app", String(snapshot.totals.shareClicks)],
      ["Acciones", "Clics WhatsApp", String(snapshot.totals.whatsappClicks)],
      ["Acciones", "Clics Email", String(snapshot.totals.emailClicks)],
      ["Acciones", "Clics en Stream en vivo", String(snapshot.totals.streamClicks)],
    ]
    for (const secId of SECTION_IDS) {
      rows.push(["Seccion vista", SECTION_LABELS[secId], String(snapshot.sections[secId] ?? 0)])
    }
    for (const [team, count] of topEntries(snapshot.teamFichas, 50)) {
      rows.push(["Ficha equipo", team, String(count)])
    }
    for (const [term, count] of topEntries(snapshot.searchTerms, 50)) {
      rows.push(["Busqueda", term, String(count)])
    }
    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `usabilidad-encuentro-2026-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const derived = useMemo(() => {
    const now = Date.now()
    const activeEntries = Object.values(snapshot.activeVisitors)
    const active5m = activeEntries.filter((ts) => now - ts <= 5 * 60_000).length
    const active1h = activeEntries.filter((ts) => now - ts <= 60 * 60_000).length

    const sessions = snapshot.totals.sessions
    const engagementRate = sessions > 0 ? Math.round((snapshot.totals.engagedSessions / sessions) * 100) : 0
    const avgDurationSec = sessions > 0 ? Math.round(snapshot.totals.totalDurationSec / sessions) : 0
    const totalSectionViews = SECTION_IDS.reduce((acc, id) => acc + (snapshot.sections[id] ?? 0), 0)
    const avgSectionsPerSession = sessions > 0 ? (totalSectionViews / sessions).toFixed(1) : "0.0"
    const avgInteractionsPerSession =
      sessions > 0 ? (snapshot.totals.interactions / sessions).toFixed(1) : "0.0"

    const sportsQueries =
      sumValues(snapshot.teamFichas) +
      sumValues(snapshot.searchTerms) +
      sumValues(snapshot.fixtureFilters) +
      sumValues(snapshot.scheduleDays)

    const totalDevices = snapshot.devices.android + snapshot.devices.ios + snapshot.devices.desktop

    const hourEntries = Object.entries(snapshot.byHour)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-24)
    const maxHour = Math.max(1, ...hourEntries.map(([, c]) => c))

    const dayEntries = Object.entries(snapshot.byDay).sort((a, b) => b[0].localeCompare(a[0]))

    const filterRank = topEntries(
      {
        ...snapshot.scheduleDays,
        ...snapshot.fixtureFilters,
      },
      10
    )

    let thermometer: { label: string; detail: string; tone: string }
    if (sessions === 0) {
      thermometer = {
        label: "Sin registros todavía",
        detail: "Abrí la página principal para comprobar el envío de sesiones e interacciones.",
        tone: "bg-white/10 text-sky",
      }
    } else if (engagementRate >= 55 && Number(avgSectionsPerSession) >= 2) {
      thermometer = {
        label: "Usabilidad Alta · App en uso real",
        detail: `El ${engagementRate}% de los visitantes recorre secciones o interactúa activamente.`,
        tone: "bg-lime/20 text-lime",
      }
    } else if (engagementRate >= 30) {
      thermometer = {
        label: "Usabilidad Moderada · Consultas puntuales",
        detail: `El ${engagementRate}% explora más allá de la portada (promedio ${avgSectionsPerSession} secciones).`,
        tone: "bg-sky/20 text-sky",
      }
    } else {
      thermometer = {
        label: "Uso Rápido · Visitas breves",
        detail: `Solo el ${engagementRate}% interactuó con el contenido hasta ahora.`,
        tone: "bg-tangerine/20 text-tangerine",
      }
    }

    return {
      active5m,
      active1h,
      engagementRate,
      avgDurationSec,
      avgSectionsPerSession,
      avgInteractionsPerSession,
      sportsQueries,
      totalDevices,
      hourEntries,
      maxHour,
      dayEntries,
      filterRank,
      teamRank: topEntries(snapshot.teamFichas, 10),
      searchRank: topEntries(snapshot.searchTerms, 10),
      faqRank: topEntries(snapshot.faqsOpened, 8),
      thermometer,
    }
  }, [snapshot])

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6">
        <div className="flex items-center gap-3 text-sm font-semibold text-ink/70">
          <RefreshCw className="h-5 w-5 animate-spin text-brand" />
          Cargando panel…
        </div>
      </div>
    )
  }

  if (!unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-5 py-12 text-white">
        <div className="w-full max-w-md rounded-3xl bg-white p-7 text-ink shadow-2xl ring-1 ring-white/15 sm:p-9">
          <div className="mb-6 flex items-center gap-3.5">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-paper ring-1 ring-ink/10">
              <Image src="/icon-192.png" alt="" fill sizes="48px" className="object-contain p-1" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                Organización · {EVENT.shortName}
              </p>
              <h1 className="font-display text-3xl font-extrabold uppercase leading-none text-ink">
                Panel de Usabilidad
              </h1>
            </div>
          </div>

          <p className="mb-6 text-sm leading-relaxed text-ink/70">
            Acceso privado para consultar métricas de uso, secciones más visitadas, búsquedas e interacciones en tiempo real.
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <label htmlFor="panel-pin" className="text-xs font-bold uppercase tracking-wider text-ink/70">
              PIN de acceso
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
              <input
                id="panel-pin"
                type="password"
                inputMode="numeric"
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Ingresá el PIN"
                className="h-12 w-full rounded-xl bg-paper pl-11 pr-4 text-base font-semibold text-ink ring-1 ring-ink/15 outline-none transition focus:ring-2 focus:ring-brand"
              />
            </div>

            {authError && (
              <p role="alert" className="rounded-xl bg-berry/10 px-4 py-2.5 text-xs font-bold text-berry">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="mt-1 inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark"
            >
              Ingresar al panel
            </button>
          </form>

          <div className="mt-6 border-t border-ink/10 pt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/60 transition hover:text-brand"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver a la app del Encuentro
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-paper pb-16 text-ink">
      {/* Cabecera */}
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3.5">
            <Link
              href="/"
              title="Ir a la web pública"
              className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-paper ring-1 ring-ink/10"
            >
              <Image src="/icon-192.png" alt="" fill sizes="44px" className="object-contain p-1" />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                  Métricas en vivo · {EVENT.shortName}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Vercel Analytics activo
                </span>
                <button
                  type="button"
                  onClick={openScriptModal}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition",
                    driveConnected
                      ? "bg-lime/15 text-lime ring-1 ring-lime/30 hover:bg-lime/25"
                      : "bg-tangerine/15 text-tangerine ring-1 ring-tangerine/30 hover:bg-tangerine/25"
                  )}
                >
                  {driveConnected ? <Cloud className="h-3 w-3" /> : <CloudOff className="h-3 w-3" />}
                  {driveConnected ? "Google Drive conectado" : "Drive pendiente de script"}
                </button>
              </div>
              <h1 className="font-display text-3xl font-extrabold uppercase leading-tight text-ink">
                Panel de Usabilidad
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3.5 py-2 text-xs font-bold text-ink ring-1 ring-ink/10 transition hover:ring-ink"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver web
            </Link>

            <button
              type="button"
              onClick={() => setAutoRefresh((v) => !v)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold ring-1 transition",
                autoRefresh
                  ? "bg-brand/10 text-brand ring-brand/25"
                  : "bg-paper text-ink/60 ring-ink/10"
              )}
            >
              <Activity className={cn("h-3.5 w-3.5", autoRefresh && "animate-pulse")} />
              Auto 15s: {autoRefresh ? "ON" : "OFF"}
            </button>

            <button
              type="button"
              onClick={() => void fetchMetrics(false)}
              disabled={loading}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              Actualizar
            </button>

            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-paper px-3.5 py-2 text-xs font-bold text-ink ring-1 ring-ink/10 transition hover:ring-ink"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>

            <button
              type="button"
              onClick={exportJson}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-paper px-3.5 py-2 text-xs font-bold text-ink ring-1 ring-ink/10 transition hover:ring-ink"
            >
              <Download className="h-3.5 w-3.5" />
              JSON
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión del panel"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-paper px-3.5 py-2 text-xs font-bold text-ink/70 ring-1 ring-ink/10 transition hover:bg-ink hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 pt-8">
        {errorMsg && (
          <div role="alert" className="rounded-2xl bg-berry/10 px-5 py-3.5 text-sm font-semibold text-berry ring-1 ring-berry/25">
            {errorMsg}
          </div>
        )}

        {!driveConnected && (
          <div className="flex flex-col justify-between gap-4 rounded-2xl bg-tangerine/10 p-5 ring-1 ring-tangerine/30 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <p className="text-sm font-bold text-ink">
                Sincronización global con Google Drive pendiente de activar
              </p>
              <p className="text-xs leading-relaxed text-ink/75">
                Ahora mismo los datos se guardan en el servidor temporal de Vercel. Para persistir las métricas globales de todos los usuarios de forma permanente en tu carpeta de Google Drive, actualizá el código en Google Apps Script.
              </p>
            </div>
            <button
              type="button"
              onClick={openScriptModal}
              className="shrink-0 cursor-pointer rounded-full bg-ink px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand"
            >
              Ver script para Drive
            </button>
          </div>
        )}

        {/* Termómetro de usabilidad */}
        <section className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                  derived.thermometer.tone
                )}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                {derived.thermometer.label}
              </span>
              <h2 className="font-display text-3xl font-extrabold uppercase sm:text-4xl">
                Termómetro de uso de la página
              </h2>
              <p className="max-w-2xl text-sm text-white/75">{derived.thermometer.detail}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky">Activos (5 min)</p>
                <p className="mt-1 font-display text-3xl font-extrabold tabular-nums">{derived.active5m}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky">Activos (1 h)</p>
                <p className="mt-1 font-display text-3xl font-extrabold tabular-nums">{derived.active1h}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-lime">Uso real</p>
                <p className="mt-1 font-display text-3xl font-extrabold tabular-nums">
                  {derived.engagementRate}%
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-tangerine">
                  Secc. / visita
                </p>
                <p className="mt-1 font-display text-3xl font-extrabold tabular-nums">
                  {derived.avgSectionsPerSession}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs text-white/55">
            <span>
              Última actualización de datos: {formatDateTimeAR(snapshot.updatedAt)} (hora Argentina)
            </span>
            {lastFetchedAt && <span>Última lectura del panel: {formatTimeAR(Date.parse(lastFetchedAt))}</span>}
          </div>
        </section>

        {/* Tarjetas KPI */}
        <section aria-label="Indicadores principales" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            icon={Users}
            color="bg-brand"
            label="Visitantes únicos"
            value={String(snapshot.totals.uniqueVisitors)}
            sub={`${snapshot.totals.sessions} sesiones · ${snapshot.totals.returningSessions} recurrentes`}
          />
          <KpiCard
            icon={Activity}
            color="bg-sky"
            label="Interacciones"
            value={String(snapshot.totals.interactions)}
            sub={`${derived.avgInteractionsPerSession} acciones por sesión`}
          />
          <KpiCard
            icon={Clock}
            color="bg-tangerine"
            label="Tiempo promedio"
            value={formatDuration(derived.avgDurationSec)}
            sub={`${formatDuration(snapshot.totals.totalDurationSec)} totales`}
          />
          <KpiCard
            icon={Trophy}
            color="bg-lime"
            label="Consultas torneo"
            value={String(derived.sportsQueries)}
            sub="Fixture, búsquedas y fichas"
          />
          <KpiCard
            icon={Camera}
            color="bg-berry"
            label="Fotos y álbum"
            value={String(snapshot.totals.photosUploaded)}
            sub={`${snapshot.totals.photosQueuedOffline} cola offline · ${snapshot.totals.driveAlbumClicks} clics Drive`}
          />
          <KpiCard
            icon={Smartphone}
            color="bg-grape"
            label="App PWA / Offline"
            value={String(snapshot.totals.pwaInstalls)}
            sub={`${snapshot.totals.pwaSessions} sesiones PWA · ${snapshot.totals.offlineSessions} offline`}
          />
        </section>

        {/* Embudo de secciones + Dispositivos y Acciones */}
        <section className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/10">
            <div className="mb-5 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Recorrido</p>
                <h2 className="font-display text-2xl font-extrabold uppercase text-ink">
                  Alcance por sección
                </h2>
              </div>
              <span className="text-xs font-semibold text-ink/55">
                Vistas reales (≥ 1.2s en pantalla) y clics de menú
              </span>
            </div>

            <div className="flex flex-col gap-3.5">
              {SECTION_IDS.map((id) => {
                const views = snapshot.sections[id] ?? 0
                const clicks = snapshot.navClicks[id] ?? 0
                const maxBar = Math.max(
                  1,
                  snapshot.totals.sessions,
                  ...SECTION_IDS.map((s) => snapshot.sections[s] ?? 0)
                )
                const barWidth = Math.min(100, Math.round((views / maxBar) * 100))
                const reachPct =
                  snapshot.totals.sessions > 0
                    ? Math.min(100, Math.round((views / snapshot.totals.sessions) * 100))
                    : 0

                return (
                  <div key={id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-bold text-ink">{SECTION_LABELS[id]}</span>
                      <div className="flex items-center gap-3 text-xs font-semibold text-ink/65">
                        <span>{clicks} clics menú</span>
                        <span className="font-bold text-ink tabular-nums">
                          {views} vistas ({reachPct}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-paper">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          SECTION_COLORS[id] ?? "bg-brand"
                        )}
                        style={{ width: `${views > 0 ? Math.max(barWidth, 4) : 0}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Dispositivos y modo */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Entorno</p>
              <h2 className="mb-4 font-display text-2xl font-extrabold uppercase text-ink">
                Dispositivos y acceso
              </h2>

              <div className="space-y-3">
                {(
                  [
                    { key: "android", label: "Android", color: "bg-lime" },
                    { key: "ios", label: "iPhone / iPad (iOS)", color: "bg-sky" },
                    { key: "desktop", label: "Computadora", color: "bg-brand" },
                  ] as const
                ).map((d) => {
                  const count = snapshot.devices[d.key] ?? 0
                  const pct =
                    derived.totalDevices > 0 ? Math.round((count / derived.totalDevices) * 100) : 0
                  return (
                    <div key={d.key} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>{d.label}</span>
                        <span className="tabular-nums text-ink/70">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-paper">
                        <div
                          className={cn("h-full rounded-full", d.color)}
                          style={{ width: `${count > 0 ? Math.max(pct, 4) : 0}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-ink/10 pt-4 text-xs">
                <div className="rounded-xl bg-paper p-3">
                  <span className="font-semibold text-ink/60">Sesiones PWA</span>
                  <p className="mt-0.5 font-display text-2xl font-extrabold text-ink">
                    {snapshot.totals.pwaSessions}
                  </p>
                </div>
                <div className="rounded-xl bg-paper p-3">
                  <span className="font-semibold text-ink/60">Usos sin señal</span>
                  <p className="mt-0.5 font-display text-2xl font-extrabold text-brand">
                    {snapshot.totals.offlineSessions}
                  </p>
                </div>
              </div>
            </div>

            {/* Utilidades rápidas */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Acciones útiles</p>
              <h2 className="mb-4 font-display text-2xl font-extrabold uppercase text-ink">
                Sede, stream y contacto
              </h2>
              <ul className="grid grid-cols-2 gap-2.5 text-xs">
                <li className="col-span-2 flex items-center justify-between rounded-xl bg-berry/10 px-3.5 py-2.5 ring-1 ring-berry/20">
                  <span className="flex items-center gap-1.5 font-bold text-ink">
                    <Radio className="h-3.5 w-3.5 text-berry" /> Clics en Stream en vivo
                  </span>
                  <strong className="font-display text-lg text-berry">
                    {snapshot.totals.streamClicks}
                  </strong>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-paper px-3.5 py-2.5">
                  <span className="flex items-center gap-1.5 font-semibold text-ink/75">
                    <MapPin className="h-3.5 w-3.5 text-brand" /> Ampliar mapa
                  </span>
                  <strong className="font-display text-lg text-ink">{snapshot.totals.mapExpands}</strong>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-paper px-3.5 py-2.5">
                  <span className="flex items-center gap-1.5 font-semibold text-ink/75">
                    <MapPin className="h-3.5 w-3.5 text-lime" /> Cómo llegar
                  </span>
                  <strong className="font-display text-lg text-ink">
                    {snapshot.totals.directionsClicks}
                  </strong>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-paper px-3.5 py-2.5">
                  <span className="flex items-center gap-1.5 font-semibold text-ink/75">
                    <Copy className="h-3.5 w-3.5 text-tangerine" /> Copiar dir.
                  </span>
                  <strong className="font-display text-lg text-ink">
                    {snapshot.totals.addressCopies}
                  </strong>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-paper px-3.5 py-2.5">
                  <span className="flex items-center gap-1.5 font-semibold text-ink/75">
                    <Share2 className="h-3.5 w-3.5 text-sky" /> Compartir
                  </span>
                  <strong className="font-display text-lg text-ink">{snapshot.totals.shareClicks}</strong>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-paper px-3.5 py-2.5">
                  <span className="font-semibold text-ink/75">WhatsApp</span>
                  <strong className="font-display text-lg text-ink">
                    {snapshot.totals.whatsappClicks}
                  </strong>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-paper px-3.5 py-2.5">
                  <span className="font-semibold text-ink/75">Email</span>
                  <strong className="font-display text-lg text-ink">{snapshot.totals.emailClicks}</strong>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tráfico por hora y por día */}
        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Horarios pico</p>
                <h2 className="font-display text-2xl font-extrabold uppercase text-ink">
                  Sesiones por hora (ARG)
                </h2>
              </div>
              <span className="text-xs font-semibold text-ink/55">Últimas 24 franjas activas</span>
            </div>

            {derived.hourEntries.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink/50">
                Todavía no hay tráfico horario registrado.
              </p>
            ) : (
              <div className="flex h-48 items-end gap-2 overflow-x-auto pb-2 pt-6">
                {derived.hourEntries.map(([hourKey, count]) => {
                  const pct = Math.max(8, Math.round((count / derived.maxHour) * 100))
                  const hourLabel = hourKey.slice(11, 16)
                  const dayLabel = hourKey.slice(5, 10)
                  return (
                    <div
                      key={hourKey}
                      className="flex min-w-[38px] flex-1 flex-col items-center gap-1.5"
                      title={`${hourKey}: ${count} sesiones`}
                    >
                      <span className="text-[11px] font-bold tabular-nums text-ink">{count}</span>
                      <div className="flex h-28 w-full items-end rounded-lg bg-paper px-1">
                        <div
                          className="w-full rounded-t-md bg-brand transition-all duration-300"
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-ink/75">{hourLabel}</span>
                      <span className="text-[9px] text-ink/45">{dayLabel}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Por fecha</p>
            <h2 className="mb-4 font-display text-2xl font-extrabold uppercase text-ink">
              Actividad diaria
            </h2>

            {derived.dayEntries.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink/50">Sin días registrados aún.</p>
            ) : (
              <ul className="divide-y divide-ink/10">
                {derived.dayEntries.map(([day, bucket]) => (
                  <li key={day} className="flex items-center justify-between py-3 text-sm">
                    <span className="font-bold text-ink">{day}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="rounded-full bg-brand/10 px-2.5 py-1 font-bold text-brand">
                        {bucket.sessions} sesiones
                      </span>
                      <span className="rounded-full bg-paper px-2.5 py-1 font-bold text-ink">
                        {bucket.interactions} acciones
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Rankings de interés */}
        <section className="grid gap-6 md:grid-cols-2">
          <RankCard
            icon={Users}
            color="text-brand"
            title="Fichas de equipos más abiertas"
            emptyText="Ninguna ficha abierta todavía."
            items={derived.teamRank}
          />
          <RankCard
            icon={Search}
            color="text-tangerine"
            title="Búsquedas más frecuentes"
            emptyText="Sin búsquedas registradas todavía."
            items={derived.searchRank}
          />
          <RankCard
            icon={Trophy}
            color="text-lime"
            title="Filtros de fixture y agenda"
            emptyText="Sin filtros usados todavía."
            items={derived.filterRank.map(([k, v]) => [formatFilterLabel(k), v])}
          />
          <RankCard
            icon={HelpCircle}
            color="text-berry"
            title="Preguntas frecuentes (FAQ) más abiertas"
            emptyText="Ninguna FAQ abierta todavía."
            items={derived.faqRank}
          />
        </section>

        {/* Actividad reciente */}
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Tiempo real</p>
              <h2 className="font-display text-2xl font-extrabold uppercase text-ink">
                Últimas interacciones registradas
              </h2>
            </div>
            <span className="text-xs font-semibold text-ink/55">
              Últimos {snapshot.recentEvents.length} eventos
            </span>
          </div>

          {snapshot.recentEvents.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink/50">
              Aún no hay eventos en el historial.
            </p>
          ) : (
            <ul className="divide-y divide-ink/10">
              {snapshot.recentEvents.map((ev) => (
                <li
                  key={ev.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    {ev.type === "offline_usage" && <WifiOff className="h-4 w-4 text-tangerine" />}
                    <span className="font-semibold text-ink">{ev.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink/60">
                    <span className="rounded-full bg-paper px-2 py-0.5 font-bold uppercase text-ink/70">
                      {ev.device}
                    </span>
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 font-bold uppercase text-brand">
                      {ev.mode}
                    </span>
                    <span className="tabular-nums">{formatTimeAR(ev.ts)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Modal de configuración de Google Apps Script */}
      {showScriptModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sincronizar con Google Drive"
          onClick={() => setShowScriptModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                  Persistencia global gratuita
                </p>
                <h3 className="font-display text-2xl font-extrabold uppercase text-ink">
                  Conectar analíticas a Google Drive
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScriptModal(false)}
                aria-label="Cerrar"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-paper text-ink hover:bg-ink hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ol className="mb-5 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink/80">
              <li>
                Abrí tu proyecto actual en{" "}
                <a
                  href="https://script.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-brand underline"
                >
                  script.google.com
                </a>{" "}
                (el mismo que ya recibe las fotos del álbum).
              </li>
              <li>Reemplazá todo el código por el nuevo script (mantiene la subida de fotos intacta).</li>
              <li>
                Hacé clic en <strong>Implementar → Administrar implementaciones → Editar (lápiz) → Nueva versión</strong> y guardá.
              </li>
              <li>
                Se creará automáticamente el archivo <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-xs">_analytics_encuentro_2026.json</code> dentro de tu carpeta de Drive.
              </li>
            </ol>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={copyScriptSource}
                disabled={!scriptSource}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-50"
              >
                {copiedScript ? <Check className="h-4 w-4 text-lime" /> : <Copy className="h-4 w-4" />}
                {copiedScript ? "¡Código copiado!" : "Copiar código de Apps Script"}
              </button>
              {!scriptSource && (
                <span className="text-xs text-ink/60">
                  Cargando script desde <code className="font-mono">scripts/google-apps-script-drive.js</code>…
                </span>
              )}
            </div>

            {scriptSource && (
              <pre className="max-h-64 overflow-auto rounded-2xl bg-ink p-4 text-[11px] leading-relaxed text-white/90">
                <code>{scriptSource}</code>
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function KpiCard({
  icon: Icon,
  color,
  label,
  value,
  sub,
}: {
  icon: typeof Users
  color: string
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/10">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-ink/60">{label}</span>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-white", color)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-4xl font-extrabold tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-xs font-medium text-ink/60">{sub}</p>
    </div>
  )
}

function RankCard({
  icon: Icon,
  color,
  title,
  emptyText,
  items,
}: {
  icon: typeof Users
  color: string
  title: string
  emptyText: string
  items: Array<[string, number]>
}) {
  const max = Math.max(1, ...items.map(([, c]) => c))
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/10">
      <div className="mb-4 flex items-center gap-2.5">
        <Icon className={cn("h-5 w-5", color)} />
        <h2 className="font-display text-2xl font-extrabold uppercase text-ink">{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink/50">{emptyText}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map(([label, count]) => {
            const pct = Math.max(8, Math.round((count / max) * 100))
            return (
              <li key={label} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-semibold text-ink" title={label}>
                    {label}
                  </span>
                  <strong className="shrink-0 tabular-nums text-ink">{count}</strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-paper">
                  <div className="h-full rounded-full bg-ink/80" style={{ width: `${pct}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
