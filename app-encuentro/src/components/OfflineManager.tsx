"use client"

import { useEffect } from "react"
import { WifiOff } from "lucide-react"
import { teams } from "@/data/encuentro"
import { useOnline } from "@/lib/use-online"

const STATIC_SHELL_URLS = [
  "/",
  "/manifest.webmanifest",
  "/logo.png",
  "/mapa-predio.jpg",
  "/favicon.png",
  "/apple-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
]

function collectAppUrls() {
  const urls = new Set<string>(STATIC_SHELL_URLS)

  for (const team of teams) {
    urls.add(team.logo)
    if (team.ficha) urls.add(team.ficha)
  }

  document.querySelectorAll<HTMLScriptElement>("script[src]").forEach((el) => {
    if (el.src) urls.add(el.src)
  })
  document
    .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href], link[rel="preload"][href]')
    .forEach((el) => {
      if (el.href) urls.add(el.href)
    })

  return Array.from(urls)
}

export function OfflineManager() {
  const online = useOnline()

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    if (process.env.NODE_ENV === "development") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .catch(() => {})
      if ("caches" in window) {
        window.caches
          .keys()
          .then((keys) => Promise.all(keys.map((k) => window.caches.delete(k))))
          .catch(() => {})
      }
      return
    }

    let cancelled = false

    const sendUrlsToSw = (target: ServiceWorker | null | undefined) => {
      if (!target || cancelled) return
      target.postMessage({ type: "CACHE_URLS", urls: collectAppUrls() })
    }

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
        if (cancelled) return
        sendUrlsToSw(reg.active || navigator.serviceWorker.controller)
        const readyReg = await navigator.serviceWorker.ready
        sendUrlsToSw(readyReg.active)
      } catch {
        // Algunos navegadores en contexto no seguro no permiten Service Workers.
      }
    }

    const onControllerChange = () => sendUrlsToSw(navigator.serviceWorker.controller)
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)
    register()

    return () => {
      cancelled = true
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange)
    }
  }, [])

  if (online) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 z-40 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-ink/95 px-4 py-2 text-center text-xs font-semibold text-white shadow-lg ring-1 ring-white/20 backdrop-blur-md md:bottom-5"
    >
      <WifiOff className="h-4 w-4 shrink-0 text-sky" aria-hidden="true" />
      <span>Modo sin conexión · Cronograma, equipos y fichas disponibles</span>
    </div>
  )
}
