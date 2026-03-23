import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PAGE_TITLE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { FeaturedRecipe } from '@/components/featured-recipe';
import { RecipesTable } from '@/components/recipes-table';

export default function RecipesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={PAGE_TITLE}>
            Find your
            <br />
            <span className="text-foreground/50">favourite</span> recipe
          </h1>
        </div>
        <Button
          asChild
          size="lg"
          className="font-extrabold text-base shrink-0 rounded-full px-8 h-12 w-full sm:w-auto sm:h-14"
        >
          <Link href="/recipes/new">
            <Plus className="h-5 w-5" />
            Add New Recipe
          </Link>
        </Button>
      </div>

      <FeaturedRecipe />

      <RecipesTable />
    </div>
  );
}
