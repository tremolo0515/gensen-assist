"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { PotCapacitySection } from "@/components/pot-capacity-section"
import { IngredientsSection } from "@/components/ingredients-section"
import { SuggestionsSection } from "@/components/suggestions-section"
import { BestRecipesSection } from "@/components/best-recipes-section"
import { INGREDIENTS, COOKING_POWER_UP_BONUS, COOKING_POWER_UP_MINUS_BONUS } from "@/lib/data"
import { recommend, getBestRecipesPerCategory } from "@/lib/recommend"

const STORAGE_KEY_POT = "pokesleep-pot-capacity"
const STORAGE_KEY_INGREDIENTS = "pokesleep-checked-ingredients"
const STORAGE_KEY_TICKET = "pokesleep-good-camp-ticket"
const STORAGE_KEY_SUNDAY = "pokesleep-sunday-pot"
const STORAGE_KEY_POWERUP_LEVEL = "pokesleep-cooking-powerup-level"
const STORAGE_KEY_POWERUP_COUNT = "pokesleep-cooking-powerup-count"
const STORAGE_KEY_POWERUP_MINUS_LEVEL = "pokesleep-cooking-powerup-minus-level"
const STORAGE_KEY_POWERUP_MINUS_COUNT = "pokesleep-cooking-powerup-minus-count"

