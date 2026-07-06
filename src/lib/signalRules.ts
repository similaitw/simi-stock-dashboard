import {
  calculateMovingAverages,
  classifyKLine,
  isHighVolume
} from "./indicators";
import type {
  DailyPrice,
  StockConfig,
  StockReportItem,
  StockSignal
} from "./reportTypes";

interface ScoreEvent {
  points: number;
  reason: string;
}

export function classifySignal(score: number): StockSignal {
  if (score >= 5) {
    return "強勢";
  }

  if (score >= 2) {
    return "正常";
  }

  if (score >= -1) {
    return "修正";
  }

  return "轉弱";
}

export function evaluateStockSignal(
  stock: StockConfig,
  prices: DailyPrice[]
): StockReportItem {
  const sortedPrices = [...prices].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sortedPrices.at(-1);

  if (!latest) {
    return createEmptyReportItem(stock, "缺少價格資料");
  }

  const previous = sortedPrices.at(-2);
  const averages = calculateMovingAverages(sortedPrices);
  const klineShape = classifyKLine(latest);
  const highVolume = isHighVolume(latest.volume, averages.volumeMA20);
  const changePercent = previous
    ? round(((latest.close - previous.close) / previous.close) * 100)
    : null;

  const events = collectScoreEvents({
    latest,
    previousPrices: sortedPrices.slice(0, -1),
    ma20: averages.ma20,
    ma60: averages.ma60,
    ma120: averages.ma120,
    kline: klineShape.pattern,
    highVolume,
    changePercent
  });
  const score = events.reduce((total, event) => total + event.points, 0);
  const signal = classifySignal(score);
  const reason = buildReason(events);

  return {
    symbol: stock.symbol,
    name: stock.name,
    category: stock.category,
    role: stock.role,
    price: latest.close,
    changePercent,
    ma20: averages.ma20,
    ma60: averages.ma60,
    ma120: averages.ma120,
    volume: latest.volume,
    volumeMA20: averages.volumeMA20,
    kline: klineShape.pattern,
    score,
    signal,
    action: chooseAction(stock, signal, events),
    reason,
    rules: stock.rules,
    dataStatus: "ok",
    preMarketNote: createPreMarketNote(stock, signal),
    intradayNote: createIntradayNote(signal, events),
    postMarketNote: createPostMarketNote(signal, reason),
    prices: sortedPrices
  };
}

export function evaluateStockSignals(
  stocksWithPrices: Array<{
    stock: StockConfig;
    prices: DailyPrice[];
  }>
): StockReportItem[] {
  return stocksWithPrices.map(({ stock, prices }) =>
    evaluateStockSignal(stock, prices)
  );
}

function collectScoreEvents({
  latest,
  previousPrices,
  ma20,
  ma60,
  ma120,
  kline,
  highVolume,
  changePercent
}: {
  latest: DailyPrice;
  previousPrices: DailyPrice[];
  ma20: number | null;
  ma60: number | null;
  ma120: number | null;
  kline: string;
  highVolume: boolean;
  changePercent: number | null;
}): ScoreEvent[] {
  const events: ScoreEvent[] = [];

  addAverageEvents(events, latest.close, ma20, ma60, ma120);

  if (kline === "長紅 K") {
    events.push({ points: 2, reason: "長紅 K" });
  }

  if (kline === "長下影" || kline === "十字長下影") {
    events.push({ points: 1, reason: "長下影" });
  }

  if (kline === "長黑 K") {
    events.push({ points: -2, reason: "長黑 K" });
  }

  if (kline === "長上影" || kline === "十字長上影") {
    events.push({ points: -1, reason: "長上影" });
  }

  if (highVolume && latest.close > latest.open) {
    events.push({ points: 1, reason: "放量收紅" });
  }

  if (highVolume && latest.close < latest.open) {
    events.push({ points: -1, reason: "放量收黑" });
  }

  addBreakoutEvents(events, latest, previousPrices);
  addChangePercentEvents(events, changePercent);

  return events;
}

