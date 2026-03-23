import type {
  IngredientType,
  RecipeIngredientType,
  RecipeMatchType,
  RecipeType,
  RecipeWithIngredientsType,
} from './types';

export const resolveRecipe = (
  recipe: RecipeType,
  ingredients: IngredientType[],
): RecipeWithIngredientsType => ({
  ...recipe,
  ingredients: recipe.ingredients.map((ri: RecipeIngredientType) => {
    const ing = ingredients.find((i) => i.id === ri.ingredientId);
    return { ...ri, name: ing?.name ?? 'Unknown', unit: ing?.unit ?? '' };
  }),
});

export const getRecommendedRecipes = (
  current: RecipeWithIngredientsType,
  allRecipes: RecipeWithIngredientsType[],
  count = 3,
): RecipeWithIngredientsType[] => {
  const currentIngredientIds = new Set(
    current.ingredients.map((i) => i.ingredientId),
  );

  return allRecipes
    .filter((r) => r.id !== current.id)
    .map((recipe) => ({
      recipe,
      overlap: recipe.ingredients.filter((i) =>
        currentIngredientIds.has(i.ingredientId),
      ).length,
    }))
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, count)
    .map(({ recipe }) => recipe);
};

/**
 * Find recipes that contain ANY of the given ingredient IDs,
 * ranked by how many selected ingredients each recipe uses.
 */
export const getRecipesByIngredients = (
  ingredientIds: Set<string>,
  allRecipes: RecipeWithIngredientsType[],
): RecipeMatchType[] => {
  if (ingredientIds.size === 0) return [];

  return allRecipes
    .map((recipe) => ({
      recipe,
      matchCount: recipe.ingredients.filter((i) =>
        ingredientIds.has(i.ingredientId),
      ).length,
      totalIngredients: recipe.ingredients.length,
    }))
    .filter(({ matchCount }) => matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount);
};
