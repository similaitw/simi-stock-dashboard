# Simi Stock Dashboard｜Codex 完整開發需求書

## 0. 給 Codex 的任務摘要

請建立一個全新的 GitHub 專案，不要使用既有的 `auto-github-vercel` repo。

專案名稱：

```txt
simi-stock-dashboard
```

目標是建立一個免費、可部署在 Vercel 的台股持股追蹤看板，支援：

- 台股 ETF / 個股追蹤
- 日 K 線圖
- 20 / 60 / 120 日均線
- 盤前分析
- 盤中監控
- 盤後檢討
- 自動產生 JSON 報告
- GitHub Actions 免費排程
- Vercel 免費部署
- 手機可用

本專案不做下單、不串券商、不使用付費資料庫、不使用付費 AI API。

---

## 1. 專案目標

建立一個個人投資紀律輔助網站，主要功能是追蹤目前持有或觀察中的台股 ETF 與股票，根據 K 線、均線、量能與簡單規則產生訊號。

用途：

- 判斷今天是否適合加碼
- 判斷哪些標的偏強
- 判斷哪些標的轉弱
- 判斷高股息 ETF 是否可補
- 判斷科技 ETF 是否該減速
- 判斷個股是否只適合觀察
- 每天自動產生盤前、盤中、盤後報告
- 手機隨時打開 Vercel 網址查看

提醒：這不是投資建議系統，也不是自動交易系統。

每個主要頁面底部請顯示：

```txt
本看板僅供個人追蹤與紀律輔助，不構成投資建議。
```

---

## 2. GitHub / Vercel 要求

### 2.1 GitHub repo

請建立新的 repo：

```txt
similaitw/simi-stock-dashboard
```

請不要使用：

```txt
similaitw/auto-github-vercel
```

### 2.2 Vercel 專案

Vercel 專案名稱：

```txt
simi-stock-dashboard
```

預期網址：

```txt
https://simi-stock-dashboard.vercel.app
```

若此網址已被占用，請使用相近名稱，但 README 需清楚記錄實際網址。

---

## 3. 免費架構原則

本專案必須使用免費方案完成。

### 3.1 不使用

請不要使用：

- Vercel KV
- Supabase
- Upstash Redis
- Firebase
- Neon
- PlanetScale
- 任何付費資料庫
- 任何付費 AI API
- 任何需要信用卡或計費的服務
- Vercel 檔案系統作為長期儲存

### 3.2 使用

使用：

- GitHub repo 儲存程式碼
- GitHub Actions 免費排程產生報告
- `public/reports/*.json` 儲存報告
- Vercel 免費部署靜態網站
- 前端讀取 JSON 報告
- 規則引擎產生訊號，不依賴 AI API

### 3.3 自動化架構

```txt
GitHub Actions 排程
        ↓
抓取台股公開資料
        ↓
計算 K 線、均線、量能與訊號
        ↓
產生 JSON 報告
        ↓
寫入 public/reports/*.json
        ↓
commit 回 GitHub repo
        ↓
Vercel 自動重新部署
        ↓
網站顯示最新報告
```

---

## 4. 追蹤標的

### 4.1 高股息核心

| 代號 | 名稱 | 定位 |
|---|---|---|
| 0056 | 元大高股息 | 長期高股息核心 |
| 00878 | 國泰永續高股息 | 穩定高股息核心 |
| 00919 | 群益台灣精選高息 | 高配息衝刺型 |

### 4.2 科技成長

| 代號 | 名稱 | 定位 |
|---|---|---|
| 009816 | 復華台灣科技優息 / 成長型 ETF | 科技成長與定期定額 |
| 00881 | 國泰台灣 5G+ | 半導體 / 科技 ETF |
| 2330 | 台積電 | 科技核心個股 |
| 2308 | 台達電 | AI 電源 / 電力核心 |

### 4.3 衛星個股

| 代號 | 名稱 | 定位 |
|---|---|---|
| 1580 | 新麥 | 中小型景氣股，只能小部位 |

---

## 5. 技術選型

建議使用：

```txt
Next.js 14+ App Router
TypeScript
React
CSS Modules 或 Tailwind CSS
Canvas 或 SVG 畫 K 線
GitHub Actions
Vercel
```

也可使用 Vite + React，但若要讓 Vercel 部署與路由更穩，優先建議 Next.js。

---

## 6. 建議專案結構

