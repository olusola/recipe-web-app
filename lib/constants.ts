export const QUERY_KEYS = {
  recipes: ['recipes'] as const,
  recipe: (id: string) => ['recipe', id] as const,
  ingredients: ['ingredients'] as const,
};

export const API_ENDPOINTS = {
  recipes: '/api/recipes',
  recipe: (id: string) => `/api/recipes/${id}`,
  ingredients: '/api/ingredients',
  ingredient: (id: string) => `/api/ingredients/${id}`,
};

export const PAGE_SIZE = 7;
export const MAX_VISIBLE_INGREDIENTS = 4;

export const SECTION_LABEL =
  'text-xs font-extrabold uppercase tracking-widest text-foreground/40';

export const PAGE_TITLE =
  'text-4xl font-extrabold tracking-tight leading-none sm:text-5xl';
