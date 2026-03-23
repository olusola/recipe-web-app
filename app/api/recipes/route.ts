import { NextRequest } from 'next/server';
import { getStore, saveStore, generateNextId } from '@/lib/store';
import { resolveRecipe } from '@/lib/recipe-utils';
import type { RecipeIngredientType } from '@/lib/types';

export const GET = async () => {
  const store = getStore();
  const recipes = store.recipes.map((r) => resolveRecipe(r, store.ingredients));
  return Response.json(recipes);
};

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const { name, ingredients, instructions } = body;

  if (!name || !Array.isArray(ingredients) || ingredients.length === 0) {
    return Response.json(
      { error: 'name and at least one ingredient are required' },
      { status: 400 },
    );
  }

  const store = getStore();
  const newRecipe = {
    id: generateNextId('rec', store.recipes),
    name: String(name).trim(),
    ingredients: ingredients as RecipeIngredientType[],
    ...(instructions ? { instructions: String(instructions).trim() } : {}),
  };

  store.recipes.push(newRecipe);
  saveStore(store);

  return Response.json(newRecipe, { status: 201 });
};
