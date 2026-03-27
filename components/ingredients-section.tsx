"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          厳選済みの食材
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-xs sm:max-w-sm mx-auto w-full flex flex-col gap-2">
          {/* 全選択・全解除ボタンをグリッドの右端に揃える */}
          <div className="flex gap-2 justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={allChecked}>
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={!hasChecked}>
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
        <div className="grid grid-cols-5 gap-2">
          {ingredients.map((ingredient) => {
            const isChecked = checkedIngredients.has(ingredient.id)
            return (
              <button
                key={ingredient.id}
                onClick={() => onToggle(ingredient.id)}
                className={`
                  relative group aspect-square rounded-lg p-1.5 transition-all duration-150 select-none cursor-pointer
                  ${isChecked
                    ? "bg-success/30 ring-2 ring-success/60"
                    : "bg-muted/30 opacity-40"
                  }
                `}
              >
                <img
                  src={`/ingredients/${ingredient.id}.png`}
                  alt={ingredient.name}
                  width={48}
                  height={48}
                  className="object-contain w-full h-full"
                />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:block bg-popover/90 rounded px-1.5 py-0.5 text-[10px] text-center pointer-events-none z-10 leading-tight whitespace-nowrap shadow-sm">
                  {ingredient.name}
                </span>
              </button>
            )
          })}
        </div>
        </div>
      </CardContent>
    </Card>
  )
}