export default function Home() {
  const [potCapacity, setPotCapacity] = useState(15)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set())
  const [useGoodCampTicket, setUseGoodCampTicket] = useState(false)
  const [useSundayPot, setUseSundayPot] = useState(false)
  const [cookingPowerUpLevel, setCookingPowerUpLevel] = useState(1)
  const [cookingPowerUpCount, setCookingPowerUpCount] = useState(0)
  const [cookingPowerUpMinusLevel, setCookingPowerUpMinusLevel] = useState(1)
  const [cookingPowerUpMinusCount, setCookingPowerUpMinusCount] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [storageBlocked, setStorageBlocked] = useState(false)

  useEffect(() => {
    try {
      const savedPot = localStorage.getItem(STORAGE_KEY_POT)
      const savedIngredients = localStorage.getItem(STORAGE_KEY_INGREDIENTS)
      const savedTicket = localStorage.getItem(STORAGE_KEY_TICKET)
      const savedSunday = localStorage.getItem(STORAGE_KEY_SUNDAY)
      const savedPowerUpLevel = localStorage.getItem(STORAGE_KEY_POWERUP_LEVEL)
      const savedPowerUpCount = localStorage.getItem(STORAGE_KEY_POWERUP_COUNT)
      const savedPowerUpMinusLevel = localStorage.getItem(STORAGE_KEY_POWERUP_MINUS_LEVEL)
      const savedPowerUpMinusCount = localStorage.getItem(STORAGE_KEY_POWERUP_MINUS_COUNT)

      if (savedPot) setPotCapacity(parseInt(savedPot, 10))
      if (savedIngredients) setCheckedIngredients(new Set(JSON.parse(savedIngredients)))
      if (savedTicket) setUseGoodCampTicket(savedTicket === 'true')
      if (savedSunday) setUseSundayPot(savedSunday === 'true')
      if (savedPowerUpLevel) setCookingPowerUpLevel(parseInt(savedPowerUpLevel, 10))
      if (savedPowerUpCount) setCookingPowerUpCount(parseInt(savedPowerUpCount, 10))
      if (savedPowerUpMinusLevel) setCookingPowerUpMinusLevel(parseInt(savedPowerUpMinusLevel, 10))
      if (savedPowerUpMinusCount) setCookingPowerUpMinusCount(parseInt(savedPowerUpMinusCount, 10))
    } catch {
      setStorageBlocked(true)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded) try { localStorage.setItem(STORAGE_KEY_POT, potCapacity.toString()) } catch {}
  }, [potCapacity, isLoaded])

  useEffect(() => {
    if (isLoaded) try { localStorage.setItem(STORAGE_KEY_INGREDIENTS, JSON.stringify([...checkedIngredients])) } catch {}
  }, [checkedIngredients, isLoaded])

  useEffect(() => {
    if (isLoaded) try { localStorage.setItem(STORAGE_KEY_TICKET, useGoodCampTicket.toString()) } catch {}
  }, [useGoodCampTicket, isLoaded])

  useEffect(() => {
    if (isLoaded) try { localStorage.setItem(STORAGE_KEY_SUNDAY, useSundayPot.toString()) } catch {}
  }, [useSundayPot, isLoaded])

  useEffect(() => {
    if (isLoaded) try { localStorage.setItem(STORAGE_KEY_POWERUP_LEVEL, cookingPowerUpLevel.toString()) } catch {}
  }, [cookingPowerUpLevel, isLoaded])

  useEffect(() => {
    if (isLoaded) try { localStorage.setItem(STORAGE_KEY_POWERUP_COUNT, cookingPowerUpCount.toString()) } catch {}
  }, [cookingPowerUpCount, isLoaded])

  useEffect(() => {
    if (isLoaded) try { localStorage.setItem(STORAGE_KEY_POWERUP_MINUS_LEVEL, cookingPowerUpMinusLevel.toString()) } catch {}
  }, [cookingPowerUpMinusLevel, isLoaded])

  useEffect(() => {
    if (isLoaded) try { localStorage.setItem(STORAGE_KEY_POWERUP_MINUS_COUNT, cookingPowerUpMinusCount.toString()) } catch {}
  }, [cookingPowerUpMinusCount, isLoaded])

  const toggleIngredient = (ingredientId: string) => {
    setCheckedIngredients(prev => {
      const next = new Set(prev)
      if (next.has(ingredientId)) {
        next.delete(ingredientId)
      } else {
        next.add(ingredientId)
      }
      return next
    })
  }

  const clearAllIngredients = () => {
    setCheckedIngredients(new Set())
  }

  const selectAllIngredients = () => {
    setCheckedIngredients(new Set(INGREDIENTS.map(i => i.id)))
  }

  // 計算順: (なべ容量 × 日曜2倍 + 料理パワーアップ加算) × いいキャンプチケット → 四捨五入
  // (wikiより: 料理パワーアップ(マイナス含む)の加算分は日曜2倍の対象外だが、いいキャンプチケット1.5倍は加算分にも適用される)
  // 通常版・マイナス版は同一のボーナス枠として合算し、上限200個でクランプする
  const cookingPowerUpBonus = Math.min(
    200,
    COOKING_POWER_UP_BONUS[cookingPowerUpLevel] * cookingPowerUpCount +
      COOKING_POWER_UP_MINUS_BONUS[cookingPowerUpMinusLevel] * cookingPowerUpMinusCount
  )
  const effectivePotCapacity = Math.round(
    (potCapacity * (useSundayPot ? 2 : 1) + cookingPowerUpBonus) * (useGoodCampTicket ? 1.5 : 1)
  )

  const bestRecipes = useMemo(() => {
    return getBestRecipesPerCategory(checkedIngredients, effectivePotCapacity)
  }, [checkedIngredients, effectivePotCapacity])

  const suggestions = useMemo(() => {
    return recommend(checkedIngredients, effectivePotCapacity)
  }, [checkedIngredients, effectivePotCapacity])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {storageBlocked && (
        <div className="bg-warning/10 border-b border-warning/30 px-4 py-2 text-center">
          <p className="text-xs text-warning-foreground">
            ブラウザの設定により入力内容が保存されません。ページを閉じると入力がリセットされます。
          </p>
        </div>
      )}
      <div className="container mx-auto px-4 py-6 max-w-4xl lg:max-w-6xl">
        <Header />
        <div className="mt-4 flex flex-col lg:flex-row lg:items-start">
          {/* 左カラム：入力 */}
          <div className="flex flex-col gap-2 lg:flex-1 lg:min-w-0">
            <PotCapacitySection
              value={potCapacity}
              onChange={setPotCapacity}
              useGoodCampTicket={useGoodCampTicket}
              onToggleGoodCampTicket={() => setUseGoodCampTicket(prev => !prev)}
              useSundayPot={useSundayPot}
              onToggleSundayPot={() => setUseSundayPot(prev => !prev)}
              cookingPowerUpLevel={cookingPowerUpLevel}
              onCookingPowerUpLevelChange={setCookingPowerUpLevel}
              cookingPowerUpCount={cookingPowerUpCount}
              onCookingPowerUpCountChange={setCookingPowerUpCount}
              cookingPowerUpMinusLevel={cookingPowerUpMinusLevel}
              onCookingPowerUpMinusLevelChange={setCookingPowerUpMinusLevel}
              cookingPowerUpMinusCount={cookingPowerUpMinusCount}
              onCookingPowerUpMinusCountChange={setCookingPowerUpMinusCount}
              effectivePotCapacity={effectivePotCapacity}
            />
            <IngredientsSection
              ingredients={INGREDIENTS}
              checkedIngredients={checkedIngredients}
              onToggle={toggleIngredient}
              onClearAll={clearAllIngredients}
              onSelectAll={selectAllIngredients}
            />
          </div>

          {/* セパレーター（PC のみ表示） */}
          <div className="hidden lg:flex flex-col items-center self-stretch px-5 py-6">
            <div className="flex-1 w-px bg-linear-to-b from-transparent via-border to-transparent" />
            <ChevronRight className="my-2 w-4 h-4 text-muted-foreground/35 shrink-0" />
            <div className="flex-1 w-px bg-linear-to-b from-transparent via-border to-transparent" />
          </div>

          {/* 右カラム：出力 */}
          <div className="flex flex-col gap-2 lg:flex-2 lg:min-w-0 mt-4 lg:mt-0">
            <BestRecipesSection bestRecipes={bestRecipes} />
            <SuggestionsSection suggestions={suggestions} />
          </div>
        </div>
        <footer className="mt-10 pb-6 text-center space-y-1">
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
            ©2023 Pokémon. ©1995-2023 Nintendo/Creatures Inc./GAME FREAK inc. Pokémon Sleep is developed by SELECT BUTTON inc.
          </p>
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
            ポケットモンスター・Pokémonの著作権及び商標は株式会社任天堂・クリーチャーズ・ゲームフリークに帰属します。
          </p>
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
            本ツールで使用している画像・データの一部はポケスリwiki（wikiwiki.jp/poke_sleep）より引用しており、当該コンテンツの権利は株式会社ウキウキに帰属します。
          </p>
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
            その他引用のコンテンツの権利はそれぞれの出典元に帰属します。
          </p>
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed mt-2">
            作者の
            <a href="https://x.com/ikkyu_pokesle" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-muted-foreground transition-colors mx-1">X (Twitter)</a>
            /
            <a href="https://stoic-dojo.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-muted-foreground transition-colors ml-1">ブログ</a>
          </p>
        </footer>
      </div>
    </main>
  )
}
