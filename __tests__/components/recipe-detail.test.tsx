import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import RecipeDetailPage from '@/app/recipes/[id]/page';
import * as api from '@/lib/api';
import type { RecipeWithIngredientsType } from '@/lib/types';

jest.mock('@/lib/api');
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'r1' }),
  useRouter: () => ({ push: mockPush }),
}));

const mockFetchRecipe = api.fetchRecipe as jest.MockedFunction<
  typeof api.fetchRecipe
>;
const mockFetchRecipes = api.fetchRecipes as jest.MockedFunction<
  typeof api.fetchRecipes
>;

const mockRecipe: RecipeWithIngredientsType = {
  id: 'r1',
  name: 'Pancakes',
  ingredients: [
    { ingredientId: 'ing1', quantity: 200, name: 'Flour', unit: 'grams' },
    { ingredientId: 'ing2', quantity: 50, name: 'Sugar', unit: 'grams' },
    { ingredientId: 'ing3', quantity: 2, name: 'Eggs', unit: 'pieces' },
  ],
};

const mockAllRecipes: RecipeWithIngredientsType[] = [
  mockRecipe,
  {
    id: 'r2',
    name: 'Waffles',
    ingredients: [
      { ingredientId: 'ing1', quantity: 250, name: 'Flour', unit: 'grams' },
      { ingredientId: 'ing3', quantity: 3, name: 'Eggs', unit: 'pieces' },
    ],
  },
  {
    id: 'r3',
    name: 'Omelette',
    ingredients: [
      { ingredientId: 'ing3', quantity: 4, name: 'Eggs', unit: 'pieces' },
    ],
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchRecipe.mockResolvedValue(mockRecipe);
  mockFetchRecipes.mockResolvedValue([...mockAllRecipes]);
});

describe('RecipeDetailPage', () => {
  it('renders the recipe name and ingredients', async () => {
    renderWithProviders(<RecipeDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Pancakes')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Flour').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('200 grams')).toBeInTheDocument();
    expect(screen.getByText('Sugar')).toBeInTheDocument();
    expect(screen.getByText('50 grams')).toBeInTheDocument();
    expect(screen.getAllByText('Eggs').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('2 pieces')).toBeInTheDocument();
  });

  it('shows a loading state initially', () => {
    mockFetchRecipe.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<RecipeDetailPage />);
    expect(screen.getByText(/loading recipe/i)).toBeInTheDocument();
  });

  it('shows recommended recipes based on shared ingredients', async () => {
    renderWithProviders(<RecipeDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Pancakes')).toBeInTheDocument();
    });

    // Waffles shares Flour + Eggs, Omelette shares Eggs
    expect(screen.getByText('Waffles')).toBeInTheDocument();
    expect(screen.getByText('Omelette')).toBeInTheDocument();
  });

  it('shows "No similar recipes found" when there are no recommendations', async () => {
    mockFetchRecipes.mockResolvedValue([mockRecipe]);
    renderWithProviders(<RecipeDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Pancakes')).toBeInTheDocument();
    });

    expect(screen.getByText(/no similar recipes found/i)).toBeInTheDocument();
  });

  it('has Back to Recipes link', async () => {
    renderWithProviders(<RecipeDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Pancakes')).toBeInTheDocument();
    });

    expect(screen.getByText('Back to Recipes')).toBeInTheDocument();
  });

  it('has an Edit Recipe button', async () => {
    renderWithProviders(<RecipeDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Pancakes')).toBeInTheDocument();
    });

    expect(screen.getByText('Edit Recipe')).toBeInTheDocument();
  });
});
