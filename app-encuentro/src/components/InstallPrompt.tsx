"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Download, Share, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

const STORAGE_KEY = "encuentro-pwa-installed-or-dismissed"

function isStandaloneOrDismissed() {
  const nav = window.navigator as Navigator & { standalone?: boolean }
  if (nav.standalone === true) return true
  if (
    ["standalone", "fullscreen", "minimal-ui"].some(
      (mode) => window.matchMedia(`(display-mode: ${mode})`).matches
    )
  ) {
    return true
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true"
  } catch {
    return false
  }
}

function remember() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "true")
  } catch {
    // Modo privado: no pasa nada si no se puede guardar.
  }
}

/** Aviso flotante para instalar la app (Android/Chrome) o agregarla a inicio (iOS). */
export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isStandaloneOrDismissed()) return

    const ua = window.navigator.userAgent.toLowerCase()
    const ios =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1)
    setIsIOS(ios)

    // Esperamos unos segundos para no tapar el contenido apenas se entra.
    const timer = ios ? window.setTimeout(() => setVisible(true), 4000) : undefined

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      window.setTimeout(() => setVisible(true), 2500)
    }
    const onInstalled = () => {
      remember()
      setVisible(false)
      setPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const dismiss = () => {
    remember()
    setVisible(false)
  }

  const install = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === "accepted") remember()
    setPrompt(null)
    setVisible(false)
  }

  if (!visible || (!prompt && !isIOS)) return null

  return (
    <div
      role="dialog"
      aria-label="Instalar la app oficial"
      className="animate-rise fixed inset-x-3 bottom-[92px] z-50 mx-auto max-w-md rounded-2xl bg-white p-4 shadow-[0_20px_60px_-15px_rgba(11,22,64,0.6)] ring-1 ring-ink/10 md:bottom-6"
    >
      <div className="flex items-start gap-3">
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-ink/10">
          <Image src="/logo.png" alt="" fill sizes="48px" className="object-contain" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold uppercase leading-tight text-ink">
            Tené la app a mano
          </p>
          {prompt ? (
            <p className="text-sm text-ink/65">Instalala para ver horarios y equipos al instante.</p>
          ) : (
            <p className="text-sm text-ink/65">
              Tocá <Share className="inline h-4 w-4 align-text-bottom" aria-label="Compartir" /> y
              elegí <strong className="text-ink">“Agregar a inicio”</strong>.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {prompt && (
        <button
          type="button"
          onClick={install}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 font-bold text-white hover:bg-brand-dark"
        >
          <Download className="h-5 w-5" />
          Instalar app
        </button>
      )}
    </div>
  )
}

