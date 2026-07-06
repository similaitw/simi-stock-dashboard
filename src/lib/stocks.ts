import type { StockConfig } from "./reportTypes";

export const TRACKED_STOCKS: StockConfig[] = [
  {
    symbol: "0056",
    name: "元大高股息",
    category: "income",
    role: "長期高股息核心",
    rules: [
      "回檔買，折價買",
      "不追急漲",
      "跌破季線先停",
      "配息穩定性比短線漲跌重要"
    ]
  },
  {
    symbol: "00878",
    name: "國泰永續高股息",
    category: "income",
    role: "穩定高股息核心",
    rules: [
      "長期可持有",
      "適合修正時補",
      "不適合追高",
      "配息衰退且跌破季線時降低加碼速度"
    ]
  },
  {
    symbol: "00919",
    name: "群益台灣精選高息",
    category: "income",
    role: "高配息衝刺型",
    rules: [
      "看配息率",
      "看填息力",
      "看折溢價",
      "除息前後特別觀察"
    ]
  },
  {
    symbol: "009816",
    name: "復華台灣科技優息",
    category: "growth",
    role: "科技成長與定期定額",
    rules: [
      "可定期定額",
      "站上月線正常扣",
      "跌破月線不額外加碼",
      "跌破季線時新錢先轉核心 ETF"
    ]
  },
  {
    symbol: "00881",
    name: "國泰台灣 5G+",
    category: "growth",
    role: "半導體 / 科技 ETF",
    rules: [
      "主要看台積電",
      "台積電強才有加碼理由",
      "台積電跌破月線時不追",
      "台積電跌破季線時暫停額外加碼"
    ]
  },
  {
    symbol: "2330",
    name: "台積電",
    category: "growth",
    role: "科技核心個股",
    rules: [
      "可當長期核心",
      "回月線或季線才加碼",
      "外資連賣或跌破季線時減速",
      "影響 00881 與 009816 判讀"
    ]
  },
  {
    symbol: "2308",
    name: "台達電",
    category: "growth",
    role: "AI 電源 / 電力核心",
    rules: [
      "強勢股續抱",
      "不買長紅後追高",
      "回測月線不破才考慮",
      "高檔爆量長上影要小心"
    ]
  },
  {
    symbol: "1580",
    name: "新麥",
    category: "stock",
    role: "中小型景氣股，只能小部位",
    rules: [
      "只小部位",
      "不攤平",
      "不當核心",
      "跌破季線直接停手觀察",
      "營收轉弱時不加碼"
    ]
  }
];

export const STOCKS_BY_SYMBOL = Object.fromEntries(
  TRACKED_STOCKS.map((stock) => [stock.symbol, stock])
) as Record<string, StockConfig>;
