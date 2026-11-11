"use client"

import { useEffect, useState } from "react"

/**
 * Devuelve la hora actual y la refresca cada `intervalMs`.
 * Es `null` hasta montar en el cliente para evitar diferencias de hidratación.
 */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])

  return now
}

