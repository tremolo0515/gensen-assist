"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowRight } from "lucide-react"

// page.tsx から受け取る props の型定義
interface PotCapacitySectionProps {
  value: number
  onChange: (value: number) => void
  useGoodCampTicket: boolean
  onToggleGoodCampTicket: () => void
  useSundayPot: boolean
  onToggleSundayPot: () => void
  effectivePotCapacity: number  // 全トグル適用後のなべ容量
}

export function PotCapacitySection({
  value,
  onChange,
  useGoodCampTicket,
  onToggleGoodCampTicket,
  useSundayPot,
  onToggleSundayPot,
  effectivePotCapacity,
}: PotCapacitySectionProps) {
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

        {/* なべ容量の表示。チケットON時は「現在値 → 適用後」の形式で表示 */}
        <div className="flex items-center justify-center gap-2">
          <span className={`font-bold text-primary ${(useGoodCampTicket || useSundayPot) ? "text-2xl opacity-40" : "text-4xl"}`}>
            {value}
          </span>
          {(useGoodCampTicket || useSundayPot) && (
            <>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <span className="text-4xl font-bold text-primary">{effectivePotCapacity}</span>
            </>
          )}
          <span className="text-muted-foreground ml-1">/ 81</span>
        </div>

        {/* スライダー操作 → onChange(新しい値) → page.tsx の potCapacity が更新される */}
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={15}
          max={81}
          step={3}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>15</span>
          <span>81</span>
        </div>
      </CardContent>
    </Card>
  )
}
