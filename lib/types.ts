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
  totalCount: number  // 必要食材の合計個数（なべ容量と比較する）
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
  speciality: string         // "food" | "berry" | "skill"
  limited?: boolean          // ? はオプショナル（ないフィールドがあってもOK）
}

// --- アプリ内で使う型 ---

// 食材追加でエナジーが上がるカテゴリの情報（展開表示用）
export interface BestRecipeByCategory {
  category: 'curry' | 'salad' | 'dessert'
  recipeName: string
  energy: number
  energyIncrease: number       // このカテゴリ単体での実際の増加量
  missingIngredients: string[] // この食材以外に必要な未チェック食材名（即解放なら空）
}

// 提案1件分（進化系統1グループに対応）
export interface SuggestionItem {
  groupKey: string           // Reactのkey用識別子（タイプ+食材構成+食材IDの組み合わせ）
  pokemonNames: string[]     // 進化系統のポケモン名一覧（例: ["ゼニガメ", "カメール", "カメックス"]）
  slot: 'A' | 'B'           // 何枠でこの食材を持つか
  ingredientId: string
  ingredientName: string
  energyIncrease: number           // 優先度の根拠（カテゴリ別合計エナジーの差分）
  bestRecipesByCategory: BestRecipeByCategory[]  // 食材追加後にエナジーが上がるカテゴリのレシピ一覧
  priority: 'high' | 'medium' | 'low'
}

// recommend() の戻り値。3種類のうちいずれか1つを返す（ユニオン型）
export type SuggestionsResult =
  | { type: 'complete';    items: [] }            // 全食材チェック済み
  | { type: 'no-results';  items: [] }            // 解放できるレシピがない
  | { type: 'suggestions'; items: SuggestionItem[] } // 提案あり
