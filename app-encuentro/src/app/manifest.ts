import type { MetadataRoute } from "next"
import { EVENT } from "@/data/encuentro"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${EVENT.edition} ${EVENT.name}`,
    short_name: EVENT.shortName,
    description: `App del ${EVENT.name} ${EVENT.city} ${EVENT.year}`,
    lang: "es-AR",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6fb",
    theme_color: "#1d3fb8",
    icons: [
      { src: "/logo.png", sizes: "192x192", type: "image/png" },
      { src: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
