const CACHE_NAME = "encuentro-pwa-v5"

const SHELL_ASSETS = [
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

const TEAM_LOGOS = [
  "/logos/albatros-mix.png",
  "/logos/arcoiris.png",
  "/logos/ardillas-mixed.png",
  "/logos/atletico-del-rosario.png",
  "/logos/barbarians-argentina-mixed.png",
  "/logos/cabure-hockey.png",
  "/logos/cabure-rugby.png",
  "/logos/cebras-mix.png",
  "/logos/centro-naval.png",
  "/logos/coirones-xv.png",
  "/logos/cordoba-athletic.png",
  "/logos/cordoba-mix.png",
  "/logos/cuyis.png",
  "/logos/del-sur-rugby-inclusivo.png",
  "/logos/deportiva-francesa.png",
  "/logos/dinos-xv.png",
  "/logos/hualas-xv.png",
  "/logos/inka-xv.png",
  "/logos/la-premix-del-leon.png",
  "/logos/lionas-y-liones.png",
  "/logos/los-tatu-rugby-inclusivo.png",
  "/logos/luciernagas.png",
  "/logos/monte-grande-los-hackas.png",
  "/logos/old-resian-club.png",
  "/logos/pumpas-xv.png",
  "/logos/san-agustin-xv.png",
  "/logos/san-jose-xv.png",
  "/logos/santa-monica-hockey.png",
  "/logos/somos-abejas-mix.png",
  "/logos/suyai.png",
  "/logos/toritos-xv.png",
  "/logos/toros-xv.png",
  "/logos/totem-xv.png",
  "/logos/ubuntu.png",
  "/logos/unidos-mix-ability.png",
  "/logos/usapucas-xv.png",
  "/logos/voluntarios-nacional.png",
  "/logos/yuchanes-xv.png",
]

const TEAM_FICHAS = [
  "/fichas/albatros-mix.jpg",
  "/fichas/arcoiris.jpg",
  "/fichas/ardillas-mixed.jpg",
  "/fichas/atletico-del-rosario.jpg",
  "/fichas/barbarians-argentina-mixed.jpg",
  "/fichas/cabure-hockey.jpg",
  "/fichas/cabure-rugby.jpg",
  "/fichas/cebras-mix.jpg",
  "/fichas/centro-naval.jpg",
  "/fichas/coirones-xv.jpg",
  "/fichas/cordoba-athletic.jpg",
  "/fichas/cuyis.jpg",
  "/fichas/del-sur-rugby-inclusivo.jpg",
  "/fichas/deportiva-francesa.jpg",
  "/fichas/dinos-xv.jpg",
  "/fichas/hualas-xv.jpg",
  "/fichas/inka-xv.jpg",
  "/fichas/la-premix-del-leon.jpg",
  "/fichas/lionas-y-liones.jpg",
  "/fichas/los-tatu-rugby-inclusivo.jpg",
  "/fichas/luciernagas.jpg",
  "/fichas/monte-grande-los-hackas.jpg",
  "/fichas/old-resian-club.jpg",
  "/fichas/pumpas-xv.jpg",
  "/fichas/san-agustin-xv.jpg",
  "/fichas/san-jose-xv.jpg",
  "/fichas/santa-monica-hockey.jpg",
  "/fichas/somos-abejas-mix.jpg",
  "/fichas/suyai.jpg",
  "/fichas/totem-xv.jpg",
  "/fichas/ubuntu.jpg",
  "/fichas/unidos-mix-ability.jpg",
  "/fichas/usapucas-xv.jpg",
  "/fichas/yuchanes-xv.jpg",
]

async function cacheUrlsInBatches(urls, batchSize = 6) {
  const cache = await caches.open(CACHE_NAME)
  const unique = [...new Set(urls)].filter(Boolean)
  for (let i = 0; i < unique.length; i += batchSize) {
    const batch = unique.slice(i, i + batchSize)
    await Promise.allSettled(
      batch.map(async (url) => {
        try {
          const existing = await cache.match(url)
          if (existing) return
          const res = await fetch(url, { cache: "no-cache" })
          if (res && res.ok) {
            await cache.put(url, res)
          }
        } catch {
          // Ignorar fallos individuales si el usuario se desconecta a mitad de precarga.
        }
      })
    )
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await cacheUrlsInBatches([...SHELL_ASSETS, ...TEAM_LOGOS], 10)
      await self.skipWaiting()
    })()
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
      await self.clients.claim()
      // Precargar las 34 fichas en segundo plano sin bloquear la activación.
      cacheUrlsInBatches(TEAM_FICHAS, 4).catch(() => {})
    })()
  )
})

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CACHE_URLS" && Array.isArray(event.data.urls)) {
    const sameOriginUrls = event.data.urls
      .map((u) => {
        try {
          const parsed = new URL(u, self.location.origin)
          return parsed.origin === self.location.origin ? parsed.pathname + parsed.search : null
        } catch {
          return null
        }
      })
      .filter(Boolean)
    event.waitUntil(cacheUrlsInBatches(sameOriginUrls, 8))
  }
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Navegación principal: Network-First con fallback a la copia cacheada de "/"
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME)
        try {
          const networkResponse = await fetch(request)
          if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone()).catch(() => {})
            if (url.pathname === "/") {
              cache.put("/", networkResponse.clone()).catch(() => {})
            }
          }
          return networkResponse
        } catch {
          const cached = (await cache.match(request)) || (await cache.match("/"))
          if (cached) return cached
          return new Response(
            "<!doctype html><html lang='es'><meta charset='utf-8'><title>Sin conexión</title><body style='font-family:sans-serif;padding:2rem;text-align:center'><h1>Sin conexión</h1><p>Abrí la app al menos una vez con internet para guardar los datos en el teléfono.</p></body></html>",
            { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
          )
        }
      })()
    )
    return
  }

  // Activos estáticos del mismo origen: Cache-First con actualización en segundo plano
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const cached = await cache.match(request)
      if (cached) {
        // Revalidar silenciosamente solo documentos/manifest/JS/CSS cuando hay red
        if (url.pathname === "/manifest.webmanifest") {
          fetch(request)
            .then((res) => {
              if (res && res.ok) cache.put(request, res.clone())
            })
            .catch(() => {})
        }
        return cached
      }
      try {
        const networkResponse = await fetch(request)
        if (networkResponse && networkResponse.ok) {
          cache.put(request, networkResponse.clone()).catch(() => {})
        }
        return networkResponse
      } catch {
        return new Response("", { status: 504, statusText: "Offline" })
      }
    })()
  )
})
