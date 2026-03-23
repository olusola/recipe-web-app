"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"

import { useRecipe, useRecipes } from "@/hooks/use-recipes"
import { getRecommendedRecipes } from "@/lib/recipe-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EditRecipeDrawer } from "@/components/edit-recipe-drawer"
import { HeroBanner } from "@/components/hero-banner"

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&auto=format&fit=crop"

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { data: recipe, isLoading } = useRecipe(id)
  const { data: allRecipes = [] } = useRecipes()

  if (isLoading) {
    return (
      <p className="animate-pulse py-12 text-center text-sm text-muted-foreground">
        Loading recipe…
      </p>
    )
  }

  if (!recipe) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Recipe not found.</p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/recipes">Back to Recipes</Link>
        </Button>
      </div>
    )
  }

  const recommended = getRecommendedRecipes(recipe, allRecipes)

  return (
    <div className="space-y-8">
      <HeroBanner
        src={HERO_IMAGE}
        className="min-h-[240px] justify-between sm:min-h-[280px]"
      >
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-fit rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
        >
          <Link href="/recipes">
            <ArrowLeft className="h-4 w-4" />
            Back to Recipes
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-3xl leading-none font-extrabold tracking-tight text-white drop-shadow-lg sm:text-5xl">
            {recipe.name}
          </h1>
          <Button
            onClick={() => {
              setDrawerOpen(true)
            }}
            className="h-12 w-full shrink-0 rounded-full border border-white/20 bg-white/15 px-6 text-base font-extrabold text-white backdrop-blur-md hover:bg-white/25 sm:w-auto"
          >
            <Pencil className="h-4 w-4" />
            Edit Recipe
          </Button>
        </div>
      </HeroBanner>

      <div className="space-y-3">
        <p className="text-xs font-extrabold tracking-widest text-foreground/40 uppercase">
          Ingredients
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {recipe.ingredients.map((ing) => (
            <div
              key={ing.ingredientId}
              className="group relative overflow-hidden rounded-xl border bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm font-extrabold tracking-tight">
                {ing.name}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                {ing.quantity} {ing.unit}
              </p>
            </div>
          ))}
        </div>
      </div>

      {recipe.instructions && (
        <div className="space-y-3">
          <p className="text-xs font-extrabold tracking-widest text-foreground/40 uppercase">
            Instructions
          </p>
          <div className="rounded-2xl border bg-card p-5 sm:p-6">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {recipe.instructions}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-xs font-extrabold tracking-widest text-foreground/40 uppercase">
          Other recipes with similar ingredients
        </p>
        {recommended.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No similar recipes found.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recommended.map((rec) => (
              <div
                key={rec.id}
                className="flex cursor-pointer flex-col gap-2 rounded-2xl border bg-card px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => router.push(`/recipes/${rec.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-extrabold tracking-tight">
                    {rec.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className="shrink-0 rounded-full text-xs font-bold"
                  >
                    {rec.ingredients.length} ingredient
                    {rec.ingredients.length !== 1 && "s"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rec.ingredients.map((ing) => (
                    <Badge
                      key={ing.ingredientId}
                      variant="secondary"
                      className="font-semibold"
                    >
                      {ing.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditRecipeDrawer
        recipe={recipe}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
