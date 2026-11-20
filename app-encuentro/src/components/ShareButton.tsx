"use client"

import { useState } from "react"
import { Check, Share2 } from "lucide-react"
import { EVENT } from "@/data/encuentro"
import { trackEvent } from "@/lib/analytics"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
  label?: string
  className?: string
}

export function ShareButton({ label = "Compartir", className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.origin
    const title = `${EVENT.edition} ${EVENT.name} · ${EVENT.city} ${EVENT.year}`
    const text = `Accedé al cronograma, equipos, sede y álbum de fotos del ${EVENT.edition} ${EVENT.name} (${EVENT.datesLabel}).`

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url })
        trackEvent("share_click", { method: "native" })
        return
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      trackEvent("share_click", { method: "clipboard" })
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      // Sin acceso al portapapeles en contextos restringidos.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? "Enlace copiado al portapapeles" : `${label} acceso a la app`}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 transition",
        className
      )}
    >
      {copied ? <Check className="h-4 w-4 text-lime" /> : <Share2 className="h-4 w-4" />}
      <span>{copied ? "¡Link copiado!" : label}</span>
    </button>
  )
}
