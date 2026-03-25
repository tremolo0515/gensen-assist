// 推薦アルゴリズム。UIを持たない純粋な計算関数
// 入力: チェック済み食材IDの集合 + なべ容量
// 出力: 優先度付きの提案リスト（SuggestionsResult）

import { INGREDIENTS, POKEMON, RECIPES } from './data'
import type { Recipe, SuggestionItem, SuggestionsResult, BestRecipeByCategory } from './types'

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

  // 未チェックの食材 = 厳選候補
  const uncheckedIngredients = INGREDIENTS.filter(
    ing => !checkedIngredientIds.has(ing.id)
  )

  if (uncheckedIngredients.length === 0) {
    return { type: 'complete', items: [] }
  }

  // 現在の状態でのカテゴリ別最大エナジー（追加「前」の基準値）
  const currentPerCategory = getBestRecipesPerCategory(checkedIngredientIds, potCapacity)

  const items: Omit<SuggestionItem, 'priority'>[] = []

  for (const ingredient of uncheckedIngredients) {
    // カテゴリごとに「この食材を含む最良レシピ」を探索し、スコアを計算する
    // 他に必要な未チェック食材が多いほど割り引く（1 / (1 + 不足数)）ことで、
    // 即解放できるレシピを優先しつつ、複数食材が揃うと解放できる高エナジーレシピも考慮する
    let totalDiscountedScore = 0
    const bestRecipesByCategory: BestRecipeByCategory[] = [];

    for (const cat of ['curry', 'salad', 'dessert'] as const) {
      const currentBestEnergy = currentPerCategory[cat]?.energy ?? 0

      // この食材を含むレシピのうち、なべ容量内に収まるものを全て取得
      const candidates = RECIPES.filter(r =>
        r.category === cat &&
        r.totalCount <= potCapacity &&
        r.ingredients.some(ri => ri.ingredientId === ingredient.id)
      )
      if (candidates.length === 0) continue

      // 各候補について「他に必要な未チェック食材」を特定し、割引スコアを計算
      const scored = candidates.map(recipe => {
        const otherMissingIds = recipe.ingredients
          .filter(ri => ri.ingredientId !== ingredient.id && !checkedIngredientIds.has(ri.ingredientId))
          .map(ri => ri.ingredientId)
        const gain = recipe.energy - currentBestEnergy
        const discountedGain = gain / (1 + otherMissingIds.length)
        return { recipe, otherMissingIds, gain, discountedGain }
      })

      // 割引スコアが最大の候補を選ぶ
      const best = scored.reduce((a, b) => a.discountedGain >= b.discountedGain ? a : b)
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

    const energyIncrease = totalDiscountedScore

    // スコアが 0 以下の食材はスキップ
    if (energyIncrease <= 0) continue

    // 食材得意（speciality === 'food'）かつ A枠またはB枠にこの食材を持つポケモンを抽出
    // 例外: おいしいしっぽは食材得意ポケモンが存在しないため、得意に関係なく抽出
    const carriers = POKEMON.filter(p =>
      (p.speciality === 'food' || ingredient.id === 'oishii-shippo') &&
      (p.ingredient1 === ingredient.id || p.ingredient2 === ingredient.id)
    )

    // タイプ + 食材構成が同じポケモンを進化系統としてグループ化
    // キー例: "みず-moumou-milk-relax-cacao-mame-meat" → ゼニガメ/カメール/カメックス
    const evolutionGroups = new Map<string, string[]>()
    for (const pokemon of carriers) {
      const key = `${pokemon.type}-${pokemon.ingredient1}-${pokemon.ingredient2 ?? ''}-${pokemon.ingredient3 ?? ''}`
      if (!evolutionGroups.has(key)) evolutionGroups.set(key, [])
      evolutionGroups.get(key)!.push(pokemon.name)
    }

    // 進化系統1グループを1件として追加
    for (const [key, names] of evolutionGroups) {
      items.push({
        groupKey: `${key}-${ingredient.id}`,
        pokemonNames: names,
        slot: carriers.find(p => evolutionGroups.get(key)!.includes(p.name))!.ingredient1 === ingredient.id ? 'A' : 'B',
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        energyIncrease,
        bestRecipesByCategory,
      })
    }
  }

  if (items.length === 0) {
    return { type: 'no-results', items: [] }
  }

  // 第1キー: 即解放できるレシピあり（割引なし）を上位に
  // 第2キー: エナジー増加量の降順
  const isImmediate = (item: Omit<SuggestionItem, 'priority'>) =>
    item.bestRecipesByCategory.some(r => r.missingIngredients.length === 0)
  items.sort((a, b) => {
    const immA = isImmediate(a) ? 1 : 0
    const immB = isImmediate(b) ? 1 : 0
    if (immB !== immA) return immB - immA
    return b.energyIncrease - a.energyIncrease
  })

  const hasImmediateUnlock = (item: Omit<SuggestionItem, 'priority'>) =>
    item.bestRecipesByCategory.some(r => r.missingIngredients.length === 0)

  // 即解放できる食材の中でスコアランクを付けて優先度を決定
  // 即解放なしはスコアに関わらず medium 以下（high にはならない）
  const uniqueIncreases = [...new Set(items.map(i => i.energyIncrease))].sort((a, b) => b - a)
  const uniqueImmediateIncreases = [
    ...new Set(items.filter(hasImmediateUnlock).map(i => i.energyIncrease))
  ].sort((a, b) => b - a)

  const itemsWithPriority: SuggestionItem[] = items.map(item => {
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

  // おいしいしっぽは例外的に常に最低優先度（low）の末尾に固定
  itemsWithPriority.forEach(item => {
    if (item.ingredientId === 'oishii-shippo') item.priority = 'low'
  })

  return { type: 'suggestions', items: itemsWithPriority }
}