function addAverageEvents(
  events: ScoreEvent[],
  close: number,
  ma20: number | null,
  ma60: number | null,
  ma120: number | null
) {
  if (ma20 !== null) {
    events.push(
      close >= ma20
        ? { points: 1, reason: "站上月線" }
        : { points: -1, reason: "跌破月線" }
    );
  }

  if (ma60 !== null) {
    events.push(
      close >= ma60
        ? { points: 1, reason: "站上季線" }
        : { points: -2, reason: "跌破季線" }
    );
  }

  if (ma120 !== null) {
    events.push(
      close >= ma120
        ? { points: 1, reason: "站上半年線" }
        : { points: -2, reason: "跌破半年線" }
    );
  }
}

function addBreakoutEvents(
  events: ScoreEvent[],
  latest: DailyPrice,
  previousPrices: DailyPrice[]
) {
  const recentPrices = previousPrices.slice(-20);

  if (recentPrices.length === 0) {
    return;
  }

  const previousHigh = Math.max(...recentPrices.map((price) => price.high));
  const previousLow = Math.min(...recentPrices.map((price) => price.low));

  if (latest.close > previousHigh) {
    events.push({ points: 1, reason: "突破前高" });
  }

  if (latest.close < previousLow) {
    events.push({ points: -1, reason: "跌破前低" });
  }
}

function addChangePercentEvents(
  events: ScoreEvent[],
  changePercent: number | null
) {
  if (changePercent === null) {
    return;
  }

  if (changePercent > 1.5) {
    events.push({ points: 1, reason: "今日漲幅 > 1.5%" });
  }

  if (changePercent < -1.5) {
    events.push({ points: -1, reason: "今日跌幅 < -1.5%" });
  }
}

function chooseAction(
  stock: StockConfig,
  signal: StockSignal,
  events: ScoreEvent[]
): string {
  const reasons = new Set(events.map((event) => event.reason));

  if (reasons.has("跌破季線") || reasons.has("跌破半年線")) {
    return stock.symbol === "1580" ? "停手觀察，不攤平" : "暫停額外加碼";
  }

  if (reasons.has("長紅 K") || reasons.has("長上影")) {
    return "續抱不追";
  }

  if (signal === "強勢") {
    return stock.category === "income" ? "可小額分批，避免追高" : "照計畫持有，不追高";
  }

  if (signal === "正常") {
    return stock.category === "growth" ? "照扣 / 觀察回測月線" : "照扣 / 小額分批";
  }

  if (signal === "修正") {
    return stock.category === "income" ? "等折價或支撐再補" : "等 10:00 後觀察";
  }

  return "暫停額外加碼";
}

function createPreMarketNote(stock: StockConfig, signal: StockSignal): string {
  if (stock.category === "income") {
    return signal === "轉弱" ? "跌破關鍵均線時先停手，等待折價與支撐。" : "高股息 ETF 仍需搭配折溢價觀察。";
  }

  if (stock.symbol === "1580") {
    return "衛星個股只小部位，不攤平，不當核心。";
  }

  return "科技標的需觀察台積電與台達電同步性，開高急拉不追。";
}

function createIntradayNote(signal: StockSignal, events: ScoreEvent[]): string {
  const reasons = new Set(events.map((event) => event.reason));

  if (reasons.has("跌破季線")) {
    return "盤中若持續跌破季線，停止額外加碼。";
  }

  if (signal === "強勢") {
    return "盤中偏強仍不追價，留意價漲量縮。";
  }

  return "觀察是否跌破昨收、月線或開盤價。";
}

function createPostMarketNote(signal: StockSignal, reason: string): string {
  if (signal === "轉弱") {
    return `趨勢轉弱，明日先觀察。原因：${reason}`;
  }

  if (signal === "強勢") {
    return `趨勢偏強，明日續抱不追。原因：${reason}`;
  }

  return `趨勢${signal}，明日依紀律執行。原因：${reason}`;
}

function createEmptyReportItem(
  stock: StockConfig,
  reason: string
): StockReportItem {
  return {
    symbol: stock.symbol,
    name: stock.name,
    category: stock.category,
    role: stock.role,
    price: null,
    changePercent: null,
    ma20: null,
    ma60: null,
    ma120: null,
    volume: null,
    volumeMA20: null,
    kline: "平盤",
    score: 0,
    signal: "修正",
    action: "資料不足，先觀察",
    reason,
    rules: stock.rules,
    dataStatus: "error"
  };
}

function buildReason(events: ScoreEvent[]): string {
  if (events.length === 0) {
    return "資料不足，暫無明確訊號";
  }

  return events.map((event) => event.reason).join("、");
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
