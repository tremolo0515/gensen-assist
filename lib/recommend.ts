// 推薦アルゴリズム。UIを持たない純粋な計算関数
// 入力: チェック済み食材IDの集合 + なべ容量
// 出力: 優先度付きの提案リスト（SuggestionsResult）

import { INGREDIENTS, POKEMON, RECIPES } from './data'
import type { Recipe, SuggestionItem, SuggestionsResult, BestRecipeByCategory } from './types'
import { SAME_INGREDIENT_SEPARATE_IDS, NON_FOOD_SPECIALIST_INGREDIENTS, ALWAYS_LOW_PRIORITY_INGREDIENTS } from './exceptions'

// カテゴリ別の最大エナジーレシピを返す（現在作れるベストレシピ表示用）
export function getBestRecipesPerCategory(
  checkedIds: Set<string>,
  potCapacity: number
): Record<'curry' | 'salad' | 'dessert', Recipe | null> {
  const categories = ['curry', 'salad', 'dessert'] as const
  const result = {} as Record<'curry' | 'salad' | 'dessert', Recipe | null>
  for (const category of categories) {
    const makeable = RECIPES.filter(recipe =>
      recipe.category === category &&
      recipe.totalCount <= potCapacity &&
      recipe.ingredients.every(ri => checkedIds.has(ri.ingredientId))
    )
    result[category] = makeable.length === 0
      ? null
      : makeable.reduce((a, b) => a.energy > b.energy ? a : b)
  }
  return result
}


