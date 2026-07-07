"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PartyPopper, Trophy, ChevronDown } from "lucide-react"
import type { SuggestionsResult, SuggestionItem } from "@/lib/types"
import { CATEGORY_BG, CATEGORY_EMOJI } from "@/components/best-recipes-section"

// 優先度ごとの表示設定（ラベルと左アクセントラインの色）
const priorityConfig = {
  high:   { shortLabel: "S", labelClass: "text-destructive",       barClass: "bg-destructive" },
  medium: { shortLabel: "A", labelClass: "text-warning",            barClass: "bg-warning" },
  low:    { shortLabel: "B", labelClass: "text-info",               barClass: "bg-info" },
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
          厳選おすすめポケモン
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
    <div className="flex gap-3">
      {/* 縦バー + 短いラベル */}
      <div className="flex flex-col items-center gap-0.5 shrink-0">
        <span className={`text-[9px] font-bold ${config.labelClass}`}>{config.shortLabel}</span>
        <div className={`flex-1 w-0.5 rounded-full ${config.barClass}`} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-3">
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

// 食材グループ：食材名クリックでレシピ詳細を展開し、下にポケモン画像を並べる
function IngredientGroup({ ingredientName, items }: { ingredientName: string; items: SuggestionItem[] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const recipes = items[0].bestRecipesByCategory

  return (
    <div className="relative flex flex-col gap-1 border border-border/40 rounded-lg pl-2 pr-5 pt-3 pb-1 min-w-28">
      {/* 食材画像ラベル（枠線左上） */}
      <div className="absolute -top-2.5 -left-1.5">
        <div className="relative group w-6 h-6 shrink-0">
          <img
            src={`/ingredients/${items[0].ingredientId}.png`}
            alt={ingredientName}
            width={24}
            height={24}
            className="object-contain w-6 h-6"
          />
          <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 hidden group-hover:block bg-popover/90 rounded px-1.5 py-0.5 text-[10px] pointer-events-none z-10 leading-tight whitespace-nowrap shadow-sm">
            {ingredientName}
          </span>
        </div>
      </div>

      {/* 展開矢印（枠内右上） */}
      <div
        className="absolute top-1 right-1 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronDown
          className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* 進化系統グループ */}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <EvolutionGroup key={item.groupKey} item={item} />
        ))}
      </div>

      {/* 展開時：カテゴリ別レシピ詳細（手前に浮かせてレイアウトに影響させない） */}
      {isExpanded && (
        <div className="absolute left-0 top-full mt-1 z-50 w-80 flex flex-col gap-1 rounded-lg border border-border/50 bg-popover p-2 shadow-md">
          <p className="text-xs text-muted-foreground">作れるようになるレシピ</p>
          {recipes.map(({ category, recipeName, energy, energyIncrease, missingIngredients }) => (
            <div key={category} className={`flex flex-col rounded-md px-2 py-1.5 gap-0.5 ${CATEGORY_BG[category] ?? 'bg-muted/30'}`}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-start gap-1 text-foreground text-xs font-normal">
                  <span className="shrink-0">{CATEGORY_EMOJI[category]}</span>
                  <span>{recipeName}</span>
                </span>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-primary font-semibold">{energy.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground ml-1">エナジー</span>
                  <span className="text-xs text-success font-medium ml-2">(+{energyIncrease.toLocaleString()})</span>
                </div>
              </div>
              {missingIngredients.length > 0 && (
                <p className="text-xs text-warning-foreground">
                  他に必要: {missingIngredients.join('・')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const POKEMON_SIZE = 44
const STACK_OFFSET_X = 40
const STACK_OFFSET_Y = 0

// 進化系統グループ：同じ系統のポケモンを少しずつずらして重ねて表示
function EvolutionGroup({ item }: { item: SuggestionItem }) {
  const count = item.pokemonNames.length
  const totalWidth = POKEMON_SIZE + (count - 1) * STACK_OFFSET_X
  const totalHeight = POKEMON_SIZE + (count - 1) * STACK_OFFSET_Y

  return (
    <div className="relative shrink-0" style={{ width: totalWidth, height: totalHeight }}>
      {item.pokemonNames.map((name, i) => (
        <div
          key={name}
          className="absolute"
          style={{ left: i * STACK_OFFSET_X, top: i * STACK_OFFSET_Y, zIndex: count - 1 - i }}
        >
          <PokemonImage name={name} imageFile={item.pokemonImages[i]} slot={item.slot} />
        </div>
      ))}
    </div>
  )
}

// ポケモン1体分の画像。タップで名前と食材配列を表示
function PokemonImage({ name, imageFile, slot }: { name: string; imageFile: string | undefined; slot: 'A' | 'B' }) {
  const [showInfo, setShowInfo] = useState(false)
  return (
    <button
      className="relative group flex items-center justify-center cursor-pointer"
      style={{ width: POKEMON_SIZE, height: POKEMON_SIZE }}
      onClick={() => setShowInfo(v => !v)}
    >
      {imageFile ? (
        <img src={`/pokemon/${imageFile}`} alt={name} width={POKEMON_SIZE} height={POKEMON_SIZE} className="object-contain" />
      ) : (
        <div className="w-10 h-10 flex items-center justify-center text-xs text-muted-foreground bg-muted rounded-full">?</div>
      )}
      {/* タップで表示（スマホ用） */}
      {showInfo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-popover/90 rounded text-[10px] text-center pointer-events-none z-10">
          <p className="text-foreground leading-tight">{name}</p>
          <p className="text-muted-foreground">{slot === 'A' ? 'AAA' : 'ABB'}</p>
        </div>
      )}
      {/* ホバーで表示（PC用） */}
      {!showInfo && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:block bg-popover/90 rounded px-1.5 py-0.5 text-[10px] text-center pointer-events-none z-20 leading-tight whitespace-nowrap shadow-sm">
          <span className="block text-foreground">{name}</span>
          <span className="block text-muted-foreground">{slot === 'A' ? 'AAA' : 'ABB'}</span>
        </span>
      )}
    </button>
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
