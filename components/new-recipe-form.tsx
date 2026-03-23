"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useCreateRecipe } from "@/hooks/use-recipes"
import { useRecipeForm } from "@/hooks/use-recipe-form"
import { SECTION_LABEL } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { RecipeIngredientInput } from "@/components/recipe-ingredient-input"
import { Textarea } from "@/components/ui/textarea"

export const NewRecipeForm = () => {
  const router = useRouter()
  const createMutation = useCreateRecipe()

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
  } = useRecipeForm()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    createMutation.mutate(getPayload(), {
      onSuccess: () => {
        toast.success("Recipe created")
        router.push("/recipes")
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
    >
      <Field>
        <FieldLabel htmlFor="recipe-name" className={SECTION_LABEL}>
          Recipe Name
        </FieldLabel>
        <Input
          id="recipe-name"
          placeholder="e.g. Chocolate Cake"
          value={recipeName}
          onChange={(e) => {
            setRecipeName(e.target.value)
            if (nameError) setNameError("")
          }}
          aria-invalid={!!nameError}
          className="h-11 rounded-full border px-5 text-sm font-bold placeholder:font-bold placeholder:text-foreground/30"
        />
        {nameError && <FieldError>{nameError}</FieldError>}
      </Field>

      <RecipeIngredientInput
        idPrefix="ingredient"
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
        <FieldLabel htmlFor="recipe-instructions" className={SECTION_LABEL}>
          Instructions
        </FieldLabel>
        <Textarea
          id="recipe-instructions"
          placeholder="Describe how to prepare the recipe…"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={3}
          className="resize-none rounded-xl border px-4 py-3 text-sm font-semibold placeholder:font-semibold placeholder:text-foreground/30"
        />
      </Field>

      <Button
        type="submit"
        size="lg"
        disabled={createMutation.isPending}
        className="h-11 w-full rounded-full px-8 text-sm font-extrabold"
      >
        {createMutation.isPending ? "Saving…" : "Save Recipe"}
      </Button>
    </form>
  )
}
