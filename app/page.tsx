"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { PotCapacitySection } from "@/components/pot-capacity-section"
import { IngredientsSection } from "@/components/ingredients-section"
import { SuggestionsSection } from "@/components/suggestions-section"
import { BestRecipesSection } from "@/components/best-recipes-section"
import { INGREDIENTS } from "@/lib/data"
import { recommend, getBestRecipesPerCategory } from "@/lib/recommend"

const STORAGE_KEY_POT = "pokesleep-pot-capacity"
const STORAGE_KEY_INGREDIENTS = "pokesleep-checked-ingredients"
const STORAGE_KEY_TICKET = "pokesleep-good-camp-ticket"

export default function Home() {
  const [potCapacity, setPotCapacity] = useState(15)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set())
  const [useGoodCampTicket, setUseGoodCampTicket] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedPot = localStorage.getItem(STORAGE_KEY_POT)
    const savedIngredients = localStorage.getItem(STORAGE_KEY_INGREDIENTS)
    const savedTicket = localStorage.getItem(STORAGE_KEY_TICKET)

    if (savedPot) setPotCapacity(parseInt(savedPot, 10))
    if (savedIngredients) setCheckedIngredients(new Set(JSON.parse(savedIngredients)))
    if (savedTicket) setUseGoodCampTicket(savedTicket === 'true')
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) localStorage.setItem(STORAGE_KEY_POT, potCapacity.toString())
  }, [potCapacity, isLoaded])

  useEffect(() => {
    if (isLoaded) localStorage.setItem(STORAGE_KEY_INGREDIENTS, JSON.stringify([...checkedIngredients]))
  }, [checkedIngredients, isLoaded])

  useEffect(() => {
    if (isLoaded) localStorage.setItem(STORAGE_KEY_TICKET, useGoodCampTicket.toString())
  }, [useGoodCampTicket, isLoaded])

  const toggleIngredient = (ingredientId: string) => {
    setCheckedIngredients(prev => {
      const next = new Set(prev)
      if (next.has(ingredientId)) {
        next.delete(ingredientId)
      } else {
        next.add(ingredientId)
      }
      return next
    })
  }

  const clearAllIngredients = () => {
    setCheckedIngredients(new Set())
  }

  const selectAllIngredients = () => {
    setCheckedIngredients(new Set(INGREDIENTS.map(i => i.id)))
  }

  // いいキャンプチケット使用時はなべ容量を1.5倍（四捨五入）
  const effectivePotCapacity = useGoodCampTicket
    ? Math.round(potCapacity * 1.5)
    : potCapacity

  const bestRecipes = useMemo(() => {
    return getBestRecipesPerCategory(checkedIngredients, effectivePotCapacity)
  }, [checkedIngredients, effectivePotCapacity])

  const suggestions = useMemo(() => {
    return recommend(checkedIngredients, effectivePotCapacity)
  }, [checkedIngredients, effectivePotCapacity])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Header />
        <div className="flex flex-col gap-8 mt-8">
          <PotCapacitySection
            value={potCapacity}
            onChange={setPotCapacity}
            useGoodCampTicket={useGoodCampTicket}
            onToggleGoodCampTicket={() => setUseGoodCampTicket(prev => !prev)}
            effectivePotCapacity={effectivePotCapacity}
          />
          <IngredientsSection
            ingredients={INGREDIENTS}
            checkedIngredients={checkedIngredients}
            onToggle={toggleIngredient}
            onClearAll={clearAllIngredients}
            onSelectAll={selectAllIngredients}
          />
          <BestRecipesSection bestRecipes={bestRecipes} />
          <SuggestionsSection suggestions={suggestions} />
        </div>
      </div>
    </main>
  )
}
