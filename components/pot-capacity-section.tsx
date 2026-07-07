"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowRight, Minus, Plus } from "lucide-react"

const COOKING_POWER_UP_LEVELS = [1, 2, 3, 4, 5, 6, 7]
const COOKING_POWER_UP_COUNTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// page.tsx から受け取る props の型定義
interface PotCapacitySectionProps {
  value: number
  onChange: (value: number) => void
  useGoodCampTicket: boolean
  onToggleGoodCampTicket: () => void
  useSundayPot: boolean
  onToggleSundayPot: () => void
  cookingPowerUpLevel: number
  onCookingPowerUpLevelChange: (level: number) => void
  cookingPowerUpCount: number
  onCookingPowerUpCountChange: (count: number) => void
  cookingPowerUpMinusLevel: number
  onCookingPowerUpMinusLevelChange: (level: number) => void
  cookingPowerUpMinusCount: number
  onCookingPowerUpMinusCountChange: (count: number) => void
  effectivePotCapacity: number  // 全トグル適用後のなべ容量
}

export function PotCapacitySection({
  value,
  onChange,
  useGoodCampTicket,
  onToggleGoodCampTicket,
  useSundayPot,
  onToggleSundayPot,
  cookingPowerUpLevel,
  onCookingPowerUpLevelChange,
  cookingPowerUpCount,
  onCookingPowerUpCountChange,
  cookingPowerUpMinusLevel,
  onCookingPowerUpMinusLevelChange,
  cookingPowerUpMinusCount,
  onCookingPowerUpMinusCountChange,
  effectivePotCapacity,
}: PotCapacitySectionProps) {
  const isBoosted = useGoodCampTicket || useSundayPot || cookingPowerUpCount > 0 || cookingPowerUpMinusCount > 0
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          現在のなべ容量
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* トグル2つを横並び（キャンプチケット左・日曜ボーナス右） */}
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="good-camp-ticket" className="cursor-pointer text-xs text-muted-foreground">
              キャンチケ1.5倍
            </Label>
            <Switch
              id="good-camp-ticket"
              checked={useGoodCampTicket}
              onCheckedChange={onToggleGoodCampTicket}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="sunday-pot" className="cursor-pointer text-xs text-muted-foreground">
              日曜2倍
            </Label>
            <Switch
              id="sunday-pot"
              checked={useSundayPot}
              onCheckedChange={onToggleSundayPot}
            />
          </div>
        </div>

        {/* なべ容量の表示。ブースト状態(チケット/日曜/料理パワーアップ)ONなら「現在値 → 適用後」の形式で表示 */}
        <div className="flex items-center justify-center gap-2">
          <span className={`font-bold text-primary ${isBoosted ? "text-2xl opacity-40" : "text-4xl"}`}>
            {value}
          </span>
          {isBoosted && (
            <>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <span className="text-4xl font-bold text-primary">{effectivePotCapacity}</span>
            </>
          )}
          <span className="text-muted-foreground ml-1">/ 81</span>
        </div>

        {/* スライダー操作 → onChange(新しい値) → page.tsx の potCapacity が更新される */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(Math.max(15, value - 3))}
            disabled={value <= 15}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <Slider
            value={[value]}
            onValueChange={([v]) => onChange(v)}
            min={15}
            max={81}
            step={3}
            className="flex-1"
          />
          <button
            onClick={() => onChange(Math.min(81, value + 3))}
            disabled={value >= 81}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>15</span>
          <span>81</span>
        </div>

        {/* 料理パワーアップ（メインスキル）によるなべ容量加算の入力 */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">料理パワーアップ Lv</Label>
            <Select
              value={String(cookingPowerUpLevel)}
              onValueChange={(v) => onCookingPowerUpLevelChange(Number(v))}
            >
              <SelectTrigger size="sm" className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COOKING_POWER_UP_LEVELS.map((level) => (
                  <SelectItem key={level} value={String(level)}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">発動回数</Label>
            <Select
              value={String(cookingPowerUpCount)}
              onValueChange={(v) => onCookingPowerUpCountChange(Number(v))}
            >
              <SelectTrigger size="sm" className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COOKING_POWER_UP_COUNTS.map((count) => (
                  <SelectItem key={count} value={String(count)}>
                    {count}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 料理パワーアップ・マイナス（メインスキル）によるなべ容量加算の入力 */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">マイナス Lv</Label>
            <Select
              value={String(cookingPowerUpMinusLevel)}
              onValueChange={(v) => onCookingPowerUpMinusLevelChange(Number(v))}
            >
              <SelectTrigger size="sm" className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COOKING_POWER_UP_LEVELS.map((level) => (
                  <SelectItem key={level} value={String(level)}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">発動回数</Label>
            <Select
              value={String(cookingPowerUpMinusCount)}
              onValueChange={(v) => onCookingPowerUpMinusCountChange(Number(v))}
            >
              <SelectTrigger size="sm" className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COOKING_POWER_UP_COUNTS.map((count) => (
                  <SelectItem key={count} value={String(count)}>
                    {count}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
