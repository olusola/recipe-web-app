import { NextRequest } from 'next/server';
import { getStore, saveStore } from '@/lib/store';

export const DELETE = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const store = getStore();

  const ingredient = store.ingredients.find((i) => i.id === id);
  if (!ingredient) {
    return Response.json({ error: 'Ingredient not found' }, { status: 404 });
  }

  const usedInRecipe = store.recipes.some((r) =>
    r.ingredients.some((ri) => ri.ingredientId === id),
  );
  if (usedInRecipe) {
    return Response.json(
      {
        error:
          'Ingredient is used in one or more recipes and cannot be deleted',
      },
      { status: 409 },
    );
  }

  store.ingredients = store.ingredients.filter((i) => i.id !== id);
  saveStore(store);

  return new Response(null, { status: 204 });
};
