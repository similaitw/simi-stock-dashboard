export type StockCategory = "income" | "growth" | "stock";

export type ReportType = "pre_market" | "intraday" | "post_market";

export type MarketState = "偏強" | "正常" | "修正" | "轉弱";

export type StockSignal = "強勢" | "正常" | "修正" | "轉弱";

export type DataStatus = "sample" | "ok" | "error";

export type KLinePattern =
  | "長紅 K"
  | "長黑 K"
  | "長上影"
  | "長下影"
  | "十字線"
  | "十字長上影"
  | "十字長下影"
  | "紅K"
  | "黑K"
  | "平盤";

export interface StockConfig {
  symbol: string;
  name: string;
  category: StockCategory;
  role: string;
  rules: string[];
}

export interface DailyPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockPriceFetchResult {
  symbol: string;
  dataStatus: DataStatus;
  prices: DailyPrice[];
  source: "TWSE_STOCK_DAY";
  error?: string;
}

export interface ReportLeader {
  symbol: string;
  name: string;
  reason: string;
}

export interface StockReportItem {
  symbol: string;
  name: string;
  category: StockCategory;
  role: string;
  price: number | null;
  changePercent: number | null;
  ma20: number | null;
  ma60: number | null;
  ma120: number | null;
  volume: number | null;
  volumeMA20: number | null;
  kline: KLinePattern;
  score: number;
  signal: StockSignal;
  action: string;
  reason: string;
  rules: string[];
  dataStatus: DataStatus;
  preMarketNote?: string;
  intradayNote?: string;
  postMarketNote?: string;
  prices?: DailyPrice[];
}

export interface ReportJson {
  type: ReportType;
  date: string;
  time: string;
  timezone: "Asia/Taipei";
  marketState: MarketState;
  mainAction: string;
  leader: ReportLeader;
  risk: ReportLeader;
  summary: string;
  items: StockReportItem[];
  avoid: string[];
  dataStatus: DataStatus;
  generatedAt: string;
}
