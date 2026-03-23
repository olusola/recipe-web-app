"use client"

import { Trash2 } from "lucide-react"
import type { IngredientType } from "@/lib/types"
import type { IngredientRow } from "@/hooks/use-recipe-form"
import { SECTION_LABEL } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

type Size = "default" | "compact"

type RecipeIngredientInputProps = {
  idPrefix: string
  size?: Size
  availableIngredients: IngredientType[]
  selectedIngredientId: string
  onIngredientChange: (value: string) => void
  quantity: string
  onQuantityChange: (value: string) => void
  onAdd: () => void
  onRemove: (ingredientId: string) => void
  rows: IngredientRow[]
  error?: string
}

const sizeConfig = {
  default: {
    input: "h-12",
    select: "h-12 data-[size=default]:h-12",
    qty: "h-12 px-4",
    fieldWidth: "w-full sm:w-28",
    gap: "flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3",
    btnPx: "px-5",
    btnLabel: "Add Ingredient",
  },
  compact: {
    input: "h-9 text-sm",
    select: "h-9 text-sm data-[size=default]:h-9",
    qty: "h-9 px-3 text-sm",
    fieldWidth: "w-20",
    gap: "items-center gap-2",
    btnPx: "px-4 text-sm",
    btnLabel: "Add",
  },
} as const

export const RecipeIngredientInput = ({
  idPrefix,
  size = "default",
  availableIngredients,
  selectedIngredientId,
  onIngredientChange,
  quantity,
  onQuantityChange,
  onAdd,
  onRemove,
  rows,
  error,
}: RecipeIngredientInputProps) => {
  const s = sizeConfig[size]

  return (
    <div className="space-y-3">
      <Label className={SECTION_LABEL}>Ingredients</Label>
      <Separator />
      <div className={`flex ${s.gap}`}>
        <Field className="min-w-0 flex-1">
          <Select
            value={selectedIngredientId}
            onValueChange={onIngredientChange}
          >
            <SelectTrigger
              id={`${idPrefix}-select`}
              className={`${s.select} w-full rounded-full border border-foreground/20 bg-card px-4 font-semibold`}
            >
              <SelectValue placeholder="Select ingredient" />
            </SelectTrigger>
            <SelectContent>
              {availableIngredients.map((ing: IngredientType) => (
                <SelectItem key={ing.id} value={ing.id}>
                  {ing.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field className={`${s.fieldWidth} shrink-0`}>
          <Input
            id={`${idPrefix}-quantity`}
            type="number"
            min="0.01"
            step="any"
            placeholder="Qty"
            aria-label="Quantity"
            value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
            className={`${s.qty} rounded-full border border-foreground/20 bg-card font-bold`}
          />
        </Field>

        <Button
          type="button"
          variant="default"
          onClick={onAdd}
          disabled={!selectedIngredientId || !quantity}
          className={`${s.input} rounded-full ${s.btnPx} shrink-0 font-bold`}
        >
          {s.btnLabel}
        </Button>
      </div>

      {error && <FieldError>{error}</FieldError>}

      {rows.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {rows.map((row) => (
            <div
              key={row.ingredientId}
              className="flex items-center gap-1.5 rounded-full border bg-card py-1 pr-1 pl-3"
            >
              <span className="text-sm font-bold tracking-tight">
                {row.name}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {row.quantity} {row.unit}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onRemove(row.ingredientId)}
                aria-label={`Remove ${row.name}`}
                className="h-5 w-5 rounded-full"
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
