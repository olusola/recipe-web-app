"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useDeleteRecipe, useUpdateRecipe } from "@/hooks/use-recipes"
import { useRecipeForm } from "@/hooks/use-recipe-form"
import { SECTION_LABEL } from "@/lib/constants"
import type { RecipeWithIngredientsType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { RecipeIngredientInput } from "@/components/recipe-ingredient-input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

type EditRecipeDrawerProps = {
  recipe: RecipeWithIngredientsType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const EditRecipeDrawer = ({
  recipe,
  open,
  onOpenChange,
}: EditRecipeDrawerProps) => {
  const router = useRouter()
  const deleteMutation = useDeleteRecipe()
  const [pendingDelete, setPendingDelete] = useState(false)

  const handleClose = () => onOpenChange(false)

  return (
    <>
      <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-extrabold tracking-tight">
              Edit Recipe
            </DrawerTitle>
            <DrawerDescription className="text-xs font-bold tracking-widest text-foreground/40 uppercase">
              Update the recipe details below.
            </DrawerDescription>
          </DrawerHeader>

          <EditRecipeForm
            key={recipe.id}
            recipe={recipe}
            onClose={handleClose}
            onRequestDelete={() => setPendingDelete(true)}
            isDeleting={deleteMutation.isPending}
          />
        </DrawerContent>
      </Drawer>

      <ConfirmDeleteDialog
        open={pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(false)}
        title="Delete recipe"
        description={`Are you sure you want to delete \u201c${recipe.name}\u201d? This action cannot be undone.`}
        onConfirm={() => {
          deleteMutation.mutate(recipe.id, {
            onSuccess: () => {
              handleClose()
              router.push("/recipes")
            },
          })
        }}
      />
    </>
  )
}

const EditRecipeForm = ({
  recipe,
  onClose,
  onRequestDelete,
  isDeleting,
}: {
  recipe: RecipeWithIngredientsType
  onClose: () => void
  onRequestDelete: () => void
  isDeleting: boolean
}) => {
  const mutation = useUpdateRecipe(recipe.id)

  const {
    recipeName,
    setRecipeName,
    instructions,
    setInstructions,
    selectedIngredientId,
    setSelectedIngredientId,
    quantity,
    setQuantity,
    rows,
    nameError,
    setNameError,
    ingredientsError,
    availableIngredients,
    handleAddIngredient,
    handleRemoveIngredient,
    validate,
    getPayload,
  } = useRecipeForm({
    initialName: recipe.name,
    initialInstructions: recipe.instructions ?? "",
    initialRows: recipe.ingredients,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    mutation.mutate(getPayload(), {
      onSuccess: () => {
        onClose()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6 px-4">
          <Field>
            <FieldLabel htmlFor="edit-recipe-name" className={SECTION_LABEL}>
              Recipe Name
            </FieldLabel>
            <Input
              id="edit-recipe-name"
              placeholder="e.g. Chocolate Cake"
              value={recipeName}
              onChange={(e) => {
                setRecipeName(e.target.value)
                if (nameError) setNameError("")
              }}
              aria-invalid={!!nameError}
              className="h-10 rounded-full border bg-card px-5 text-sm font-bold placeholder:font-bold placeholder:text-foreground/30"
            />
            {nameError && <FieldError>{nameError}</FieldError>}
          </Field>

          <RecipeIngredientInput
            idPrefix="edit"
            size="compact"
            availableIngredients={availableIngredients}
            selectedIngredientId={selectedIngredientId}
            onIngredientChange={setSelectedIngredientId}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAdd={handleAddIngredient}
            onRemove={handleRemoveIngredient}
            rows={rows}
            error={ingredientsError}
          />

          <Field>
            <FieldLabel
              htmlFor="edit-recipe-instructions"
              className={SECTION_LABEL}
            >
              Instructions
            </FieldLabel>
            <Separator />
            <Textarea
              id="edit-recipe-instructions"
              placeholder="Describe how to prepare the recipe…"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              className="resize-y rounded-2xl border bg-card px-4 py-3 text-sm font-semibold placeholder:font-semibold placeholder:text-foreground/30"
            />
          </Field>
        </form>

        <div className="mx-4 mt-4 space-y-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4">
          <p className="text-xs font-extrabold tracking-widest text-destructive/70 uppercase">
            Danger Zone
          </p>
          <p className="text-sm text-muted-foreground">
            Permanently delete this recipe. This action cannot be undone.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onRequestDelete}
            disabled={isDeleting}
            className="h-10 rounded-full px-5 font-bold"
          >
            <Trash2 className="h-4 w-4" />
            Delete Recipe
          </Button>
        </div>
      </div>

      <DrawerFooter>
        <Button
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="h-12 rounded-full px-8 text-base font-extrabold"
        >
          {mutation.isPending ? "Saving…" : "Save Changes"}
        </Button>
        <DrawerClose asChild>
          <Button
            variant="outline"
            className="h-12 rounded-full px-8 font-bold"
          >
            Cancel
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </>
  )
}
