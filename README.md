# Simi Stock Dashboard

免費、可部署在 Vercel 的台股持股追蹤與投資紀律輔助看板。

本專案預計追蹤台股 ETF 與個股，透過日 K、20 / 60 / 120 日均線、成交量與固定規則產生盤前、盤中、盤後 JSON 報告。前端會讀取 `public/reports/*.json` 顯示最新看板內容。

> 本看板僅供個人追蹤與紀律輔助，不構成投資建議。

## 使用技術

- Next.js App Router
- TypeScript
- React
- CSS
- Vercel 免費部署
- GitHub Actions 免費排程

## 免費方案原則

本專案不使用付費資料庫、不使用付費 AI API，也不使用需要信用卡或計費的服務。報告資料會以 JSON 檔案形式存放在 repo 的 `public/reports/`。

## 自動排程

本專案使用 GitHub Actions 免費排程產生報告：

- 盤前：台灣時間 08:20
- 盤中：台灣時間 11:30
- 盤後：台灣時間 14:40

GitHub Actions cron 使用 UTC：

- `20 0 * * 1-5`
- `30 3 * * 1-5`
- `40 6 * * 1-5`

排程會執行：

```bash
npm ci
npm run generate-report -- <report_type>
```

報告會寫入：

- `public/reports/latest.json`
- `public/reports/pre-market.json`
- `public/reports/intraday.json`
- `public/reports/post-market.json`
- `public/reports/history/YYYY-MM-DD-type.json`

也可以在 GitHub Actions 手動執行 workflow，並選擇：

- `pre_market`
- `intraday`
- `post_market`

## 網頁手動更新

首頁提供手動更新按鈕，可從 Vercel API 觸發 GitHub Actions `workflow_dispatch`。

Vercel 需要設定環境變數：

- `GITHUB_ACTIONS_TOKEN`：GitHub Personal Access Token，需可觸發 Actions workflow。
- `MANUAL_TRIGGER_KEY`：自訂手動更新密碼，網頁按鈕會要求輸入。

可選環境變數：

- `GITHUB_REPOSITORY_NAME`：預設 `similaitw/simi-stock-dashboard`
- `GITHUB_WORKFLOW_REF`：預設 `master`

按下手動更新後，GitHub Actions 會產生報告、commit `public/reports/*.json`，Vercel 會因 GitHub commit 自動重新部署。

## 本地開發

```bash
npm install
npm run dev
```

開啟：

```txt
http://localhost:3000
```

## 建置

```bash
npm run build
```

## 目前進度

- 已建立 Next.js + TypeScript 專案骨架
- 已建立股票設定、指標計算、訊號規則
- 已建立 sample JSON 前端看板、K 線圖、盤前 / 盤中 / 盤後頁籤
- 已建立 TWSE 資料抓取、報告產生器與 GitHub Actions 排程

## 後續階段

後續會補上部署設定、README 完整化與最終驗收。
