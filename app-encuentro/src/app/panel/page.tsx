import type { Metadata } from "next"
import { UsabilityPanel } from "@/components/UsabilityPanel"

export const metadata: Metadata = {
  title: "Panel de Usabilidad · 9º Encuentro Mixed Ability",
  description: "Métricas de uso, alcance por sección e interacciones en tiempo real.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function PanelPage() {
  return <UsabilityPanel />
}
