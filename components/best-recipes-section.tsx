"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { INGREDIENTS } from "@/lib/data"
import type { Recipe } from "@/lib/types"

// 食材ID → 食材名のマップ（ルックアップ用）
const INGREDIENT_NAME: Record<string, string> = Object.fromEntries(
  INGREDIENTS.map(i => [i.id, i.name])
)

// 食材画像コンポーネント（IDから /ingredients/{id}.png を参照）
function IngredientImage({ id, count }: { id: string; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <img
        src={`/ingredients/${id}.png`}
        alt={INGREDIENT_NAME[id] ?? id}
        width={52}
        height={52}
        className="object-contain w-13 h-13 shrink-0"
      />
      <span className="text-sm text-muted-foreground font-medium">×{count}</span>
    </div>
  )
}

// カテゴリごとの表示設定
const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; bgClass: string }> = {
  curry:   { label: "カレー・シチュー",  emoji: "🍛", bgClass: "bg-orange-100/30 dark:bg-orange-900/10" },
  salad:   { label: "サラダ",            emoji: "🥗", bgClass: "bg-green-100/30  dark:bg-green-900/10"  },
  dessert: { label: "デザート・ドリンク", emoji: "🍰", bgClass: "bg-pink-100/30   dark:bg-pink-900/10"   },
}

// カテゴリID → 背景クラスのエクスポート（suggestions-section でも利用）
export const CATEGORY_BG: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_CONFIG).map(([k, v]) => [k, v.bgClass])
)

interface BestRecipesSectionProps {
  // カテゴリ → いま作れる最大レシピ（作れない場合は null）
  bestRecipes: Record<'curry' | 'salad' | 'dessert', Recipe | null>
}

export function BestRecipesSection({ bestRecipes }: BestRecipesSectionProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          いま作れる最大レシピ
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 3カテゴリを横並びで表示 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["curry", "salad", "dessert"] as const).map((category) => {
            const config = CATEGORY_CONFIG[category]
            const recipe = bestRecipes[category]
            return (
              <div
                key={category}
                className={`flex flex-col rounded-lg border border-border/50 p-3 gap-1.5 ${config.bgClass}`}
              >
                {/* カテゴリ名 */}
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <span>{config.emoji}</span>
                  <span>{config.label}</span>
                </div>
                {recipe ? (
                  <>
                    {/* レシピ名 */}
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {recipe.name}
                    </p>
                    {/* エナジーと食材合計個数を同じ行に表示 */}
                    <div className="flex items-baseline justify-between">
                      <p className="text-lg font-bold text-primary">
                        {recipe.energy.toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground ml-1">エナジー</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        合計 <span className="font-medium">{recipe.totalCount}個</span>
                      </p>
                    </div>
                    {/* 必要食材を画像+個数で2列グリッド表示 */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-0.5 mx-auto w-fit">
                      {recipe.ingredients.map(ri => (
                        <IngredientImage key={ri.ingredientId} id={ri.ingredientId} count={ri.count} />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">作れるレシピなし</p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
