import type {
  IngredientType,
  RecipeIngredientType,
  RecipeType,
  RecipeWithIngredientsType,
} from './types';
import { API_ENDPOINTS } from './constants';

export const fetchIngredients = async (): Promise<IngredientType[]> => {
  const res = await fetch(API_ENDPOINTS.ingredients);
  if (!res.ok) throw new Error('Failed to fetch ingredients');
  return res.json();
};

export const createIngredient = async (
  data: Omit<IngredientType, 'id'>,
): Promise<IngredientType> => {
  const res = await fetch(API_ENDPOINTS.ingredients, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create ingredient');
  return res.json();
};

export const deleteIngredient = async (id: string): Promise<void> => {
  const res = await fetch(API_ENDPOINTS.ingredient(id), { method: 'DELETE' });
  if (res.status === 409) {
    const body = await res.json();
    throw new Error(body.error ?? 'Ingredient is used in a recipe');
  }
  if (!res.ok) throw new Error('Failed to delete ingredient');
};

export const fetchRecipes = async (): Promise<RecipeWithIngredientsType[]> => {
  const res = await fetch(API_ENDPOINTS.recipes);
  if (!res.ok) throw new Error('Failed to fetch recipes');
  return res.json();
};

export const createRecipe = async (
  data: Omit<RecipeType, 'id'>,
): Promise<RecipeType> => {
  const res = await fetch(API_ENDPOINTS.recipes, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create recipe');
  return res.json();
};

export const deleteRecipe = async (id: string): Promise<void> => {
  const res = await fetch(API_ENDPOINTS.recipe(id), { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete recipe');
};

export const fetchRecipe = async (
  id: string,
): Promise<RecipeWithIngredientsType> => {
  const res = await fetch(API_ENDPOINTS.recipe(id));
  if (!res.ok) throw new Error('Failed to fetch recipe');
  return res.json();
};

export const updateRecipe = async (
  id: string,
  data: { name: string; ingredients: RecipeIngredientType[] },
): Promise<RecipeType> => {
  const res = await fetch(API_ENDPOINTS.recipe(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update recipe');
  return res.json();
};
