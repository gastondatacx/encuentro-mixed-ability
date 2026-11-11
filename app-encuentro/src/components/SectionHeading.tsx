import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  align?: "left" | "center"
  tone?: "light" | "dark"
  children?: ReactNode
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  children,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-3",
        align === "center" && "items-center text-center"
      )}
    >
      <p
        className={cn(
          "flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em]",
          tone === "light" ? "text-brand" : "text-sky"
        )}
      >
        <span className="h-2.5 w-2.5 rotate-45 bg-current" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2
        className={cn(
          "font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-6xl",
          tone === "light" ? "text-ink" : "text-white"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-2xl text-base sm:text-lg",
            tone === "light" ? "text-ink/65" : "text-white/70"
          )}
        >
          {description}
        </p>
      )}
      {children}
    </div>
  )
}
