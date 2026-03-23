import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  createIngredient,
  deleteIngredient,
  fetchIngredients,
} from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { IngredientType } from '@/lib/types';

export const useIngredients = () =>
  useQuery({
    queryKey: QUERY_KEYS.ingredients,
    queryFn: fetchIngredients,
  });

export const useDeleteIngredient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIngredient,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ingredients });
      const previous = queryClient.getQueryData<IngredientType[]>(
        QUERY_KEYS.ingredients,
      );
      queryClient.setQueryData<IngredientType[]>(
        QUERY_KEYS.ingredients,
        (old) => old?.filter((i) => i.id !== id),
      );
      return { previous };
    },
    onError: (error, _id, context) => {
      queryClient.setQueryData(QUERY_KEYS.ingredients, context?.previous);
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Ingredient deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ingredients });
    },
  });
};

export const useCreateIngredient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIngredient,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ingredients });
      const previous = queryClient.getQueryData<IngredientType[]>(
        QUERY_KEYS.ingredients,
      );
      const optimistic: IngredientType = {
        id: `temp-${Date.now()}`,
        ...newData,
      };
      queryClient.setQueryData<IngredientType[]>(
        QUERY_KEYS.ingredients,
        (old) => [...(old ?? []), optimistic],
      );
      return { previous };
    },
    onError: (error, _data, context) => {
      queryClient.setQueryData(QUERY_KEYS.ingredients, context?.previous);
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ingredients });
    },
  });
};
