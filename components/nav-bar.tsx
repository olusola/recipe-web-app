"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/recipes", label: "Recipes" },
  { href: "/ingredients", label: "Ingredients" },
] as const

export const NavBar = () => {
  const pathname = usePathname()
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <div className="fixed top-2 right-0 left-0 z-50 px-3 sm:top-3 sm:px-4">
      <header className="mx-auto max-w-3xl overflow-hidden rounded-full bg-card/80 shadow-sm ring-1 shadow-black/5 ring-border/50 backdrop-blur-xl">
        <div className="flex h-12 w-full items-center gap-0 px-4">
          <Link
            href="/recipes"
            className="shrink-0 text-sm font-bold tracking-tight transition-opacity hover:opacity-70"
          >
            Recipe App
          </Link>

          <div className="mx-3 h-4 border-l border-border/50" />

          <nav className="flex min-w-0 items-center gap-0.5">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm transition-all duration-200",
                  pathname.startsWith(href)
                    ? "bg-primary/10 font-medium text-foreground"
                    : "font-normal text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8 rounded-full"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <Sun className="h-4 w-4 scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-4 w-4 scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>
    </div>
  )
}
