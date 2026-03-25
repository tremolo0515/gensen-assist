"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PartyPopper, AlertCircle, ChevronDown } from "lucide-react"
import type { SuggestionsResult, SuggestionItem } from "@/lib/types"

// 優先度ごとの表示設定（ラベルとCSSクラス）
const priorityConfig = {
  high:   { label: "優先度: 高", headerClass: "bg-destructive/10 border-destructive/30 text-destructive", areaClass: "border-destructive/20" },
  medium: { label: "優先度: 中", headerClass: "bg-warning/10 border-warning/30 text-warning-foreground", areaClass: "border-warning/20" },
  low:    { label: "優先度: 低", headerClass: "bg-info/10 border-info/30 text-info", areaClass: "border-info/20" },
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

// 優先度グループの枠。その中に SuggestionCard を並べる
function PriorityArea({
  config,
  items,
}: {
  config: typeof priorityConfig.high
  items: SuggestionItem[]
}) {
  return (
    <div className={`rounded-xl border ${config.areaClass} overflow-hidden`}>
      <div className={`px-3 py-2 border-b ${config.headerClass} font-semibold text-sm`}>
        {config.label}
      </div>
      <div className="p-3 flex flex-col gap-2">
        {items.map((item) => (
          <SuggestionCard key={item.ingredientId} item={item} />
        ))}
      </div>
    </div>
  )
}

// 食材1件分のカード。タップで開閉するアコーディオン
function SuggestionCard({ item }: { item: SuggestionItem }) {
  // isExpanded: カードの開閉状態。このコンポーネント内だけで使うローカルな状態
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={`rounded-lg border transition-all duration-200 cursor-pointer ${
        isExpanded
          ? "border-primary/40 bg-primary/5"
          : "border-border/50 bg-card/50 hover:bg-card"
      }`}
      onClick={() => setIsExpanded(!isExpanded)} // タップで true/false を反転
    >
      {/* 常に表示される部分：食材名と最大エナジー */}
      <div className="px-3 py-2 flex items-center gap-3">
        <span className="font-semibold text-foreground">{item.ingredientName}</span>
        <span className="text-sm text-primary font-medium ml-auto shrink-0">
          {item.maxEnergy.toLocaleString()} エナジー
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* 展開時のみ表示される部分：レシピ名と担当ポケモン一覧 */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 pb-3 pt-1 border-t border-border/30 flex flex-col gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">解放できる最大エナジーレシピ</p>
            <div className="flex items-center justify-between text-sm bg-background/50 rounded-md px-2 py-1.5">
              <span className="text-foreground font-medium">{item.maxEnergyRecipeName}</span>
              <span className="text-primary font-semibold">
                {item.maxEnergy.toLocaleString()} エナジー
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">担当ポケモン</p>
            <div className="flex flex-wrap gap-1.5">
              {item.pokemon.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 text-xs bg-secondary rounded-md px-2 py-1"
                >
                  <span className="text-muted-foreground">{p.slot}枠</span>
                  <span className="font-medium">{p.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
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

// 未チェック食材はあるが鍋容量不足などで提案が出ないときに表示
function NoResultsState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="w-12 h-12 text-warning mb-3" />
      <p className="text-foreground font-medium">
        現在の鍋容量では、未厳選の食材が必要なレシピに届きません。
      </p>
      <p className="text-sm text-muted-foreground mt-1">鍋容量を上げると提案が表示されます。</p>
    </div>
  )
}
