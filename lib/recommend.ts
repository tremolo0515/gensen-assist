// 推薦アルゴリズム。UIを持たない純粋な計算関数
// 入力: チェック済み食材IDの集合 + 鍋容量
// 出力: 優先度付きの提案リスト（SuggestionsResult）

import { INGREDIENTS, POKEMON, RECIPES } from './data'
import type { SuggestionItem, SuggestionsResult } from './types'

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

  // Omit<SuggestionItem, 'priority'> = priority を除いた SuggestionItem（後でまとめて付与する）
  const items: Omit<SuggestionItem, 'priority'>[] = []

  for (const ingredient of uncheckedIngredients) {

    // この食材を「チェックしたと仮定」したとき新たに作れるレシピを探す
    const newlyUnlocked = RECIPES.filter(recipe => {
      // レシピがこの食材を必要としているか（.some = 1つでも一致すれば true）
      const needsThis = recipe.ingredients.some(
        ri => ri.ingredientId === ingredient.id
      )
      if (!needsThis) return false

      // この食材以外の必要食材がすべてチェック済みか（.every = 全件一致で true）
      const allOthersChecked = recipe.ingredients
        .filter(ri => ri.ingredientId !== ingredient.id)
        .every(ri => checkedIngredientIds.has(ri.ingredientId))
      if (!allOthersChecked) return false

      return recipe.totalCount <= potCapacity
    })

    if (newlyUnlocked.length === 0) continue

    // 解放されるレシピの中で最大エナジーのものをスコアとする（.reduce = 配列を1値に集約）
    const bestRecipe = newlyUnlocked.reduce((a, b) =>
      a.energy > b.energy ? a : b
    )

    // A枠またはB枠にこの食材を持つポケモンを抽出（C枠のみは除外）
    const carriers = POKEMON
      .filter(p =>
        p.ingredient1 === ingredient.id || p.ingredient2 === ingredient.id
      )
      .map(p => ({
        id: p.id,
        name: p.name,
        slot: (p.ingredient1 === ingredient.id ? 'A' : 'B') as 'A' | 'B',
      }))

    items.push({
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      maxEnergy: bestRecipe.energy,
      maxEnergyRecipeName: bestRecipe.name,
      pokemon: carriers,
    })
  }

  if (items.length === 0) {
    return { type: 'no-results', items: [] }
  }

  // エナジー降順でソート
  items.sort((a, b) => b.maxEnergy - a.maxEnergy)

  // 優先度を付与（上位2件: high、3〜4件目: medium、それ以降: low）
  const itemsWithPriority: SuggestionItem[] = items.map((item, index) => ({
    ...item, // item の全フィールドをコピーして priority を追加
    priority: index < 2 ? 'high' : index < 4 ? 'medium' : 'low',
  }))

  return { type: 'suggestions', items: itemsWithPriority }
}
