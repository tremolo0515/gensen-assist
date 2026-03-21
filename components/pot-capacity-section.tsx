"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

interface PotCapacitySectionProps {
  value: number
  onChange: (value: number) => void
}

export function PotCapacitySection({ value, onChange }: PotCapacitySectionProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-xl" role="img" aria-label="鍋">🍳</span>
          現在の鍋容量
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="text-center">
          <span className="text-4xl font-bold text-primary">{value}</span>
          <span className="text-muted-foreground ml-1">/ 81</span>
        </div>
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={15}
          max={81}
          step={1}
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
