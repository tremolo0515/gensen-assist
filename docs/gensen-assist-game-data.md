---
created: "2026-03-20"
status: draft
source: https://wikiwiki.jp/poke_sleep/
tags: [ポケスリ, ゲームデータ, 食材, ポケモン]
---

# ポケスリ ゲームデータ集

## wikiのURL構造

ベース: `https://wikiwiki.jp/poke_sleep/`

| データ | URL |
|--------|-----|
| 食材一覧 | `https://wikiwiki.jp/poke_sleep/食材/食材の一覧` |
| 食材個別ページ | `https://wikiwiki.jp/poke_sleep/食材/{食材名}` ← 担当ポケモン一覧（枠情報あり）|
| レシピ一覧 | `https://wikiwiki.jp/poke_sleep/料理/レシピの一覧` |
| ポケモン個別ページ | `https://wikiwiki.jp/poke_sleep/{ポケモン名}` |

### 食材別URL一覧（全19種）

| 食材名 | URL |
|--------|-----|
| あまいミツ | https://wikiwiki.jp/poke_sleep/食材/あまいミツ |
| あんみんトマト | https://wikiwiki.jp/poke_sleep/食材/あんみんトマト |
| ほっこりポテト | https://wikiwiki.jp/poke_sleep/食材/ほっこりポテト |
| あったかジンジャー | https://wikiwiki.jp/poke_sleep/食材/あったかジンジャー |
| リラックスカカオ | https://wikiwiki.jp/poke_sleep/食材/リラックスカカオ |
| げきからハーブ | https://wikiwiki.jp/poke_sleep/食材/げきからハーブ |
| ピュアなオイル | https://wikiwiki.jp/poke_sleep/食材/ピュアなオイル |
| マメミート | https://wikiwiki.jp/poke_sleep/食材/マメミート |
| モーモーミルク | https://wikiwiki.jp/poke_sleep/食材/モーモーミルク |
| とくせんエッグ | https://wikiwiki.jp/poke_sleep/食材/とくせんエッグ |
| とくせんリンゴ | https://wikiwiki.jp/poke_sleep/食材/とくせんリンゴ |
| あじわいキノコ | https://wikiwiki.jp/poke_sleep/食材/あじわいキノコ |
| ふといながねぎ | https://wikiwiki.jp/poke_sleep/食材/ふといながねぎ |
| おいしいシッポ | https://wikiwiki.jp/poke_sleep/食材/おいしいシッポ |
| ワカクサ大豆 | https://wikiwiki.jp/poke_sleep/食材/ワカクサ大豆 |
| ワカクサコーン | https://wikiwiki.jp/poke_sleep/食材/ワカクサコーン |
| めざましコーヒー | https://wikiwiki.jp/poke_sleep/食材/めざましコーヒー |
| ずっしりカボチャ | https://wikiwiki.jp/poke_sleep/食材/ずっしりカボチャ |
| つやつやアボカド | https://wikiwiki.jp/poke_sleep/食材/つやつやアボカド |

### wikiの取得方法
- **WebFetch**で直接取得可能（ブロックなし）
- 食材個別ページ: そのページにA/B/C枠ごとの担当ポケモン一覧が掲載されている
- レシピ一覧: 料理名・必要食材・必要数（鍋容量）・エナジーが揃っている

---

## 食材×ポケモン対応表

枠番号は食材候補A/B/Cに対応する。

| 枠 | 食材候補 | 解放Lv | 抽選確率 | MVPでの扱い |
|----|---------|--------|---------|------------|
| 1枠 | 食材A | Lv.1 | 固定（必ず持ってくる） | ✅ 担当とみなす |
| 2枠 | 食材B | Lv.30 | 67%がB、33%がA | ✅ 担当とみなす |
| 3枠 | 食材C | Lv.60 | 確率低・量少 | ❌ 担当としない |

**MVPルール**: チェック済み食材の「無限供給」はそのポケモンの1枠（A）または2枠（B）の場合のみ適用。3枠（C）のみのポケモンはその食材の担当としない。

---

　

## 備考

- 枠番号が小さいほど専門性が高く、1日の持参量が多い
- MVPでは枠の違いは考慮しない（チェック済み = 無限供給とみなす）
- 「各種」はハロウィン・ホリデー等の季節バリエーションを含む

## レア食材メモ

| 食材 | 備考 |
|------|------|
| おいしいシッポ | 1枠担当なし。ヤドン系が2枠（B）のみ。超レア |
| ずっしりカボチャ | バケッチャ/パンプジン系中心。ハロウィンイベント色が強い |
| つやつやアボカド | ナックラー系・イシズマイ系のみ。担当ポケモン少なめ |
