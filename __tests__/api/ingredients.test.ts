/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/ingredients/route';
import { DELETE } from '@/app/api/ingredients/[id]/route';
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
  ],
  recipes: [
    {
      id: 'rec1',
      name: 'Pancakes',
      ingredients: [{ ingredientId: 'ing1', quantity: 200 }],
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetStore.mockImplementation(() => JSON.parse(JSON.stringify(seedStore)));
  mockSaveStore.mockImplementation(() => undefined);
});

describe('GET /api/ingredients', () => {
  it('returns all ingredients with status 200', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body[0]).toMatchObject({ id: 'ing1', name: 'Flour' });
  });
});

describe('POST /api/ingredients', () => {
  it('creates a new ingredient and returns 201', async () => {
    const req = new Request('http://localhost/api/ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Salt',
        unit: 'teaspoons',
        category: 'Seasoning',
      }),
    });

    const res = await POST(req as never);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({
      name: 'Salt',
      unit: 'teaspoons',
      category: 'Seasoning',
    });
    expect(typeof body.id).toBe('string');
    expect(mockSaveStore).toHaveBeenCalledTimes(1);
  });

  it('returns 400 when name is missing', async () => {
    const req = new Request('http://localhost/api/ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unit: 'grams', category: 'Baking' }),
    });

    const res = await POST(req as never);

    expect(res.status).toBe(400);
    expect(mockSaveStore).not.toHaveBeenCalled();
  });

  it('returns 400 when unit is missing', async () => {
    const req = new Request('http://localhost/api/ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Salt', category: 'Seasoning' }),
    });

    const res = await POST(req as never);

    expect(res.status).toBe(400);
    expect(mockSaveStore).not.toHaveBeenCalled();
  });

  it('returns 400 when category is missing', async () => {
    const req = new Request('http://localhost/api/ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Salt', unit: 'teaspoons' }),
    });

    const res = await POST(req as never);

    expect(res.status).toBe(400);
    expect(mockSaveStore).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/ingredients/[id]', () => {
  it('deletes an ingredient not used in any recipe and returns 204', async () => {
    const req = new Request('http://localhost/api/ingredients/ing2', {
      method: 'DELETE',
    });
    const res = await DELETE(req as never, {
      params: Promise.resolve({ id: 'ing2' }),
    });

    expect(res.status).toBe(204);
    expect(mockSaveStore).toHaveBeenCalledTimes(1);
  });

  it('returns 409 when ingredient is used in a recipe', async () => {
    const req = new Request('http://localhost/api/ingredients/ing1', {
      method: 'DELETE',
    });
    const res = await DELETE(req as never, {
      params: Promise.resolve({ id: 'ing1' }),
    });

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/recipe/i);
    expect(mockSaveStore).not.toHaveBeenCalled();
  });

  it('returns 404 when ingredient does not exist', async () => {
    const req = new Request('http://localhost/api/ingredients/nonexistent', {
      method: 'DELETE',
    });
    const res = await DELETE(req as never, {
      params: Promise.resolve({ id: 'nonexistent' }),
    });

    expect(res.status).toBe(404);
    expect(mockSaveStore).not.toHaveBeenCalled();
  });
});
