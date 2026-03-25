// data/*.json の構造とアプリ内データ構造の型定義（C のヘッダファイルに相当）

// --- JSONデータの型 ---

// data/ingredients.json の1要素
export interface Ingredient {
  id: string     // 識別子（例: "amai-mitsu"）
  name: string   // 表示名（例: "あまいミツ"）
  energy: number
}

// レシピが必要とする食材1つ分
export interface RecipeIngredient {
  ingredientId: string
  count: number  // 必要個数
}

// data/recipes-*.json の1要素
export interface Recipe {
  id: string
  name: string
  category: string
  ingredients: RecipeIngredient[]
  totalCount: number  // 必要食材の合計個数（鍋容量と比較する）
  energy: number
}

// data/pokemon.json の1要素
export interface Pokemon {
  id: string
  name: string
  type: string
  ingredient1: string        // A枠（Lv.1から）
  ingredient2: string | null // B枠（Lv.30から）
  ingredient3: string | null // C枠（Lv.60から）。MVPでは使わない
  speciality: string
  limited?: boolean          // ? はオプショナル（ないフィールドがあってもOK）
}

// --- アプリ内で使う型 ---

// 提案カードに表示するポケモン情報
export interface SuggestionPokemon {
  id: string
  name: string
  slot: 'A' | 'B'  // A枠かB枠か（C枠は除外済み）
}

// 提案1件分（食材1つに対応）
export interface SuggestionItem {
  ingredientId: string
  ingredientName: string
  maxEnergy: number           // この食材で解放できる最大エナジー（優先度の根拠）
  maxEnergyRecipeName: string
  pokemon: SuggestionPokemon[]
  priority: 'high' | 'medium' | 'low'
}

// recommend() の戻り値。3種類のうちいずれか1つを返す（ユニオン型）
export type SuggestionsResult =
  | { type: 'complete';    items: [] }            // 全食材チェック済み
  | { type: 'no-results';  items: [] }            // 解放できるレシピがない
  | { type: 'suggestions'; items: SuggestionItem[] } // 提案あり
