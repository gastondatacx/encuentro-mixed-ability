"use client"

import { useEffect, useState } from "react"

/** Detecta el estado de conexión del navegador sin desajustes de hidratación. */
export function useOnline() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    const sync = () => setOnline(window.navigator.onLine)
    sync()
    window.addEventListener("online", sync)
    window.addEventListener("offline", sync)
    return () => {
      window.removeEventListener("online", sync)
      window.removeEventListener("offline", sync)
    }
  }, [])

  return online
}
