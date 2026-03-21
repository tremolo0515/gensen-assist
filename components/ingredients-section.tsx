"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RotateCcw } from "lucide-react"
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

interface IngredientsSectionProps {
  ingredients: readonly string[]
  checkedIngredients: Set<string>
  onToggle: (ingredient: string) => void
  onClearAll: () => void
}

export function IngredientsSection({
  ingredients,
  checkedIngredients,
  onToggle,
  onClearAll,
}: IngredientsSectionProps) {
  const hasChecked = checkedIngredients.size > 0

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
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {ingredients.map((ingredient) => {
            const isChecked = checkedIngredients.has(ingredient)
            return (
              <label
                key={ingredient}
                className={`
                  relative flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer
                  transition-all duration-150 select-none
                  ${isChecked 
                    ? "bg-success/15 border-success/40 text-success-foreground" 
                    : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50"
                  }
                `}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => onToggle(ingredient)}
                  className={isChecked ? "border-success data-[state=checked]:bg-success data-[state=checked]:border-success" : ""}
                />
                <span className={`text-xs sm:text-sm font-medium leading-tight ${isChecked ? "text-foreground" : ""}`}>
                  {ingredient}
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