```txt
simi-stock-dashboard/
├── README.md
├── package.json
├── tsconfig.json
├── next.config.js
├── vercel.json
├── public/
│   └── reports/
│       ├── latest.json
│       ├── pre-market.json
│       ├── intraday.json
│       ├── post-market.json
│       └── history/
│           └── .gitkeep
├── scripts/
│   ├── generate-report.ts
│   ├── fetch-tw-stocks.ts
│   └── write-report.ts
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── MarketSummary.tsx
│   │   ├── StockTable.tsx
│   │   ├── StockCard.tsx
│   │   ├── KLineChart.tsx
│   │   ├── PreMarketPanel.tsx
│   │   ├── IntradayPanel.tsx
│   │   ├── PostMarketPanel.tsx
│   │   ├── RulePanel.tsx
│   │   └── Disclaimer.tsx
│   ├── lib/
│   │   ├── stocks.ts
│   │   ├── indicators.ts
│   │   ├── signalRules.ts
│   │   ├── reportTypes.ts
│   │   ├── reportLoader.ts
│   │   └── twse.ts
│   └── styles/
│       └── dashboard.css
└── .github/
    └── workflows/
        └── stock-report.yml
```

---

## 7. NPM Scripts

`package.json` 需包含：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "generate-report": "tsx scripts/generate-report.ts",
    "generate-report:pre": "tsx scripts/generate-report.ts pre_market",
    "generate-report:intraday": "tsx scripts/generate-report.ts intraday",
    "generate-report:post": "tsx scripts/generate-report.ts post_market"
  }
}
```

需要安裝：

```txt
next
react
react-dom
typescript
tsx
eslint
```

避免使用太多大型圖表套件。K 線圖可自行用 Canvas 或 SVG 實作。

---

## 8. 頁面功能

### 8.1 首頁

首頁應包含以下區塊：

1. 頂部標題
2. 最後更新時間
3. 四張摘要卡
4. 頁籤切換
5. 總覽表格
6. 各檔 K 線
7. 盤前分析
8. 盤中監控
9. 盤後檢討
10. 規則說明
11. 免責提醒

### 8.2 頁籤

頁籤：

```txt
總覽
各檔 K 線
盤前分析
盤中監控
盤後檢討
規則設定
```

手機版可以用橫向滑動按鈕。

---

## 9. 首頁摘要卡

首頁上方顯示 4 張卡：

### 9.1 總體狀態

可能值：

| 狀態 | 意義 |
|---|---|
| 偏強 | 多數標的站上均線，K 線健康 |
| 正常 | 可按原本定期定額與分批規則執行 |
| 修正 | 不追價，核心 ETF 優先 |
| 轉弱 | 暫停額外加碼 |

### 9.2 今日主策略

可能值：

| 策略 | 意義 |
|---|---|
| 續抱不追 | 多數偏強，但不追高 |
| 照扣 / 分批 | 趨勢正常，可照原計畫 |
| 核心 ETF 優先 | 科技或個股轉弱，新錢偏保守 |
| 暫停額外加碼 | 多數轉弱，只保留原本定期定額或停手 |

### 9.3 最強標的

顯示分數最高標的：

```txt
2330 台積電
```

並顯示原因：

```txt
站月線、站季線、長紅 K、放量收紅
```

### 9.4 警戒標的

顯示分數最低標的：

```txt
1580 新麥
```

並顯示原因：

```txt
跌破月線、長黑 K、放量收黑
```

---

## 10. 總覽表格

欄位：

| 欄位 | 說明 |
|---|---|
| 標的 | 代號 + 名稱 |
| 定位 | 高股息、科技成長、個股 |
| 現價 | 最新價或最近收盤價 |
| 漲跌幅 | 今日漲跌幅 |
| K 線 | 今日或最近一根 K 線判讀 |
| 均線 | 20 / 60 / 120 日線 |
| 量能 | 是否放量 |
| 訊號 | 強勢、正常、修正、轉弱 |
| 動作 | 今日建議 |

手機版：

- 表格可橫向滑動，或
- 每檔改成卡片式顯示

---

## 11. K 線圖需求

每一檔都要有獨立 K 線圖。

### 11.1 圖表內容

K 線圖要顯示：

- 日 K 線
- 成交量
- 20 日均線：月線
- 60 日均線：季線
- 120 日均線：半年線

### 11.2 區間切換

使用者可切換：

```txt
60 日
90 日
120 日
```

### 11.3 台股顏色

請依台股習慣：

| 狀態 | 顏色 |
|---|---|
| 上漲 / 紅 K | 紅色 |
| 下跌 / 黑 K / 綠 K | 綠色 |
| 月線 | 藍色 |
| 季線 | 紫色 |
| 半年線 | 黃色 / 橘色 |

### 11.4 K 線判讀

需要判斷：

| K 線型態 | 判斷 |
|---|---|
| 長紅 K | 買盤強，但隔天開高不追 |
| 長黑 K | 賣壓重，暫停額外加碼 |
| 長上影 | 上方賣壓重 |
| 長下影 | 有承接 |
| 十字線 | 多空觀望 |
| 跌破月線 | 短線轉弱 |
| 跌破季線 | 加碼減速 |
| 跌破半年線 | 暫停額外加碼 |

---

## 12. 指標計算

### 12.1 均線

計算：

```txt
MA20 = 最近 20 個交易日收盤價平均
MA60 = 最近 60 個交易日收盤價平均
MA120 = 最近 120 個交易日收盤價平均
```

### 12.2 成交量均線

計算：

```txt
VMA20 = 最近 20 個交易日成交量平均
```

### 12.3 放量定義

```txt
今日量 > VMA20 * 1.5
```

### 12.4 K 線型態判斷

需要根據：

```txt
open
high
low
close
```

判斷實體、上影線、下影線比例。

參考邏輯：

```txt
range = high - low
body = abs(close - open)
upperShadow = high - max(open, close)
lowerShadow = min(open, close) - low
bodyRatio = body / range
upperRatio = upperShadow / range
lowerRatio = lowerShadow / range
```

建議：

| 型態 | 條件 |
|---|---|
| 長紅 K | close > open 且 bodyRatio > 0.6 |
| 長黑 K | close < open 且 bodyRatio > 0.6 |
| 長上影 | upperRatio > 0.45 且 bodyRatio < 0.35 |
| 長下影 | lowerRatio > 0.45 且 bodyRatio < 0.35 |
| 十字線 | bodyRatio < 0.15 |
| 十字長上影 | bodyRatio < 0.15 且 upperRatio > 0.45 |
| 十字長下影 | bodyRatio < 0.15 且 lowerRatio > 0.45 |

---

## 13. 訊號分數設計

每檔給一個 `score`。

### 13.1 加分

| 條件 | 分數 |
|---|---:|
| 站上月線 | +1 |
| 站上季線 | +1 |
| 站上半年線 | +1 |
| 長紅 K | +2 |
| 長下影 | +1 |
| 放量收紅 | +1 |
| 突破前高 | +1 |
| 今日漲幅 > 1.5% | +1 |

### 13.2 扣分

| 條件 | 分數 |
|---|---:|
| 跌破月線 | -1 |
| 跌破季線 | -2 |
| 跌破半年線 | -2 |
| 長黑 K | -2 |
| 長上影 | -1 |
| 放量收黑 | -1 |
| 跌破前低 | -1 |
| 今日跌幅 < -1.5% | -1 |

### 13.3 訊號分類

| 分數 | 訊號 |
|---:|---|
| >= 5 | 強勢 |
| 2 到 4 | 正常 |
| -1 到 1 | 修正 |
| <= -2 | 轉弱 |

---

## 14. 盤前分析

盤前時間：台灣時間 08:20 左右。

### 14.1 盤前要回答

每一檔都要輸出：

- 今天可不可以買
- 是否開高不追
- 是否要等 10:00 後
- 是否只適合觀察
- 高股息 ETF 是否要看折溢價
- 科技股是否需要看台積電與台達電同步性

### 14.2 高股息 ETF 盤前規則

適用：

```txt
0056
00878
00919
```

盤前重點：

- 是否接近除息
- 是否折價
- 是否守住月線 / 季線
- 是否填息力轉弱

動作：

| 狀態 | 動作 |
|---|---|
| 折價 + 守月線 | 可小額分批 |
| 開高急漲 | 不追 |
| 跌破季線 | 暫停加碼 |
| 除息後填息弱 | 觀察 |

### 14.3 科技 ETF / 科技股盤前規則

適用：

```txt
009816
00881
2330
2308
```

盤前重點：

- 台積電是否站上月線
- 台達電是否強勢但過熱
- 00881 是否跟台積電同步
- 009816 是否仍在月線上
- 美股科技是否大跌，免費版可先不串美股資料，先預留欄位

動作：

| 狀態 | 動作 |
|---|---|
| 台積電 + 台達電同步強 | 科技 ETF 可照扣 |
| 只有單一個股強 | 不追 |
| 跌破月線 | 等 10:00 後 |
| 跌破季線 | 新錢轉核心 ETF |

### 14.4 新麥盤前規則

適用：

```txt
1580
```

規則：

- 只小部位
- 不攤平
- 不當核心
- 跌破季線直接停手觀察

---

## 15. 盤中監控

盤中檢查時間：

```txt
11:30
```

免費版先做每日一次盤中報告即可。

若日後要增加，可加：

```txt
10:00
13:00
```

### 15.1 盤中要監控

每一檔要有觸發條件：

| 條件 | 處理 |
|---|---|
| 開高後跌破開盤價 | 不追 |
| 跌破昨收 | 觀察 |
| 跌破月線 | 暫停追價 |
| 跌破季線 | 停止額外加碼 |
| 價漲量縮 | 續抱，不追 |
| 價跌量增 | 警戒 |
| 長下影守季線 | 列入明日觀察 |
| 長上影爆量 | 隔日看是否跌破低點 |

---

## 16. 盤後檢討

盤後時間：台灣時間 14:40。

### 16.1 盤後每檔輸出

每檔要輸出：

- 今日 K 線型態
- 是否站上月線
- 是否守住季線
- 是否放量
- 趨勢結論
- 明日動作

### 16.2 盤後總結格式

```txt
盤後報告：

