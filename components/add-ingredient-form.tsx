"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { toast } from "sonner"

import { useCreateIngredient } from "@/hooks/use-ingredients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError } from "@/components/ui/field"

const ingredientSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  unit: z.string().min(1, "Unit is required").trim(),
  category: z.string().min(1, "Category is required").trim(),
})

type IngredientFormValues = z.infer<typeof ingredientSchema>

export const AddIngredientForm = () => {
  const form = useForm<IngredientFormValues>({
    resolver: standardSchemaResolver(ingredientSchema),
    defaultValues: { name: "", unit: "", category: "" },
  })

  const mutation = useCreateIngredient()

  const onSubmit = (data: IngredientFormValues) => {
    mutation.mutate(data, {
      onSuccess: () => {
        form.reset()
        toast.success("Ingredient added")
      },
    })
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-wrap items-start gap-2 rounded-2xl bg-card p-4"
    >
      <Field className="min-w-0 flex-2">
        <Input
          id="ingredient-name"
          placeholder="Name (e.g. Flour)"
          aria-label="Name"
          {...form.register("name")}
          aria-invalid={!!form.formState.errors.name}
          className="h-10 rounded-full border border-foreground/20 bg-card px-4 text-sm font-bold placeholder:font-normal placeholder:text-foreground/30"
        />
        <FieldError errors={[form.formState.errors.name]} />
      </Field>
      <Field className="w-28 flex-1 shrink-0">
        <Input
          id="ingredient-unit"
          placeholder="Unit"
          aria-label="Unit"
          {...form.register("unit")}
          aria-invalid={!!form.formState.errors.unit}
          className="h-10 rounded-full border border-foreground/20 bg-card px-4 text-sm font-bold placeholder:font-normal placeholder:text-foreground/30"
        />
        <FieldError errors={[form.formState.errors.unit]} />
      </Field>
      <Field className="w-28 flex-1 shrink-0">
        <Input
          id="ingredient-category"
          placeholder="Category"
          aria-label="Category"
          {...form.register("category")}
          aria-invalid={!!form.formState.errors.category}
          className="h-10 rounded-full border border-foreground/20 bg-card px-4 text-sm font-bold placeholder:font-normal placeholder:text-foreground/30"
        />
        <FieldError errors={[form.formState.errors.category]} />
      </Field>
      <Button
        type="submit"
        disabled={mutation.isPending}
        className="h-10 shrink-0 rounded-full px-5 text-sm font-bold"
      >
        {mutation.isPending ? "Adding…" : "Add"}
      </Button>
    </form>
  )
}
