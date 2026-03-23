import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  createRecipe,
  deleteRecipe,
  fetchRecipe,
  fetchRecipes,
  updateRecipe,
} from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import type {
  RecipeIngredientType,
  RecipeWithIngredientsType,
} from '@/lib/types';

export const useRecipes = () =>
  useQuery({
    queryKey: QUERY_KEYS.recipes,
    queryFn: fetchRecipes,
  });

export const useRecipe = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.recipe(id),
    queryFn: () => fetchRecipe(id),
  });

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecipe,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.recipes });
      const previous = queryClient.getQueryData<RecipeWithIngredientsType[]>(
        QUERY_KEYS.recipes,
      );
      queryClient.setQueryData<RecipeWithIngredientsType[]>(
        QUERY_KEYS.recipes,
        (old) => old?.filter((r) => r.id !== id),
      );
      return { previous };
    },
    onError: (error, _id, context) => {
      queryClient.setQueryData(QUERY_KEYS.recipes, context?.previous);
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Recipe deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recipes });
    },
  });
};

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recipes });
    },
  });
};

export const useUpdateRecipe = (recipeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; ingredients: RecipeIngredientType[] }) =>
      updateRecipe(recipeId, data),
    onSuccess: () => {
      toast.success('Recipe updated');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recipes });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.recipe(recipeId),
      });
    },
  });
};
