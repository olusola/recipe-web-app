"use client"

import Link from "next/link"
import { ChefHat } from "lucide-react"

import { useRecipes } from "@/hooks/use-recipes"
import { getRecipesByIngredients } from "@/lib/recipe-utils"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type RecipeFinderPanelProps = {
  selectedIngredientIds: Set<string>
}

export const RecipeFinderPanel = ({
  selectedIngredientIds,
}: RecipeFinderPanelProps) => {
  const { data: recipes = [] } = useRecipes()
  const matches = getRecipesByIngredients(selectedIngredientIds, recipes)

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card/50 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">
            🍳
          </span>
          <h2 className="text-lg font-extrabold tracking-tight">
            Recipe Finder
          </h2>
        </div>
        {matches.length > 0 && (
          <Badge variant="secondary" className="rounded-full font-bold">
            {matches.length} {matches.length === 1 ? "recipe" : "recipes"}
          </Badge>
        )}
      </div>

      {selectedIngredientIds.size === 0 ? (
        <Empty className="min-h-60 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ChefHat className="h-5 w-5" />
            </EmptyMedia>
            <EmptyTitle>Discover recipes</EmptyTitle>
            <EmptyDescription>
              Select ingredients from the list to find recipes you can make.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : matches.length === 0 ? (
        <Empty className="min-h-60 border">
          <EmptyHeader>
            <EmptyTitle>No matching recipes</EmptyTitle>
            <EmptyDescription>
              No recipes use any of your selected ingredients. Try selecting
              different ones.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-2">
          {matches.map(({ recipe, matchCount, totalIngredients }) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="group block rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="font-extrabold tracking-tight group-hover:underline">
                  {recipe.name}
                </span>
                <Badge
                  variant={
                    matchCount === totalIngredients ? "default" : "secondary"
                  }
                  className="shrink-0 rounded-full font-bold"
                >
                  {matchCount}/{totalIngredients}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recipe.ingredients.map((ing) => {
                  const isMatched = selectedIngredientIds.has(ing.ingredientId)
                  return (
                    <Badge
                      key={ing.ingredientId}
                      variant={isMatched ? "default" : "outline"}
                      className="text-xs font-semibold"
                    >
                      {ing.name}
                    </Badge>
                  )
                })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
