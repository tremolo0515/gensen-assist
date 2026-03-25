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
