import type { Metadata, Viewport } from "next"
import { Barlow_Condensed, Inter } from "next/font/google"
import { EVENT } from "@/data/encuentro"
import "./globals.css"

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const title = `${EVENT.edition} ${EVENT.name} · ${EVENT.city} ${EVENT.year}`
const description = `App oficial del ${EVENT.edition} ${EVENT.name}: cronograma, equipos, sede y álbum de fotos. ${EVENT.sports.join(", ")} · ${EVENT.datesLabel}.`

export const metadata: Metadata = {
  title,
  description,
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    title,
    description,
    locale: "es_AR",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: EVENT.shortName,
  },
}

export const viewport: Viewport = {
  themeColor: "#f4f6fb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${barlow.variable} ${inter.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
