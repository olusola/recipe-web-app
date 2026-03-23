"use client"
"use no memo"

import { useState, useMemo } from "react"
import { Search, Trash2, Info } from "lucide-react"
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { useDeleteIngredient, useIngredients } from "@/hooks/use-ingredients"
import { useRecipes } from "@/hooks/use-recipes"
import { PAGE_SIZE, SECTION_LABEL } from "@/lib/constants"
import type { IngredientType, RecipeWithIngredientsType } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { Input } from "@/components/ui/input"
import { PaginationControls } from "@/components/pagination-controls"

const columnHelper = createColumnHelper<IngredientType>()

const columns = [
  columnHelper.accessor("name", {}),
  columnHelper.accessor("unit", {}),
  columnHelper.accessor("category", {}),
]

type IngredientsTableProps = {
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onSelectAll: (ids: string[]) => void
  onDeselectAll: () => void
}

export const IngredientsTable = ({
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: IngredientsTableProps) => {
  const [globalFilter, setGlobalFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [pendingDelete, setPendingDelete] = useState<IngredientType | null>(
    null
  )

  const { data: ingredients = [], isLoading } = useIngredients()
  const { data: recipes = [] } = useRecipes()
  const deleteMutation = useDeleteIngredient()

  const categories = useMemo(
    () =>
      [
        ...new Set(ingredients.map((i: IngredientType) => i.category)),
      ].sort() as string[],
    [ingredients]
  )

  const filteredByCategory = useMemo(
    () =>
      categoryFilter
        ? ingredients.filter(
            (i: IngredientType) => i.category === categoryFilter
          )
        : ingredients,
    [ingredients, categoryFilter]
  )

  // eslint-disable-next-line react-hooks/incompatible-library -- opted out via "use no memo"
  const table = useReactTable({
    data: filteredByCategory,
    columns,
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const getRecipesUsingIngredient = (ingredientId: string) =>
    recipes.filter((r: RecipeWithIngredientsType) =>
      r.ingredients.some((i) => i.ingredientId === ingredientId)
    )

  const handleConfirmDelete = () => {
    if (pendingDelete) {
      deleteMutation.mutate(pendingDelete.id)
      setPendingDelete(null)
    }
  }

  if (isLoading) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        Loading ingredients…
      </p>
    )
  }

  if (ingredients.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        No ingredients yet. Add one above.
      </p>
    )
  }

  const rows = table.getRowModel().rows
  const totalFiltered = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  const from = totalFiltered === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, totalFiltered)

  const visibleIds = rows.map((r) => r.original.id)
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id))
  const someVisibleSelected =
    !allVisibleSelected && visibleIds.some((id) => selectedIds.has(id))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-foreground/40 sm:left-5 sm:h-6 sm:w-6" />
          <Input
            placeholder="Search by name, unit or category…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-14 rounded-full border bg-card pl-11 text-base font-bold placeholder:font-bold placeholder:text-foreground/30 sm:h-16 sm:pl-14 sm:text-lg"
          />
        </div>
        {selectedIds.size > 0 && (
          <Badge
            variant="default"
            className="shrink-0 rounded-full px-3 py-1 text-xs font-bold"
          >
            {selectedIds.size} selected
          </Badge>
        )}
      </div>

      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button
            variant={categoryFilter === "" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCategoryFilter("")
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            className="h-8 shrink-0 rounded-full px-4 text-xs font-bold"
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCategoryFilter(cat)
                setPagination((p) => ({ ...p, pageIndex: 0 }))
              }}
              className="h-8 shrink-0 rounded-full px-4 text-xs font-bold"
            >
              {cat} (
              {
                ingredients.filter((i: IngredientType) => i.category === cat)
                  .length
              }
              )
            </Button>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-card">
        <div className="hidden grid-cols-[28px_1fr_80px_100px_36px] gap-3 border-b px-4 py-3 sm:grid">
          <Checkbox
            checked={
              allVisibleSelected
                ? true
                : someVisibleSelected
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={() =>
              allVisibleSelected ? onDeselectAll() : onSelectAll(visibleIds)
            }
            aria-label="Select all visible ingredients"
          />
          <span className={SECTION_LABEL}>Name</span>
          <span className={SECTION_LABEL}>Unit</span>
          <span className={SECTION_LABEL}>Category</span>
          <span />
        </div>

        <div className="divide-y">
          {rows.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No ingredients match your search.
            </p>
          ) : (
            rows.map((row) => {
              const ing = row.original
              const inUse = getRecipesUsingIngredient(ing.id).length > 0
              const isSelected = selectedIds.has(ing.id)
              return (
                <div
                  key={ing.id}
                  data-selected={isSelected}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50 data-[selected=true]:bg-primary/5 sm:grid sm:grid-cols-[28px_1fr_80px_100px_36px] sm:gap-3 sm:px-4 sm:py-4"
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggle(ing.id)}
                    aria-label={`Select ${ing.name}`}
                    className="shrink-0"
                  />
                  <span className="flex-1 truncate font-extrabold tracking-tight">
                    {ing.name}
                  </span>
                  <div className="flex items-center gap-2 sm:contents">
                    <Badge
                      variant="secondary"
                      className="rounded-full font-semibold"
                    >
                      {ing.unit}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="hidden rounded-full font-semibold sm:inline-flex"
                    >
                      {ing.category}
                    </Badge>
                    {inUse ? (
                      <span className="group/tip relative flex items-center">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled
                          aria-label={`Cannot delete ${ing.name} — used in a recipe`}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground/40" />
                        </Button>
                        <span className="pointer-events-none absolute right-full mr-1 hidden rounded-md bg-foreground px-2 py-1 text-[11px] font-medium whitespace-nowrap text-background opacity-0 transition-opacity group-hover/tip:opacity-100 sm:block">
                          Used in a recipe
                        </span>
                        <Info className="h-3 w-3 text-muted-foreground/50 sm:hidden" />
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="hover:bg-destructive/10"
                        onClick={() => setPendingDelete(ing)}
                        aria-label={`Delete ${ing.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="self-start rounded-full font-semibold sm:hidden"
                  >
                    {ing.category}
                  </Badge>
                </div>
              )
            })
          )}
        </div>
      </div>

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

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete ingredient"
        description={`Are you sure you want to delete \u201c${pendingDelete?.name}\u201d? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