今日總體狀態：
偏強 / 正常 / 修正 / 轉弱

最強標的：
代號 + 名稱 + 原因

警戒標的：
代號 + 名稱 + 原因

明日加碼順序：
1.
2.
3.

明日避免：
1.
2.
```

---

## 17. 各標的操作規則

### 17.1 0056

定位：高股息核心。

規則：

- 回檔買
- 折價買
- 不追急漲
- 跌破季線先停
- 配息穩定性比短線漲跌重要

### 17.2 00878

定位：穩定高股息核心。

規則：

- 長期可持有
- 適合修正時補
- 不適合追高
- 若配息衰退與跌破季線同時出現，要降低加碼速度

### 17.3 00919

定位：高配息衝刺。

規則：

- 看配息率
- 看填息力
- 看折溢價
- 配息高但不能盲目追
- 除息前後特別觀察

### 17.4 009816

定位：科技成長 ETF。

規則：

- 可定期定額
- 站上月線正常扣
- 跌破月線不額外加碼
- 跌破季線，新錢先轉核心 ETF
- 若科技股大跌 10%～20%，可分批但不要一次買滿

### 17.5 00881

定位：半導體 / 科技 ETF。

規則：

- 主要看台積電
- 台積電強，00881 才有加碼理由
- 台積電跌破月線，00881 不追
- 台積電跌破季線，00881 暫停額外加碼

### 17.6 2330 台積電

定位：科技核心個股。

規則：

- 可當長期核心
- 回月線 / 季線才加碼
- 外資連賣或跌破季線時減速
- 台積電會影響 00881 / 009816 判讀

### 17.7 2308 台達電

定位：AI 電源 / 電力核心。

規則：

- 強勢股續抱
- 不買長紅後追高
- 回測月線不破才考慮
- 高檔爆量長上影要小心

### 17.8 1580 新麥

定位：衛星個股。

規則：

- 小部位
- 不攤平
- 不當核心
- 跌破季線直接停手觀察
- 營收轉弱時不加碼

---

## 18. 報告 JSON 設計

報告檔案放在：

```txt
public/reports/latest.json
public/reports/pre-market.json
public/reports/intraday.json
public/reports/post-market.json
```

可另外保留歷史：

```txt
public/reports/history/2026-07-07-pre-market.json
public/reports/history/2026-07-07-intraday.json
public/reports/history/2026-07-07-post-market.json
```

### 18.1 JSON 格式

```json
{
  "type": "post_market",
  "date": "2026-07-06",
  "time": "14:40",
  "timezone": "Asia/Taipei",
  "marketState": "正常",
  "mainAction": "照扣 / 小額分批",
  "leader": {
    "symbol": "2330",
    "name": "台積電",
    "reason": "站上月線、站上季線、長紅 K"
  },
  "risk": {
    "symbol": "1580",
    "name": "新麥",
    "reason": "跌破月線、長黑 K、放量收黑"
  },
  "summary": "科技股維持正常，高股息 ETF 等折價或回支撐。",
  "items": [
    {
      "symbol": "0056",
      "name": "元大高股息",
      "category": "income",
      "role": "高股息核心",
      "price": 38.5,
      "changePercent": 0.2,
      "ma20": 38.1,
      "ma60": 37.5,
      "ma120": 36.8,
      "volume": 12000000,
      "volumeMA20": 10000000,
      "kline": "紅K",
      "score": 3,
      "signal": "正常",
      "action": "可小額分批",
      "reason": "站上月線與季線",
      "preMarketNote": "守月線，若未溢價可觀察。",
      "intradayNote": "若開高急漲不追。",
      "postMarketNote": "趨勢正常，明日照計畫。"
    }
  ],
  "avoid": [
    "開高急漲不追",
    "跌破季線不攤平"
  ],
  "generatedAt": "2026-07-06T06:40:00.000Z"
}
```

---

## 19. GitHub Actions 免費排程

建立：

```txt
.github/workflows/stock-report.yml
```

內容參考：

```yaml
name: Generate Stock Reports

