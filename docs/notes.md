# 開發筆記

## 2026-07-07

### 第 1 階段：Next.js + TypeScript 專案骨架

已建立最小可執行的 Next.js App Router 專案結構，包含：

- `package.json`
- `tsconfig.json`
- `next.config.js`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `README.md`

本階段刻意未實作：

- 股票資料抓取
- GitHub Actions
- 報告產生腳本
- K 線圖
- 訊號規則引擎

### 限制

- 專案名稱：`simi-stock-dashboard`
- 不使用 `auto-github-vercel`
- 使用免費方案
- 不使用付費資料庫
- 不使用付費 AI API

### 第 2 階段：股票設定與型別

已建立追蹤標的設定與報告資料型別：

- `src/lib/stocks.ts`
- `src/lib/reportTypes.ts`

追蹤標的：

- 0056 元大高股息
- 00878 國泰永續高股息
- 00919 群益台灣精選高息
- 009816 復華台灣科技優息
- 00881 國泰台灣 5G+
- 2330 台積電
- 2308 台達電
- 1580 新麥

本階段未抓取外部資料，僅建立靜態設定與 TypeScript 型別。

### 第 3 階段：指標與訊號規則

已建立純 TypeScript 規則層：

- `src/lib/indicators.ts`
- `src/lib/signalRules.ts`
- `src/lib/ruleTestData.ts`

已實作：

- MA20 / MA60 / MA120
- VMA20
- K 線型態判斷
- 訊號分數
- 強勢 / 正常 / 修正 / 轉弱分類
- 每檔 action / reason
- 本地 mock 價格資料與 smoke test 函式

本階段未建立 UI，也未抓取外部 API。

### 第 4 階段：Sample JSON 前端看板

已建立 sample JSON 與前端看板：

- `public/reports/latest.json`
- `src/components/MarketSummary.tsx`
- `src/components/StockTable.tsx`
- `src/components/StockCard.tsx`
- `src/components/Disclaimer.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`

首頁會以 client-side fetch 讀取 `/reports/latest.json`，顯示：

- 總體狀態
- 今日主策略
- 最強標的
- 警戒標的
- 每檔訊號

UI 採深色儀表板與手機優先設計。本階段仍未抓取外部 API。

### 第 5 階段：K 線圖

已建立 SVG K 線圖元件：

- `src/components/KLineChart.tsx`

已支援：

- 日 K 線
- 成交量
- MA20 / MA60 / MA120
- 台股紅漲、綠跌
- 60 日 / 90 日 / 120 日切換
- 每檔 `StockCard` 內顯示 K 線圖

目前 sample JSON 若尚未提供 `prices`，圖表會依該檔現價與均線產生穩定 sample 走勢；後續真實報告補上 `prices` 後會直接使用真實資料。

### 第 6 階段：盤前、盤中、盤後分析頁

已建立頁籤式首頁與分析 panel：

- `src/components/PreMarketPanel.tsx`
- `src/components/IntradayPanel.tsx`
- `src/components/PostMarketPanel.tsx`
- `src/components/RulePanel.tsx`
- `public/reports/pre-market.json`
- `public/reports/intraday.json`
- `public/reports/post-market.json`

首頁頁籤：

- 總覽
- 各檔 K 線
- 盤前分析
- 盤中監控
- 盤後檢討
- 規則設定

盤前、盤中、盤後會優先讀取對應 report JSON，若缺檔則 fallback 到 `latest.json`。手機版頁籤可橫向滑動，panel 會改為單欄顯示。

### 第 7 階段：台股資料抓取

已建立 TWSE 資料抓取層與手動測試腳本：

- `src/lib/twse.ts`
- `scripts/fetch-tw-stocks.ts`

已支援：

- TWSE `STOCK_DAY` 公開資料
- 每檔抓最近 10 個月資料
- 合併、排序、去重
- 單一標的錯誤回傳 `dataStatus: "error"`，不讓整體流程失敗
- retry 2 次
- timeout 10 秒
- `npm run fetch-tw-stocks` 手動測試

### 第 8 階段：報告產生器

已建立報告產生器：

- `scripts/generate-report.ts`

已支援：

- `pre_market`
- `intraday`
- `post_market`
- 產生 `public/reports/latest.json`
- 產生對應報告檔 `pre-market.json` / `intraday.json` / `post-market.json`
- 產生 `public/reports/history/YYYY-MM-DD-type.json`
- 單檔資料錯誤保留在報告 item，並標記 `dataStatus: "error"`

手動執行：

```bash
npm run generate-report -- post_market
```

### 第 9 階段：GitHub Actions 免費排程

已建立 GitHub Actions workflow：

- `.github/workflows/stock-report.yml`

排程：

- `20 0 * * 1-5`
- `30 3 * * 1-5`
- `40 6 * * 1-5`

支援 `workflow_dispatch` 手動選擇：

- `pre_market`
- `intraday`
- `post_market`

流程會執行 `npm ci`、`npm run generate-report -- report_type`，並自動 commit `public/reports/*.json` 與 `public/reports/history/*.json`。
