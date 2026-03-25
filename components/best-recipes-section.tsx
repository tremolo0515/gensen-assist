"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { INGREDIENTS } from "@/lib/data"
import type { Recipe } from "@/lib/types"

// 食材ID → 食材名のマップ（ルックアップ用）
const INGREDIENT_NAME: Record<string, string> = Object.fromEntries(
  INGREDIENTS.map(i => [i.id, i.name])
)

// カテゴリごとの表示設定
const CATEGORY_CONFIG: Record<string, { label: string; emoji: string }> = {
  curry:   { label: "カレー・シチュー", emoji: "🍛" },
  salad:   { label: "サラダ",           emoji: "🥗" },
  dessert: { label: "デザート・ドリンク", emoji: "🍰" },
}

interface BestRecipesSectionProps {
  // カテゴリ → 現在作れる最大エナジーレシピ（作れない場合は null）
  bestRecipes: Record<'curry' | 'salad' | 'dessert', Recipe | null>
}

export function BestRecipesSection({ bestRecipes }: BestRecipesSectionProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-xl" role="img" aria-label="料理">🍽️</span>
          現在作れる最大エナジーレシピ
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
                className="flex flex-col rounded-lg border border-border/50 bg-muted/30 p-3 gap-1.5"
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
                      <p className="text-base font-bold text-primary">
                        {recipe.energy.toLocaleString()}
                        <span className="text-xs font-normal text-muted-foreground ml-1">エナジー</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        合計 <span className="font-medium">{recipe.totalCount}個</span>
                      </p>
                    </div>
                    {/* 必要食材の名前と個数 */}
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {recipe.ingredients.map(ri => (
                        <div key={ri.ingredientId} className="flex justify-between text-xs text-muted-foreground">
                          <span>{INGREDIENT_NAME[ri.ingredientId]}</span>
                          <span className="font-medium">{ri.count}個</span>
                        </div>
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
