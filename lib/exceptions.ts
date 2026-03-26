// ゲームデータの特殊ケースをまとめた定数ファイル
// 新しいポケモン・食材を追加したときはここを確認・更新する

// ── ポケモンの例外 ─────────────────────────────────────────────────────────

// 食材配列が完全一致するにもかかわらず別の進化系統であるグループ。
// 通常は食材配列が同じなら同一カードにまとめるが、これらは別カードにする。
// 新しいポケモンが既存と食材配列が完全一致する場合、ここに追加が必要。
export const SAME_INGREDIENT_SEPARATE_GROUPS: string[][] = [
  ['madatsubomi', 'utsudon', 'utsubot'], // ウツボット系（くさ）
  ['bariyado', 'manene'],                // バリヤード系（エスパー）
  // 上記2グループは anmin-tomato / hokkori-potato / futoi-naganegi で完全一致
]

// 上記グループを高速検索するためのフラットなSet
export const SAME_INGREDIENT_SEPARATE_IDS: Set<string> = new Set(
  SAME_INGREDIENT_SEPARATE_GROUPS.flat()
)

// ── 食材の例外 ─────────────────────────────────────────────────────────────

// 食材得意（speciality === 'food'）のポケモンが存在しない特殊食材。
// 提案時に得意条件を外してすべてのポケモンを対象にする。
export const NON_FOOD_SPECIALIST_INGREDIENTS: Set<string> = new Set([
  'oishii-shippo',
])

// 優先度を常に low に固定する食材（スコアに関わらず上位にしない）。
export const ALWAYS_LOW_PRIORITY_INGREDIENTS: Set<string> = new Set([
  'oishii-shippo',
])
