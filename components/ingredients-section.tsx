"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RotateCcw, CheckCheck } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Ingredient } from "@/lib/types"

// 食材ID → 絵文字のマッピング（表示専用）
const INGREDIENT_EMOJI: Record<string, string> = {
  "amai-mitsu":          "🍯",
  "anmin-tomato":        "🍅",
  "hokkori-potato":      "🥔",
  "attaka-ginger":       "🫚",
  "relax-cacao":         "🍫",
  "gekikara-herb":       "🌿",
  "pure-oil":            "🫙",
  "mame-meat":           "🍖",
  "moumou-milk":         "🥛",
  "tokusen-egg":         "🥚",
  "tokusen-ringo":       "🍎",
  "ajiwai-kinoko":       "🍄",
  "futoi-naganegi":      "🥬",
  "oishii-shippo":       "🦎",
  "wakakusa-daizu":      "🫘",
  "wakakusa-corn":       "🌽",
  "mezamashi-coffee":    "☕️",
  "zussiri-kabocha":     "🎃",
  "tsuyatsuya-avocado":  "🥑",
}

// page.tsx から受け取る props の型定義
interface IngredientsSectionProps {
  ingredients: Ingredient[]          // 全19食材（INGREDIENTS定数）
  checkedIngredients: Set<string>    // チェック済み食材IDの集合
  onToggle: (ingredientId: string) => void // チェック切り替え時に呼ぶ関数
  onClearAll: () => void             // 全解除ボタン確認後に呼ぶ関数
  onSelectAll: () => void            // 全選択ボタンで呼ぶ関数
}

export function IngredientsSection({
  ingredients,
  checkedIngredients,
  onToggle,
  onClearAll,
  onSelectAll,
}: IngredientsSectionProps) {
  // 1件もチェックされていないとき全解除ボタンを非活性にするためのフラグ
  const hasChecked = checkedIngredients.size > 0
  // 全件チェック済みのとき全選択ボタンを非活性にするためのフラグ
  const allChecked = checkedIngredients.size === ingredients.length

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <span className="text-xl" role="img" aria-label="チェック">✅</span>
              厳選済みの食材
            </CardTitle>
            <CardDescription className="mt-1.5">
              担当ポケモンの厳選が完了した食材にチェックを入れてください
            </CardDescription>
          </div>
          {/* 全選択・全解除ボタンを横並びで配置 */}
          <div className="flex gap-2 shrink-0">
            {/* 全選択ボタン：押すと確認ダイアログが開き、OKで onSelectAll が呼ばれる */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={allChecked}
                >
                  <CheckCheck className="w-4 h-4 mr-1.5" />
                  全選択
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>すべての食材を選択しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    すべての食材にチェックが入ります。この操作は元に戻せません。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction onClick={onSelectAll}>選択する</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {/* 全解除ボタン：押すと確認ダイアログが開き、OKで onClearAll が呼ばれる */}
            <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasChecked}
                className="shrink-0"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                全解除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>チェックをすべて解除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  すべての食材のチェックが解除されます。この操作は元に戻せません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={onClearAll}>解除する</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* ingredients.map() で食材19件分のチェックボックスをループ生成 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {ingredients.map((ingredient) => {
            const isChecked = checkedIngredients.has(ingredient.id)
            return (
              <label
                key={ingredient.id}
                className={`
                  relative flex items-center gap-1.5 p-2.5 rounded-lg border cursor-pointer
                  transition-all duration-150 select-none
                  ${isChecked
                    ? "bg-success/15 border-success/40 text-success-foreground"
                    : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50"
                  }
                `}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => onToggle(ingredient.id)}
                  className={isChecked ? "border-success data-[state=checked]:bg-success data-[state=checked]:border-success" : ""}
                />
                <span className="text-base leading-none shrink-0">{INGREDIENT_EMOJI[ingredient.id]}</span>
                <span className={`text-xs sm:text-sm font-medium leading-tight ${isChecked ? "text-foreground" : ""}`}>
                  {ingredient.name}
                </span>
              </label>
            )
          })}
        </div>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {checkedIngredients.size} / {ingredients.length} 完了
        </div>
      </CardContent>
    </Card>
  )
}
