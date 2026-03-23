export type IngredientType = {
  id: string;
  name: string;
  unit: string;
  category: string;
};

export type RecipeIngredientType = {
  ingredientId: string;
  quantity: number;
};

export type RecipeType = {
  id: string;
  name: string;
  ingredients: RecipeIngredientType[];
  instructions?: string;
};

export type StoreDataType = {
  ingredients: IngredientType[];
  recipes: RecipeType[];
};

/** A recipe with ingredient names resolved — used for display in the UI */
export type RecipeWithIngredientsType = Omit<RecipeType, 'ingredients'> & {
  ingredients: Array<RecipeIngredientType & { name: string; unit: string }>;
};

/** A recipe match result — used by the Recipe Finder panel */
export type RecipeMatchType = {
  recipe: RecipeWithIngredientsType;
  matchCount: number;
  totalIngredients: number;
};
