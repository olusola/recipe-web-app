"use client"

import Image from "next/image"
import Link from "next/link"
import { useRecipes } from "@/hooks/use-recipes"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=1200&q=80&auto=format&fit=crop"

export const FeaturedRecipe = () => {
  const { data: recipes = [], isLoading } = useRecipes()

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl bg-muted">
        <div className="flex min-h-[280px] flex-col justify-end p-6 sm:min-h-[320px] sm:p-8">
          <div className="space-y-3">
            <Skeleton className="h-6 w-32 rounded-full bg-muted-foreground/10" />
            <Skeleton className="h-10 w-64 bg-muted-foreground/10" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full bg-muted-foreground/10" />
              <Skeleton className="h-5 w-20 rounded-full bg-muted-foreground/10" />
              <Skeleton className="h-5 w-14 rounded-full bg-muted-foreground/10" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (recipes.length === 0) return null

  const latest = recipes[recipes.length - 1]

  return (
    <Link
      href={`/recipes/${latest.id}`}
      className="group relative block overflow-hidden rounded-2xl shadow-md transition-shadow duration-500 hover:shadow-2xl"
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          priority
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

      <div className="relative flex min-h-[280px] flex-col justify-end p-6 sm:min-h-[320px] sm:p-8">
        <div className="space-y-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-md">
            <span className="text-sm" aria-hidden="true">
              ⭐
            </span>
            <span className="text-xs font-extrabold tracking-widest text-white/90 uppercase">
              Latest Recipe
            </span>
          </span>

          <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-4xl">
            {latest.name}
          </h2>

          <div className="flex flex-wrap gap-1.5">
            {latest.ingredients.slice(0, 5).map((ing) => (
              <Badge
                key={ing.ingredientId}
                variant="outline"
                className="rounded-full border-white/20 bg-white/10 text-xs font-semibold text-white backdrop-blur-sm"
              >
                {ing.name}
              </Badge>
            ))}
            {latest.ingredients.length > 5 && (
              <Badge
                variant="outline"
                className="rounded-full border-white/20 bg-white/10 text-xs font-semibold text-white backdrop-blur-sm"
              >
                +{latest.ingredients.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
