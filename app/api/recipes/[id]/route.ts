import { NextRequest } from 'next/server';
import { getStore, saveStore } from '@/lib/store';
import { resolveRecipe } from '@/lib/recipe-utils';
import type { RecipeIngredientType } from '@/lib/types';

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const store = getStore();

  const recipe = store.recipes.find((r) => r.id === id);
  if (!recipe) {
    return Response.json({ error: 'Recipe not found' }, { status: 404 });
  }

  return Response.json(resolveRecipe(recipe, store.ingredients));
};

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const body = await request.json();
  const { name, ingredients, instructions } = body;

  if (!name || !Array.isArray(ingredients) || ingredients.length === 0) {
    return Response.json(
      { error: 'name and at least one ingredient are required' },
      { status: 400 },
    );
  }

  const store = getStore();
  const index = store.recipes.findIndex((r) => r.id === id);
  if (index === -1) {
    return Response.json({ error: 'Recipe not found' }, { status: 404 });
  }

  store.recipes[index] = {
    id,
    name: String(name).trim(),
    ingredients: ingredients as RecipeIngredientType[],
    ...(instructions ? { instructions: String(instructions).trim() } : {}),
  };
  saveStore(store);

  return Response.json(store.recipes[index]);
};

export const DELETE = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const store = getStore();

  const exists = store.recipes.some((r) => r.id === id);
  if (!exists) {
    return Response.json({ error: 'Recipe not found' }, { status: 404 });
  }

  store.recipes = store.recipes.filter((r) => r.id !== id);
  saveStore(store);

  return new Response(null, { status: 204 });
};
