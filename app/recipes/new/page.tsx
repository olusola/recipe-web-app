import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { HeroBanner } from "@/components/hero-banner"
import { NewRecipeForm } from "@/components/new-recipe-form"

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80&auto=format&fit=crop"

export default function NewRecipePage() {
  return (
    <div className="space-y-8">
      <HeroBanner src={HERO_IMAGE} className="min-h-[200px] justify-between sm:min-h-[240px]">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-fit rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
        >
          <Link href="/recipes">
            <ArrowLeft className="h-4 w-4" />
            Back to Recipes
          </Link>
        </Button>

        <h1 className="text-4xl leading-none font-extrabold tracking-tight text-white drop-shadow-lg sm:text-5xl">
          Create a
          <br />
          <span className="text-white/60">new</span> recipe
        </h1>
      </HeroBanner>

      <NewRecipeForm />
    </div>
  )
}
