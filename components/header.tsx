import { Moon } from "lucide-react"

// タイトルとサブテキストのみ。props なし・状態なしのシンプルな表示専用部品
export function Header() {
  return (
    <header className="text-center">
      <div className="inline-flex items-center gap-2 mb-2">
        <Moon className="w-8 h-8 text-primary" />
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          ポケスリ厳選サポーター
        </h1>
      </div>
      <p className="text-muted-foreground text-sm sm:text-base text-pretty max-w-md mx-auto">
        鍋容量と厳選済み食材を入力して、次に捕まえるべきポケモンを確認しよう
      </p>
    </header>
  )
}
