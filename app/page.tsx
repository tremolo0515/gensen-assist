"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { PotCapacitySection } from "@/components/pot-capacity-section"
import { IngredientsSection } from "@/components/ingredients-section"
import { SuggestionsSection } from "@/components/suggestions-section"
import { INGREDIENTS, POKEMON_DATA } from "@/lib/pokemon-data"

const STORAGE_KEY_POT = "pokesleep-pot-capacity"
const STORAGE_KEY_INGREDIENTS = "pokesleep-checked-ingredients"

export default function Home() {
  const [potCapacity, setPotCapacity] = useState(15)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set())
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const savedPot = localStorage.getItem(STORAGE_KEY_POT)
    const savedIngredients = localStorage.getItem(STORAGE_KEY_INGREDIENTS)
    
    if (savedPot) {
      setPotCapacity(parseInt(savedPot, 10))
    }
    if (savedIngredients) {
      setCheckedIngredients(new Set(JSON.parse(savedIngredients)))
    }
    setIsLoaded(true)
  }, [])

  // Save pot capacity to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_POT, potCapacity.toString())
    }
  }, [potCapacity, isLoaded])

  // Save checked ingredients to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_INGREDIENTS, JSON.stringify([...checkedIngredients]))
    }
  }, [checkedIngredients, isLoaded])

  const toggleIngredient = (ingredient: string) => {
    setCheckedIngredients(prev => {
      const next = new Set(prev)
      if (next.has(ingredient)) {
        next.delete(ingredient)
      } else {
        next.add(ingredient)
      }
      return next
    })
  }

  const clearAllIngredients = () => {
    setCheckedIngredients(new Set())
  }

  // Calculate suggestions based on unchecked ingredients and pot capacity
  const suggestions = useMemo(() => {
    const uncheckedIngredients = INGREDIENTS.filter(ing => !checkedIngredients.has(ing))
    
    if (uncheckedIngredients.length === 0) {
      return { type: "complete" as const, items: [] }
    }

    const relevantPokemon = POKEMON_DATA.filter(pokemon => 
      uncheckedIngredients.includes(pokemon.ingredient) &&
      pokemon.requiredCapacity <= potCapacity
    )

    if (relevantPokemon.length === 0) {
      return { type: "no-capacity" as const, items: [] }
    }

    // Sort by energy (highest first) and assign priority
    const sorted = [...relevantPokemon].sort((a, b) => b.energy - a.energy)
    
    return {
      type: "suggestions" as const,
      items: sorted.map((pokemon, index) => ({
        ...pokemon,
        priority: index < 2 ? "high" : index < 4 ? "medium" : "low" as "high" | "medium" | "low"
      }))
    }
  }, [checkedIngredients, potCapacity])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Header />
        <div className="flex flex-col gap-8 mt-8">
          <PotCapacitySection 
            value={potCapacity} 
            onChange={setPotCapacity} 
          />
          <IngredientsSection 
            ingredients={INGREDIENTS}
            checkedIngredients={checkedIngredients}
            onToggle={toggleIngredient}
            onClearAll={clearAllIngredients}
          />
          <SuggestionsSection suggestions={suggestions} />
        </div>
      </div>
    </main>
  )
}
