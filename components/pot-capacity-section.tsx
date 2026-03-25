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
  effectivePotCapacity: number  // チケット適用後のなべ容量（1.5倍・四捨五入済み）
}

export function PotCapacitySection({
  value,
  onChange,
  useGoodCampTicket,
  onToggleGoodCampTicket,
  effectivePotCapacity,
}: PotCapacitySectionProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-xl" role="img" aria-label="鍋">🍳</span>
          現在のなべ容量
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* いいキャンプチケットのトグル（スライダーより上） */}
        <div className="flex items-center justify-end gap-2">
          <Label htmlFor="good-camp-ticket" className="cursor-pointer text-xs text-muted-foreground">
            🎫 いいキャンプチケット
          </Label>
          <Switch
            id="good-camp-ticket"
            checked={useGoodCampTicket}
            onCheckedChange={onToggleGoodCampTicket}
          />
        </div>

        {/* なべ容量の表示。チケットON時は「現在値 → 適用後」の形式で表示 */}
        <div className="flex items-center justify-center gap-2">
          <span className={`font-bold text-primary ${useGoodCampTicket ? "text-2xl opacity-40" : "text-4xl"}`}>
            {value}
          </span>
          {useGoodCampTicket && (
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
