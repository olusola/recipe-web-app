"use client"

import { useCallback, useState } from "react"

import { HeroBanner } from "@/components/hero-banner"

import { AddIngredientForm } from "@/components/add-ingredient-form"
import { IngredientsTable } from "@/components/ingredients-table"
import { RecipeFinderPanel } from "@/components/recipe-finder-panel"

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1200&q=80&auto=format&fit=crop"

export default function IngredientsPage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.add(id))
      return next
    })
  }, [])

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  return (
    <div className="space-y-8">
      <HeroBanner src={HERO_IMAGE} className="min-h-[200px] justify-end sm:min-h-[240px]">
        <h1 className="text-4xl leading-none font-extrabold tracking-tight text-white drop-shadow-lg sm:text-5xl">
          Your
          <br />
          <span className="text-white/60">ingredients</span>
        </h1>
      </HeroBanner>

      <AddIngredientForm />

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <IngredientsTable
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />
        </div>

        <aside className="xl:sticky xl:top-24 xl:max-h-[calc(100vh-8rem)] xl:self-start xl:overflow-y-auto">
          <RecipeFinderPanel selectedIngredientIds={selectedIds} />
        </aside>
      </div>
    </div>
  )
}