on:
  schedule:
    - cron: "20 0 * * 1-5"   # 台灣時間 08:20，週一到週五盤前
    - cron: "30 3 * * 1-5"   # 台灣時間 11:30，週一到週五盤中
    - cron: "40 6 * * 1-5"   # 台灣時間 14:40，週一到週五盤後
  workflow_dispatch:
    inputs:
      report_type:
        description: "Report type"
        required: false
        default: "post_market"
        type: choice
        options:
          - pre_market
          - intraday
          - post_market

permissions:
  contents: write

jobs:
  report:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          persist-credentials: true

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install
        run: npm ci

      - name: Determine report type
        id: report_type
        run: |
          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            echo "type=${{ github.event.inputs.report_type }}" >> $GITHUB_OUTPUT
          else
            HOUR=$(date -u +%H)
            MIN=$(date -u +%M)
            if [ "$HOUR:$MIN" = "00:20" ]; then
              echo "type=pre_market" >> $GITHUB_OUTPUT
            elif [ "$HOUR:$MIN" = "03:30" ]; then
              echo "type=intraday" >> $GITHUB_OUTPUT
            else
              echo "type=post_market" >> $GITHUB_OUTPUT
            fi
          fi

      - name: Generate report
        run: npm run generate-report -- ${{ steps.report_type.outputs.type }}

      - name: Commit report files
        run: |
          git config user.name "simi-stock-bot"
          git config user.email "simi-stock-bot@users.noreply.github.com"
          git add public/reports/*.json public/reports/history/*.json || true
          git commit -m "Update stock report: ${{ steps.report_type.outputs.type }}" || echo "No changes"
          git push
```

注意：

GitHub Actions 排程不保證準時，可能延遲數分鐘。這是可接受的。

---

## 20. 報告產生邏輯

`scripts/generate-report.ts` 應支援：

```bash
npm run generate-report -- pre_market
npm run generate-report -- intraday
npm run generate-report -- post_market
```

流程：

```txt
1. 讀取追蹤標的設定
2. 抓取每檔最近至少 160 個交易日資料
3. 計算 MA20 / MA60 / MA120 / VMA20
4. 判斷 K 線型態
5. 計算分數
6. 產生每檔 signal / action / reason
7. 找出 leader / risk
8. 產生 marketState / mainAction / summary
9. 寫入 public/reports/{type}.json
10. 同步寫入 public/reports/latest.json
11. 可選擇寫入 public/reports/history/{date}-{type}.json
```

---

## 21. 資料來源規劃

### 21.1 優先資料來源

使用台灣證交所公開資料。

日成交資訊：

```txt
https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=YYYYMMDD&stockNo=2330
```

注意：

- ETF 與上市股票通常可用 TWSE
- 若某檔資料抓不到，要有錯誤處理
- 不要讓整份報告因單一標的失敗而中斷
- 失敗標的應在 JSON 中標記 `dataStatus: "error"`

### 21.2 資料抓取時間

為了計算 120 日均線，至少抓最近 8 個月資料。

建議抓最近 8～10 個月的月資料，再合併、排序、去重。

### 21.3 API 限制與錯誤處理

請加入：

- retry 1～2 次
- timeout
- user-agent
- 若無資料，使用最近已有 JSON 的資料，不要產生空白頁
- 在 UI 顯示資料更新失敗提示

---

## 22. 前端資料讀取

前端優先讀：

```txt
/reports/latest.json
```

也可提供切換：

```txt
/reports/pre-market.json
/reports/intraday.json
/reports/post-market.json
```

若讀取失敗：

- 顯示「目前無報告資料」
- 不要讓整頁崩潰

---

## 23. UI / UX 要求

### 23.1 視覺風格

- 深色儀表板
- 手機優先
- 卡片式設計
- 台股紅漲綠跌
- 黃色代表警戒
- 藍色代表正常
- 文字要清楚，不要太小

### 23.2 手機版優先顯示

手機首頁優先顯示：

1. 總體狀態
2. 今日主策略
3. 最強標的
4. 警戒標的
5. 每檔訊號卡
6. 每檔 K 線

### 23.3 桌面版

桌面版可以表格 + K 線卡片並列。

### 23.4 不要過度動畫

可以有 hover，但不要加複雜動畫。

---

## 24. 報告文字風格

報告文字請使用繁體中文、台灣用語。

不要使用簡體字。

語氣要像投資紀律提醒，不要像券商報告。

範例：

```txt
今天科技組合偏正常，但台達電若開高急拉不追。009816 可維持定期定額，不做額外加碼。高股息 ETF 等折價或回月線附近再補。
```

---

## 25. 規則設定頁

規則頁要清楚列出：

- 追蹤標的
- 標的定位
- 訊號分數規則
- K 線判斷規則
- 各標的操作規則
- 免費版自動化限制

---

## 26. README 要求

README 必須包含：

1. 專案簡介
2. 使用技術
3. 追蹤標的
4. 訊號規則
5. K 線規則
6. GitHub Actions 排程說明
7. Vercel 部署方式
8. 本地開發方式
9. 報告 JSON 格式
10. 免責聲明

### README 範例段落

```md
## 自動排程

本專案使用 GitHub Actions 免費排程產生報告：

- 盤前：台灣時間 08:20
- 盤中：台灣時間 11:30
- 盤後：台灣時間 14:40

GitHub Actions cron 使用 UTC：

- 20 0 * * 1-5
- 30 3 * * 1-5
- 40 6 * * 1-5

報告會寫入：

- public/reports/latest.json
- public/reports/pre-market.json
- public/reports/intraday.json
- public/reports/post-market.json
```

---

## 27. 初始靜態資料

第一次部署時，如果尚未產生報告，請提供範例 JSON，避免頁面空白。

建立：

```txt
public/reports/latest.json
public/reports/pre-market.json
public/reports/intraday.json
public/reports/post-market.json
```

內容可使用模擬資料，但需標示：

```json
"dataStatus": "sample"
```

GitHub Actions 第一次成功執行後會覆蓋。

---

## 28. 驗收標準

完成後需符合：

- 建立新 repo：`simi-stock-dashboard`
- 沒有使用 `auto-github-vercel`
- 可以本地 `npm run dev`
- 可以 `npm run build`
- 可以部署到 Vercel
- 手機可以正常瀏覽
- 每檔都有 K 線圖
- 每檔都有 20 / 60 / 120 日均線
- 每檔都有盤前、盤中、盤後判斷
- 總覽頁有最強標的與警戒標的
- GitHub Actions 可手動執行
- GitHub Actions 可定時產生 JSON
- Vercel 可顯示最新 JSON 報告
- README 完整
- 頁面有免責聲明
- 不使用付費資料庫
- 不使用付費 AI API

---

## 29. 建議開發順序

請 Codex 依序完成：

```txt
1. 建立 Next.js 專案
2. 建立追蹤標的設定 stocks.ts
3. 建立指標計算 indicators.ts
4. 建立訊號規則 signalRules.ts
5. 建立範例 reports JSON
6. 建立首頁 UI
7. 建立 KLineChart
8. 建立盤前 / 盤中 / 盤後 panel
9. 建立 generate-report.ts
10. 建立 fetch-tw-stocks.ts
11. 建立 GitHub Actions workflow
12. 測試 npm run generate-report
13. 測試 npm run build
14. commit 到 GitHub
15. 部署到 Vercel
16. README 補完整
```

---

## 30. 後續可擴充功能

先不要做，但請保留擴充空間：

- 個人持股成本
- 損益試算
- 配息紀錄
- 除息日提醒
- ETF 折溢價
- Google Sheets 匯出
- LINE Notify 或 Telegram 通知
- 每日歷史報告查詢
- 美股 QQQM / VOO / NVDA 追蹤
- 美債 10 年期殖利率
- AI 摘要，但目前先不用付費 API

---

## 31. 重要提醒

請務必遵守：

```txt
不要使用 auto-github-vercel repo。
請建立新 repo：simi-stock-dashboard。
請使用免費方案。
不要使用付費資料庫。
不要使用付費 AI API。
不要做自動下單。
```

本看板只做個人紀律輔助。
