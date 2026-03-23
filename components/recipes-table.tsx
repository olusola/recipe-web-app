"use client"
"use no memo"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, Pencil, Search, Trash2 } from "lucide-react"
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { useDeleteRecipe, useRecipes } from "@/hooks/use-recipes"
import {
  PAGE_SIZE,
  MAX_VISIBLE_INGREDIENTS,
  SECTION_LABEL,
} from "@/lib/constants"
import { Skeleton } from "@/components/ui/skeleton"
import type { RecipeWithIngredientsType } from "@/lib/types"
import { EditRecipeDrawer } from "@/components/edit-recipe-drawer"
import { PaginationControls } from "@/components/pagination-controls"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"

const columnHelper = createColumnHelper<RecipeWithIngredientsType>()

const columns = [
  columnHelper.accessor("name", {}),
  columnHelper.accessor((row) => row.ingredients.map((i) => i.name).join(" "), {
    id: "ingredients",
  }),
]

export const RecipesTable = () => {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [editingRecipe, setEditingRecipe] =
    useState<RecipeWithIngredientsType | null>(null)

  const { data: recipes = [], isLoading } = useRecipes()
  const deleteMutation = useDeleteRecipe()

  // eslint-disable-next-line react-hooks/incompatible-library -- opted out via "use no memo"
  const table = useReactTable({
    data: recipes,
    columns,
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 w-full rounded-full sm:h-16" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-2xl border bg-card px-4 py-3.5 sm:grid sm:grid-cols-[180px_1fr_88px_20px] sm:items-center sm:gap-4 sm:px-5 sm:py-4"
          >
            <Skeleton className="h-5 w-32" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="hidden h-5 w-16 sm:block" />
            <div />
          </div>
        ))}
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <Empty className="min-h-60 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search className="h-5 w-5" />
          </EmptyMedia>
          <EmptyTitle>No recipes yet</EmptyTitle>
          <EmptyDescription>
            Create your first recipe to get started. You can add ingredients,
            instructions, and more.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-foreground/40 sm:left-5 sm:h-6 sm:w-6" />
        <Input
          placeholder="Search by name or ingredient…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-14 rounded-full border bg-card pl-11 text-base font-bold placeholder:font-bold placeholder:text-foreground/30 sm:h-16 sm:pl-14 sm:text-lg"
        />
      </div>

      <div>
        <div className="hidden grid-cols-[180px_1fr_88px_20px] gap-4 px-5 py-3 sm:grid">
          <span className={SECTION_LABEL}>Recipe Name</span>
          <span className={SECTION_LABEL}>Ingredients</span>
          <span />
          <span />
        </div>

        <div className="space-y-3">
          {table.getRowModel().rows.map((row) => {
            const recipe = row.original
            const visibleIngredients = recipe.ingredients.slice(
              0,
              MAX_VISIBLE_INGREDIENTS
            )
            const remaining =
              recipe.ingredients.length - MAX_VISIBLE_INGREDIENTS
            return (
              <div
                key={recipe.id}
                className="group flex cursor-pointer flex-col gap-2 rounded-2xl border bg-card px-4 py-3.5 transition-colors hover:bg-accent/40 sm:grid sm:grid-cols-[180px_1fr_88px_20px] sm:items-center sm:gap-4 sm:px-5 sm:py-4"
                onClick={() => router.push(`/recipes/${recipe.id}`)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="block truncate text-base font-extrabold tracking-tight">
                      {recipe.name}
                    </span>
                    {recipe.instructions && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {recipe.instructions}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1 sm:hidden">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="hover:bg-foreground/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingRecipe(recipe)
                      }}
                      aria-label={`Edit ${recipe.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMutation.mutate(recipe.id)
                      }}
                      aria-label={`Delete ${recipe.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {visibleIngredients.map((ing) => (
                    <Badge
                      key={ing.ingredientId}
                      variant="secondary"
                      className="font-semibold"
                    >
                      {ing.name}
                    </Badge>
                  ))}
                  {remaining > 0 && (
                    <Badge
                      variant="outline"
                      className="font-semibold text-muted-foreground"
                    >
                      +{remaining} more
                    </Badge>
                  )}
                </div>
                <div className="hidden justify-end gap-1 sm:flex">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="hover:bg-foreground/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingRecipe(recipe)
                    }}
                    aria-label={`Edit ${recipe.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteMutation.mutate(recipe.id)
                    }}
                    aria-label={`Delete ${recipe.name}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground/0 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground/50 sm:block" />
              </div>
            )
          })}
        </div>
      </div>

      {(() => {
        const totalFiltered = table.getFilteredRowModel().rows.length
        const { pageIndex, pageSize } = table.getState().pagination
        const from = totalFiltered === 0 ? 0 : pageIndex * pageSize + 1
        const to = Math.min((pageIndex + 1) * pageSize, totalFiltered)
        return (
          <PaginationControls
            from={from}
            to={to}
            total={totalFiltered}
            pageIndex={pageIndex}
            pageCount={table.getPageCount()}
            canPreviousPage={table.getCanPreviousPage()}
            canNextPage={table.getCanNextPage()}
            onPreviousPage={() => table.previousPage()}
            onNextPage={() => table.nextPage()}
          />
        )
      })()}

      {editingRecipe && (
        <EditRecipeDrawer
          recipe={editingRecipe}
          open={!!editingRecipe}
          onOpenChange={(open) => {
            if (!open) setEditingRecipe(null)
          }}
        />
      )}
    </div>
  )
}
