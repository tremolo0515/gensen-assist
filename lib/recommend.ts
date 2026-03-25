// 推薦アルゴリズム。UIを持たない純粋な計算関数
// 入力: チェック済み食材IDの集合 + なべ容量
// 出力: 優先度付きの提案リスト（SuggestionsResult）

import { INGREDIENTS, POKEMON, RECIPES } from './data'
import type { Recipe, SuggestionItem, SuggestionsResult } from './types'

// 指定した食材セットとなべ容量で作れるレシピのうち、最大エナジーのものを返す
function getBestRecipe(checkedIds: Set<string>, potCapacity: number): Recipe | null {
  const makeable = RECIPES.filter(recipe =>
    recipe.totalCount <= potCapacity &&
    recipe.ingredients.every(ri => checkedIds.has(ri.ingredientId))
  )
  if (makeable.length === 0) return null
  return makeable.reduce((a, b) => a.energy > b.energy ? a : b)
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

  // 現在の状態で作れる最大エナジー（追加「前」の基準値）
  const currentBest = getBestRecipe(checkedIngredientIds, potCapacity)
  const currentMaxEnergy = currentBest?.energy ?? 0

  const items: Omit<SuggestionItem, 'priority'>[] = []

  for (const ingredient of uncheckedIngredients) {
    // この食材を追加した場合の最大エナジーを計算
    const newChecked = new Set([...checkedIngredientIds, ingredient.id])
    const newBest = getBestRecipe(newChecked, potCapacity)
    const newMaxEnergy = newBest?.energy ?? 0
    const energyIncrease = newMaxEnergy - currentMaxEnergy

    // エナジーが増加しない食材はスキップ
    if (energyIncrease <= 0) continue

    // 食材得意（speciality === 'food'）かつ A枠またはB枠にこの食材を持つポケモンを抽出
    const carriers = POKEMON.filter(p =>
      p.speciality === 'food' &&
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
        newMaxEnergy,
        bestRecipeName: newBest!.name,
      })
    }
  }

  if (items.length === 0) {
    return { type: 'no-results', items: [] }
  }

  // エナジー増加量の降順でソート
  items.sort((a, b) => b.energyIncrease - a.energyIncrease)

  // エナジー増加量の異なる値でグループ化して優先度を付与
  // 1位の食材 → high、2〜3位 → medium、それ以降 → low
  const uniqueIncreases = [...new Set(items.map(i => i.energyIncrease))].sort((a, b) => b - a)
  const itemsWithPriority: SuggestionItem[] = items.map(item => ({
    ...item,
    priority:
      uniqueIncreases.indexOf(item.energyIncrease) < 1 ? 'high' :
      uniqueIncreases.indexOf(item.energyIncrease) < 3 ? 'medium' : 'low',
  }))

  return { type: 'suggestions', items: itemsWithPriority }
}
