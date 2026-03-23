import { NextRequest } from 'next/server';
import { getStore, saveStore, generateNextId } from '@/lib/store';

export const GET = async () => {
  const store = getStore();
  return Response.json(store.ingredients);
};

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const { name, unit, category } = body;

  if (!name || !unit || !category) {
    return Response.json(
      { error: 'name, unit and category are required' },
      { status: 400 },
    );
  }

  const store = getStore();
  const newIngredient = {
    id: generateNextId('ing', store.ingredients),
    name: String(name).trim(),
    unit: String(unit).trim(),
    category: String(category).trim(),
  };

  store.ingredients.push(newIngredient);
  saveStore(store);

  return Response.json(newIngredient, { status: 201 });
};
