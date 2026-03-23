import {
  getRecipesByIngredients,
  getRecommendedRecipes,
} from '@/lib/recipe-utils';
import type { RecipeWithIngredientsType } from '@/lib/types';

const makeRecipe = (
  id: string,
  name: string,
  ingredientIds: string[],
): RecipeWithIngredientsType => ({
  id,
  name,
  ingredients: ingredientIds.map((iid) => ({
    ingredientId: iid,
    quantity: 1,
    name: iid,
    unit: 'g',
  })),
});

const recipes: RecipeWithIngredientsType[] = [
  makeRecipe('r1', 'Pancakes', ['flour', 'eggs', 'sugar']),
  makeRecipe('r2', 'Waffles', ['flour', 'eggs', 'butter']),
  makeRecipe('r3', 'Omelette', ['eggs', 'cheese']),
  makeRecipe('r4', 'Bread', ['flour', 'yeast', 'salt']),
  makeRecipe('r5', 'Salad', ['lettuce', 'tomato']),
];

describe('getRecommendedRecipes', () => {
  it('returns recipes sorted by number of shared ingredients', () => {
    const result = getRecommendedRecipes(recipes[0], recipes);

    // Pancakes: flour, eggs, sugar
    // Waffles: flour, eggs (2 overlap) → first
    // Omelette: eggs (1 overlap)
    // Bread: flour (1 overlap)
    expect(result.map((r) => r.id)).toEqual(['r2', 'r3', 'r4']);
  });

  it('excludes the current recipe from results', () => {
    const result = getRecommendedRecipes(recipes[0], recipes);
    expect(result.find((r) => r.id === 'r1')).toBeUndefined();
  });

  it('excludes recipes with zero overlapping ingredients', () => {
    const result = getRecommendedRecipes(recipes[0], recipes);
    // Salad has no overlap with Pancakes
    expect(result.find((r) => r.id === 'r5')).toBeUndefined();
  });

  it('returns at most `count` results', () => {
    const result = getRecommendedRecipes(recipes[0], recipes, 2);
    expect(result).toHaveLength(2);
  });

  it('returns empty array when no other recipes share ingredients', () => {
    const result = getRecommendedRecipes(recipes[4], recipes);
    // Salad: lettuce, tomato — no overlap with anything
    expect(result).toEqual([]);
  });

  it('returns empty array when there are no other recipes', () => {
    const result = getRecommendedRecipes(recipes[0], [recipes[0]]);
    expect(result).toEqual([]);
  });
});

describe('getRecipesByIngredients', () => {
  it('returns empty array when no ingredient IDs are provided', () => {
    const result = getRecipesByIngredients(new Set(), recipes);
    expect(result).toEqual([]);
  });

  it('returns matching recipes sorted by overlap count', () => {
    const result = getRecipesByIngredients(new Set(['flour', 'eggs']), recipes);
    // Pancakes: flour + eggs (2), Waffles: flour + eggs (2), Omelette: eggs (1), Bread: flour (1)
    expect(result.map((m) => m.recipe.id)).toEqual(['r1', 'r2', 'r3', 'r4']);
    expect(result[0].matchCount).toBe(2);
    expect(result[0].totalIngredients).toBe(3);
    expect(result[2].matchCount).toBe(1);
  });

  it('excludes recipes with zero overlapping ingredients', () => {
    const result = getRecipesByIngredients(new Set(['flour']), recipes);
    // Salad has no flour
    expect(result.find((m) => m.recipe.id === 'r5')).toBeUndefined();
  });

  it('returns a single match when only one recipe uses the ingredient', () => {
    const result = getRecipesByIngredients(new Set(['lettuce']), recipes);
    expect(result).toHaveLength(1);
    expect(result[0].recipe.id).toBe('r5');
    expect(result[0].matchCount).toBe(1);
    expect(result[0].totalIngredients).toBe(2);
  });

  it('includes matchCount and totalIngredients correctly', () => {
    const result = getRecipesByIngredients(
      new Set(['flour', 'eggs', 'sugar']),
      recipes,
    );
    const pancakes = result.find((m) => m.recipe.id === 'r1')!;
    expect(pancakes.matchCount).toBe(3);
    expect(pancakes.totalIngredients).toBe(3);
  });
});
