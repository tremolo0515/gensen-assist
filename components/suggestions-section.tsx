"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PartyPopper, Trophy, ChevronDown } from "lucide-react"
import type { SuggestionsResult, SuggestionItem } from "@/lib/types"

// 優先度ごとの表示設定（ラベルと左アクセントラインの色）
const priorityConfig = {
  high:   { label: "優先度: 高", labelClass: "text-destructive",      accentClass: "border-l-destructive" },
  medium: { label: "優先度: 中", labelClass: "text-warning-foreground", accentClass: "border-l-warning" },
  low:    { label: "優先度: 低", labelClass: "text-info",              accentClass: "border-l-info" },
}

// recommend() の結果を受け取り、3パターン（complete/no-results/suggestions）で表示を切り替える
export function SuggestionsSection({ suggestions }: { suggestions: SuggestionsResult }) {
  // 提案を優先度別にグループ分け
  const groupedByPriority = suggestions.type === "suggestions"
    ? {
        high:   suggestions.items.filter(p => p.priority === "high"),
        medium: suggestions.items.filter(p => p.priority === "medium"),
        low:    suggestions.items.filter(p => p.priority === "low"),
      }
    : { high: [], medium: [], low: [] }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-xl" role="img" aria-label="ターゲット">🎯</span>
          次に厳選すべきポケモン
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* type の値で表示コンポーネントを切り替え（&& は条件が true のときだけ右側を表示） */}
        {suggestions.type === "complete"   && <CompleteState />}
        {suggestions.type === "no-results" && <NoResultsState />}
        {suggestions.type === "suggestions" && (
          <div className="flex flex-col gap-4">
            {(["high", "medium", "low"] as const).map((priority) => {
              const items = groupedByPriority[priority]
              if (items.length === 0) return null
              return (
                <PriorityArea
                  key={priority}
                  config={priorityConfig[priority]}
                  items={items}
                />
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// 優先度グループの枠。食材ごとにさらにグループ化してカードを並べる
function PriorityArea({
  config,
  items,
}: {
  config: typeof priorityConfig.high
  items: SuggestionItem[]
}) {
  // 同じ食材のポケモンをまとめる（Mapで順序を保持）
  const byIngredient = new Map<string, SuggestionItem[]>()
  for (const item of items) {
    if (!byIngredient.has(item.ingredientId)) byIngredient.set(item.ingredientId, [])
    byIngredient.get(item.ingredientId)!.push(item)
  }

  return (
    <div className={`border-l-4 pl-3 ${config.accentClass}`}>
      <p className={`text-xs font-semibold mb-2 ${config.labelClass}`}>
        {config.label}
      </p>
      <div className="flex flex-col gap-3">
        {[...byIngredient.entries()].map(([ingredientId, groupItems]) => (
          <IngredientGroup
            key={ingredientId}
            ingredientName={groupItems[0].ingredientName}
            items={groupItems}
          />
        ))}
      </div>
    </div>
  )
}

// 食材グループ：食材名クリックでレシピ詳細を展開し、下にポケモンカードを並べる
function IngredientGroup({ ingredientName, items }: { ingredientName: string; items: SuggestionItem[] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const recipes = items[0].bestRecipesByCategory

  return (
    <div className="flex flex-col gap-1.5">
      {/* 食材名（クリックで展開、枠なし） */}
      <div
        className="flex items-center gap-1 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-xs font-medium text-muted-foreground">{ingredientName}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* 展開時：カテゴリ別レシピ詳細 */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mb-1.5 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">作れるようになるレシピ</p>
          {recipes.map(({ category, recipeName, energy, energyIncrease }) => (
            <div key={category} className="flex items-center justify-between text-sm bg-muted/30 rounded-md px-2 py-1.5">
              <span className="text-foreground font-medium">{recipeName}</span>
              <div className="text-right shrink-0 ml-2">
                <span className="text-primary font-semibold">{energy.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground ml-1">エナジー</span>
                <span className="text-xs text-success font-medium ml-2">(+{energyIncrease.toLocaleString()})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ポケモンカード一覧（2列グリッド） */}
      <div className="grid grid-cols-2 gap-1.5">
        {items.map((item) => (
          <SuggestionCard key={item.groupKey} item={item} />
        ))}
      </div>
    </div>
  )
}

// ポケモン1体分のカード（展開なし）
function SuggestionCard({ item }: { item: SuggestionItem }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 px-3 py-1.5 flex items-center gap-2">
      <span className="text-sm font-semibold text-foreground">
        {item.pokemonNames.join(' / ')}
      </span>
      <span className="text-xs bg-secondary text-secondary-foreground rounded px-1.5 py-0.5 shrink-0">
        {item.slot === 'A' ? 'AAA' : 'ABB'}
      </span>
    </div>
  )
}

// 全食材チェック済みのときに表示
function CompleteState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <PartyPopper className="w-12 h-12 text-success mb-3" />
      <p className="text-lg font-medium text-foreground">すべての食材が揃っています！</p>
      <p className="text-sm text-muted-foreground mt-1">おめでとうございます。</p>
    </div>
  )
}

// 未チェック食材はあるが、追加してもエナジーが増えない（現状で十分強い）ときに表示
function NoResultsState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Trophy className="w-12 h-12 text-primary mb-3" />
      <p className="text-foreground font-medium">
        ベストなレシピが作成できます！
      </p>
      <p className="text-sm text-muted-foreground mt-1">表示されているレシピを作りつつ、なべ容量の拡張を進めましょう</p>
    </div>
  )
}
