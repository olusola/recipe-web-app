import { useState } from 'react';
import type { IngredientType, RecipeIngredientType } from '@/lib/types';
import { useIngredients } from '@/hooks/use-ingredients';

export type IngredientRow = RecipeIngredientType & {
  name: string;
  unit: string;
};

type UseRecipeFormOptions = {
  initialName?: string;
  initialInstructions?: string;
  initialRows?: IngredientRow[];
};

export const useRecipeForm = ({
  initialName = '',
  initialInstructions = '',
  initialRows = [],
}: UseRecipeFormOptions = {}) => {
  const { data: ingredients = [] } = useIngredients();

  const [recipeName, setRecipeName] = useState(initialName);
  const [instructions, setInstructions] = useState(initialInstructions);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [rows, setRows] = useState<IngredientRow[]>(initialRows);
  const [nameError, setNameError] = useState('');
  const [ingredientsError, setIngredientsError] = useState('');

  const availableIngredients = ingredients.filter(
    (ing: IngredientType) => !rows.some((r) => r.ingredientId === ing.id),
  );

  const handleAddIngredient = () => {
    if (!selectedIngredientId || !quantity) return;

    const ingredient = ingredients.find(
      (i: IngredientType) => i.id === selectedIngredientId,
    );
    if (!ingredient) return;

    const qty = Number(quantity);
    if (qty <= 0) return;

    setRows((prev) => [
      ...prev,
      {
        ingredientId: ingredient.id,
        quantity: qty,
        name: ingredient.name,
        unit: ingredient.unit,
      },
    ]);
    setSelectedIngredientId('');
    setQuantity('');
    setIngredientsError('');
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setRows((prev) => prev.filter((r) => r.ingredientId !== ingredientId));
  };

  const validate = (): boolean => {
    let hasError = false;
    if (!recipeName.trim()) {
      setNameError('Recipe name is required');
      hasError = true;
    } else {
      setNameError('');
    }

    if (rows.length === 0) {
      setIngredientsError('At least one ingredient is required');
      hasError = true;
    } else {
      setIngredientsError('');
    }

    return !hasError;
  };

  const getPayload = () => ({
    name: recipeName.trim(),
    ingredients: rows.map(({ ingredientId, quantity: qty }) => ({
      ingredientId,
      quantity: qty,
    })),
    ...(instructions.trim() ? { instructions: instructions.trim() } : {}),
  });

  return {
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
  };
};
