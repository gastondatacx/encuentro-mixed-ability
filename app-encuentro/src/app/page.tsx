import { SiteNav } from "@/components/SiteNav"
import { Hero } from "@/components/Hero"
import { Schedule } from "@/components/Schedule"
import { Teams } from "@/components/Teams"
import { Venue } from "@/components/Venue"
import { PhotoUpload } from "@/components/PhotoUpload"
import { Contact } from "@/components/Contact"
import { InstallPrompt } from "@/components/InstallPrompt"

export default function Home() {
  return (
    <>
      <a
        href="#agenda"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al cronograma
      </a>
      <SiteNav />
      <main>
        <Hero />
        <Schedule />
        <Teams />
        <Venue />
        <PhotoUpload />
      </main>
      <Contact />
      <InstallPrompt />
    </>
  )
}