export function recommend(
  checkedIngredientIds: Set<string>,
  potCapacity: number
): SuggestionsResult {

  // ── Step 1: 終了条件チェック ──────────────────────────────────────────
  // 未チェックの食材がなければ全食材厳選済みとして終了
  const uncheckedIngredients = INGREDIENTS.filter(
    ing => !checkedIngredientIds.has(ing.id)
  )
  if (uncheckedIngredients.length === 0) {
    return { type: 'complete', items: [] }
  }

  // ── Step 2: 現在のカテゴリ別最大エナジーを基準値として取得 ──────────────
  // 各食材のスコア計算で「この食材を追加するといくら増えるか」を測る基準になる
  const currentPerCategory = getBestRecipesPerCategory(checkedIngredientIds, potCapacity)

  // ── Step 3: 食材ごとにスコアと担当ポケモンを計算 ──────────────────────
  // ingredientId → いずれかのカテゴリで即解放できるレシピがあるか（優先度判定に使用）
  const ingredientImmediateMap = new Map<string, boolean>()
  const items: Omit<SuggestionItem, 'priority'>[] = []

  for (const ingredient of uncheckedIngredients) {

    // 3a. カテゴリごとにスコアを計算
    // 他に必要な未チェック食材が多いほど割り引く（1 / (1 + 不足数)）ことで、
    // 即解放できるレシピを優先しつつ、複数食材が揃うと解放できる高エナジーレシピも考慮する
    let totalDiscountedScore = 0
    const bestRecipesByCategory: BestRecipeByCategory[] = []
    let ingredientHasImmediateUnlock = false

    for (const cat of ['curry', 'salad', 'dessert'] as const) {
      const currentBestEnergy = currentPerCategory[cat]?.energy ?? 0

      const candidates = RECIPES.filter(r =>
        r.category === cat &&
        r.totalCount <= potCapacity &&
        r.ingredients.some(ri => ri.ingredientId === ingredient.id)
      )
      if (candidates.length === 0) continue

      const scored = candidates.map(recipe => {
        const otherMissingIds = recipe.ingredients
          .filter(ri => ri.ingredientId !== ingredient.id && !checkedIngredientIds.has(ri.ingredientId))
          .map(ri => ri.ingredientId)
        const gain = recipe.energy - currentBestEnergy
        const discountedGain = gain / (1 + otherMissingIds.length)
        return { recipe, otherMissingIds, gain, discountedGain }
      })

      const best = scored.reduce((a, b) => a.discountedGain >= b.discountedGain ? a : b)
      // bestとは別に、この食材だけで即解放できるレシピが1つでもあるか記録
      if (scored.some(s => s.otherMissingIds.length === 0 && s.gain > 0)) ingredientHasImmediateUnlock = true
      if (best.discountedGain <= 0) continue

      totalDiscountedScore += best.discountedGain
      bestRecipesByCategory.push({
        category: cat,
        recipeName: best.recipe.name,
        energy: best.recipe.energy,
        energyIncrease: best.gain,
        missingIngredients: best.otherMissingIds.map(
          id => INGREDIENTS.find(i => i.id === id)?.name ?? id
        ),
      })
    }

    ingredientImmediateMap.set(ingredient.id, ingredientHasImmediateUnlock)

    // スコアが 0 以下（追加しても改善なし）はスキップ
    if (totalDiscountedScore <= 0) continue

    // 3b. この食材を担当するポケモンを抽出・進化系統でグループ化
    // 食材得意（speciality === 'food'）かつ A枠またはB枠に持つポケモンが対象
    // 例外: おいしいしっぽは食材得意ポケモンが存在しないため得意を問わず抽出
    const carriers = POKEMON.filter(p =>
      (p.speciality === 'food' || NON_FOOD_SPECIALIST_INGREDIENTS.has(ingredient.id)) &&
      (p.ingredient1 === ingredient.id || p.ingredient2 === ingredient.id)
    )

    const evolutionGroups = new Map<string, string[]>()
    for (const pokemon of carriers) {
      const typePrefix = SAME_INGREDIENT_SEPARATE_IDS.has(pokemon.id) ? `${pokemon.type}-` : ''
      const key = `${typePrefix}${pokemon.ingredient1}-${pokemon.ingredient2 ?? ''}-${pokemon.ingredient3 ?? ''}`
      if (!evolutionGroups.has(key)) evolutionGroups.set(key, [])
      evolutionGroups.get(key)!.push(pokemon.name)
    }

    for (const [key, names] of evolutionGroups) {
      items.push({
        groupKey: `${key}-${ingredient.id}`,
        pokemonNames: names,
        slot: carriers.find(p => evolutionGroups.get(key)!.includes(p.name))!.ingredient1 === ingredient.id ? 'A' : 'B',
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        energyIncrease: totalDiscountedScore,
        bestRecipesByCategory,
      })
    }
  }

  if (items.length === 0) {
    return { type: 'no-results', items: [] }
  }

  // ── Step 4: ソート ────────────────────────────────────────────────────
  // おいしいしっぽは常に low 固定のため即解放扱いにしない
  const isAlwaysLow = (item: Omit<SuggestionItem, 'priority'>) => ALWAYS_LOW_PRIORITY_INGREDIENTS.has(item.ingredientId)
  const hasImmediateUnlock = (item: Omit<SuggestionItem, 'priority'>) =>
    ingredientImmediateMap.get(item.ingredientId) ?? false

  // 第1キー: 即解放できるレシピあり を上位に、第2キー: スコア降順
  items.sort((a, b) => {
    const immA = hasImmediateUnlock(a) ? 1 : 0
    const immB = hasImmediateUnlock(b) ? 1 : 0
    if (immB !== immA) return immB - immA
    return b.energyIncrease - a.energyIncrease
  })

  // ── Step 5: 優先度付け ────────────────────────────────────────────────
  // おいしいしっぽをランク計算から除外したうえでスコアランクを確定する
  // 即解放あり → 即解放食材の中でのスコアランク（1位=high、2〜3位=medium、以降=low）
  // 即解放なし → スコアに関わらず medium 以下
  const uniqueIncreases = [
    ...new Set(items.filter(i => !isAlwaysLow(i)).map(i => i.energyIncrease))
  ].sort((a, b) => b - a)
  const uniqueImmediateIncreases = [
    ...new Set(items.filter(i => hasImmediateUnlock(i) && !isAlwaysLow(i)).map(i => i.energyIncrease))
  ].sort((a, b) => b - a)

  const itemsWithPriority: SuggestionItem[] = items.map(item => {
    if (isAlwaysLow(item)) return { ...item, priority: 'low' as const }
    if (hasImmediateUnlock(item)) {
      const rank = uniqueImmediateIncreases.indexOf(item.energyIncrease)
      const priority = rank < 1 ? 'high' : rank < 3 ? 'medium' : 'low'
      return { ...item, priority }
    } else {
      const rank = uniqueIncreases.indexOf(item.energyIncrease)
      const priority = rank < 3 ? 'medium' : 'low'
      return { ...item, priority }
    }
  })

  return { type: 'suggestions', items: itemsWithPriority }
}
