// data/*.json を読み込んでエクスポートする。アプリ全体でここからデータを参照する

import ingredientsData from '@/data/ingredients.json'
import pokemonData from '@/data/pokemon.json'
import recipesCurryData from '@/data/recipes-curry.json'
import recipesSaladData from '@/data/recipes-salad.json'
import recipesDessertData from '@/data/recipes-dessert.json'
import type { Ingredient, Pokemon, Recipe } from './types'

export const INGREDIENTS: Ingredient[] = ingredientsData

export const POKEMON: Pokemon[] = pokemonData as Pokemon[]

// 3カテゴリのレシピを1配列に結合。energy=0 の「ごちゃまぜ」系は除外
export const RECIPES: Recipe[] = [
  ...recipesCurryData,
  ...recipesSaladData,
  ...recipesDessertData,
].filter(r => r.energy > 0) as Recipe[]

// メインスキル「料理パワーアップ」のレベル別なべ容量増加量。index = スキルレベル（0は未使用）
export const COOKING_POWER_UP_BONUS = [0, 7, 10, 12, 17, 22, 27, 31]

// メインスキル「料理パワーアップ・マイナス」のレベル別なべ容量増加量。index = スキルレベル（0は未使用）
export const COOKING_POWER_UP_MINUS_BONUS = [0, 5, 7, 9, 12, 16, 20, 24]
