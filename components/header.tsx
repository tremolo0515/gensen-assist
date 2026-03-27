"use client"

import { useState } from "react"
import { Moon, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// 注意事項の一覧
const NOTICES = [
  {
    title: "チェックした食材は充分に供給できる前提で計算します",
    body: "該当の食材を多く持ってくる食材とくいのポケモンの厳選が完了している場合にチェックしてください。個体値の違い等は本ツールでの計算に含まれていません。",
  },
  {
    title: "C食材（Lv.60以降にのみ解放される食材）は対象外です",
    body: "3枠目の食材は量が少ない場合が多いため、本ツールでは担当として扱いません。提案ポケモンはAAA/ABBの食材配列のみ表示されます。",
  },
  {
    title: "おいしいシッポは常に優先度「低」で表示します",
    body: "おいしいシッポを担当する食材とくいのポケモンは存在しないため参考情報としてヤドン系列を表示します。優先度は常に「低」です。",
  },
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="text-center">
      <div className="inline-flex items-center gap-2 mb-2">
        <Moon className="w-8 h-8 text-primary" />
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          ポケスリ厳選サポーター
        </h1>
        {/* 注意事項ボタン */}
        <button
          onClick={() => setOpen(true)}
          className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          aria-label="注意事項"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
      <p className="text-muted-foreground text-sm sm:text-base text-pretty max-w-md mx-auto">
        なべ容量と厳選済み食材を入力して、次に厳選するポケモンを確認しよう
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">ツールの前提・注意事項</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 text-sm">
            {NOTICES.map((notice) => (
              <div key={notice.title}>
                <p className="font-medium text-foreground">{notice.title}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{notice.body}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
