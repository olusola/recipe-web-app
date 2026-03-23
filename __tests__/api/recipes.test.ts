/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/recipes/route';
import { DELETE, GET as GET_ONE, PUT } from '@/app/api/recipes/[id]/route';
import { getStore, saveStore } from '@/lib/store';

jest.mock('@/lib/store', () => {
  const actual = jest.requireActual('@/lib/store');
  return {
    ...actual,
    getStore: jest.fn(),
    saveStore: jest.fn(),
  };
});

const mockGetStore = getStore as jest.MockedFunction<typeof getStore>;
const mockSaveStore = saveStore as jest.MockedFunction<typeof saveStore>;

const seedStore = {
  ingredients: [
    { id: 'ing1', name: 'Flour', unit: 'grams', category: 'Baking' },
    { id: 'ing2', name: 'Sugar', unit: 'grams', category: 'Baking' },
    { id: 'ing3', name: 'Eggs', unit: 'pieces', category: 'Dairy' },
  ],
  recipes: [
    {
      id: 'rec1',
      name: 'Pancakes',
      ingredients: [
        { ingredientId: 'ing1', quantity: 200 },
        { ingredientId: 'ing2', quantity: 50 },
      ],
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetStore.mockImplementation(() => JSON.parse(JSON.stringify(seedStore)));
  mockSaveStore.mockImplementation(() => undefined);
});

describe('GET /api/recipes', () => {
  it('returns all recipes with status 200', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ id: 'rec1', name: 'Pancakes' });
  });

  it('resolves ingredient names into recipe ingredients', async () => {
    const res = await GET();
    const body = await res.json();
    const recipeIngredients = body[0].ingredients;

    expect(recipeIngredients[0]).toMatchObject({
      ingredientId: 'ing1',
      quantity: 200,
      name: 'Flour',
      unit: 'grams',
    });
    expect(recipeIngredients[1]).toMatchObject({
      ingredientId: 'ing2',
      quantity: 50,
      name: 'Sugar',
      unit: 'grams',
    });
  });

  it('uses "Unknown" for an ingredient that no longer exists in the store', async () => {
    mockGetStore.mockImplementation(() => ({
      ingredients: [],
      recipes: [
        {
          id: 'rec1',
          name: 'Pancakes',
          ingredients: [{ ingredientId: 'ing1', quantity: 200 }],
        },
      ],
    }));

    const res = await GET();
    const body = await res.json();
    expect(body[0].ingredients[0].name).toBe('Unknown');
  });
});

describe('POST /api/recipes', () => {
  it('creates a new recipe and returns 201', async () => {
    const req = new Request('http://localhost/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Scrambled Eggs',
        ingredients: [{ ingredientId: 'ing3', quantity: 3 }],
      }),
    });

    const res = await POST(req as never);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({ name: 'Scrambled Eggs' });
    expect(typeof body.id).toBe('string');
    expect(body.ingredients).toHaveLength(1);
    expect(mockSaveStore).toHaveBeenCalledTimes(1);
  });

  it('returns 400 when name is missing', async () => {
    const req = new Request('http://localhost/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients: [{ ingredientId: 'ing1', quantity: 1 }],
      }),
    });

    const res = await POST(req as never);

    expect(res.status).toBe(400);
    expect(mockSaveStore).not.toHaveBeenCalled();
  });

  it('returns 400 when ingredients array is empty', async () => {
    const req = new Request('http://localhost/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Empty Recipe', ingredients: [] }),
    });

    const res = await POST(req as never);

    expect(res.status).toBe(400);
    expect(mockSaveStore).not.toHaveBeenCalled();
  });

  it('returns 400 when ingredients field is missing', async () => {
    const req = new Request('http://localhost/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'No Ingredients' }),
    });

    const res = await POST(req as never);

    expect(res.status).toBe(400);
    expect(mockSaveStore).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/recipes/[id]', () => {
  it('deletes a recipe and returns 204', async () => {
    const req = new Request('http://localhost/api/recipes/rec1', {
      method: 'DELETE',
    });
    const res = await DELETE(req as never, {
      params: Promise.resolve({ id: 'rec1' }),
    });

    expect(res.status).toBe(204);
    expect(mockSaveStore).toHaveBeenCalledTimes(1);
  });

  it('returns 404 when recipe does not exist', async () => {
    const req = new Request('http://localhost/api/recipes/nonexistent', {
      method: 'DELETE',
    });
    const res = await DELETE(req as never, {
      params: Promise.resolve({ id: 'nonexistent' }),
    });

    expect(res.status).toBe(404);
    expect(mockSaveStore).not.toHaveBeenCalled();
  });
});

describe('GET /api/recipes/[id]', () => {
  it('returns a single recipe with resolved ingredient names', async () => {
    const req = new Request('http://localhost/api/recipes/rec1');
    const res = await GET_ONE(req as never, {
      params: Promise.resolve({ id: 'rec1' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ id: 'rec1', name: 'Pancakes' });
    expect(body.ingredients[0]).toMatchObject({
      ingredientId: 'ing1',
      name: 'Flour',
      unit: 'grams',
    });
  });

  it('returns 404 when recipe does not exist', async () => {
    const req = new Request('http://localhost/api/recipes/nonexistent');
    const res = await GET_ONE(req as never, {
      params: Promise.resolve({ id: 'nonexistent' }),
    });

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/recipes/[id]', () => {
  it('updates a recipe and returns the updated data', async () => {
    const req = new Request('http://localhost/api/recipes/rec1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Updated Pancakes',
        ingredients: [
          { ingredientId: 'ing1', quantity: 300 },
          { ingredientId: 'ing3', quantity: 4 },
        ],
      }),
    });

    const res = await PUT(req as never, {
      params: Promise.resolve({ id: 'rec1' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ id: 'rec1', name: 'Updated Pancakes' });
    expect(body.ingredients).toHaveLength(2);
    expect(mockSaveStore).toHaveBeenCalledTimes(1);
  });

  it('returns 404 when recipe does not exist', async () => {
    const req = new Request('http://localhost/api/recipes/nonexistent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ghost',
        ingredients: [{ ingredientId: 'ing1', quantity: 1 }],
      }),
    });

    const res = await PUT(req as never, {
      params: Promise.resolve({ id: 'nonexistent' }),
    });

    expect(res.status).toBe(404);
    expect(mockSaveStore).not.toHaveBeenCalled();
  });

  it('returns 400 when name is missing', async () => {
    const req = new Request('http://localhost/api/recipes/rec1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients: [{ ingredientId: 'ing1', quantity: 1 }],
      }),
    });

    const res = await PUT(req as never, {
      params: Promise.resolve({ id: 'rec1' }),
    });

    expect(res.status).toBe(400);
    expect(mockSaveStore).not.toHaveBeenCalled();
  });

  it('returns 400 when ingredients array is empty', async () => {
    const req = new Request('http://localhost/api/recipes/rec1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'No Ingredients', ingredients: [] }),
    });

    const res = await PUT(req as never, {
      params: Promise.resolve({ id: 'rec1' }),
    });

    expect(res.status).toBe(400);
    expect(mockSaveStore).not.toHaveBeenCalled();
  });
});
