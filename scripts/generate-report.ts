import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { evaluateStockSignal } from "../src/lib/signalRules";
import { TRACKED_STOCKS } from "../src/lib/stocks";
import { fetchManyTwseDailyPrices } from "../src/lib/twse";
import type {
  MarketState,
  ReportJson,
  ReportLeader,
  ReportType,
  StockReportItem
} from "../src/lib/reportTypes";

const reportType = parseReportType(process.argv[2] ?? "post_market");
const reportsDir = path.join(process.cwd(), "public", "reports");
const historyDir = path.join(reportsDir, "history");

async function main() {
  console.log(`Generating ${reportType} report...`);

  const fetchResults = await fetchManyTwseDailyPrices(
    TRACKED_STOCKS.map((stock) => stock.symbol),
    {
      months: 10,
      retries: 2,
      timeoutMs: 10000
    }
  );
  const fetchResultBySymbol = new Map(
    fetchResults.map((result) => [result.symbol, result])
  );
  const items = TRACKED_STOCKS.map((stock) => {
    const result = fetchResultBySymbol.get(stock.symbol);
    const item = evaluateStockSignal(stock, result?.prices ?? []);

    if (result?.dataStatus === "error") {
      return {
        ...item,
        dataStatus: "error" as const,
        reason: result.error ?? item.reason
      };
    }

    return item;
  });
  const now = new Date();
  const reportDate = getTaipeiDate(now);
  const report = createReport(reportType, items, reportDate, now);

  await writeReportFiles(report);
  printSummary(report);
}

function createReport(
  type: ReportType,
  items: StockReportItem[],
  reportDate: string,
  now: Date
): ReportJson {
  const marketState = deriveMarketState(items);
  const mainAction = deriveMainAction(marketState, items);
  const leader = findLeader(items);
  const risk = findRisk(items);

  return {
    type,
    date: reportDate,
    time: getReportTime(type),
    timezone: "Asia/Taipei",
    marketState,
    mainAction,
    leader,
    risk,
    summary: createSummary(type, marketState, leader, risk),
    items,
    avoid: ["開高急漲不追", "跌破季線不攤平"],
    dataStatus: items.some((item) => item.dataStatus === "ok") ? "ok" : "error",
    generatedAt: now.toISOString()
  };
}

async function writeReportFiles(report: ReportJson) {
  await mkdir(reportsDir, { recursive: true });
  await mkdir(historyDir, { recursive: true });

  const reportFile = getReportFileName(report.type);
  const content = `${JSON.stringify(report, null, 2)}\n`;

  await Promise.all([
    writeFile(path.join(reportsDir, reportFile), content, "utf8"),
    writeFile(path.join(reportsDir, "latest.json"), content, "utf8"),
    writeFile(
      path.join(historyDir, `${report.date}-${report.type}.json`),
      content,
      "utf8"
    )
  ]);
}

function deriveMarketState(items: StockReportItem[]): MarketState {
  const okItems = items.filter((item) => item.dataStatus === "ok");

  if (okItems.length === 0) {
    return "修正";
  }

  const strongCount = okItems.filter((item) => item.signal === "強勢").length;
  const weakCount = okItems.filter((item) => item.signal === "轉弱").length;
  const correctionCount = okItems.filter((item) => item.signal === "修正").length;

  if (weakCount >= Math.ceil(okItems.length / 2)) {
    return "轉弱";
  }

  if (weakCount + correctionCount >= Math.ceil(okItems.length / 2)) {
    return "修正";
  }

  if (strongCount >= Math.ceil(okItems.length / 2)) {
    return "偏強";
  }

  return "正常";
}

function deriveMainAction(
  marketState: MarketState,
  items: StockReportItem[]
): string {
  const hasWeakGrowth = items.some(
    (item) => item.category === "growth" && item.signal === "轉弱"
  );

  if (marketState === "轉弱") {
    return "暫停額外加碼";
  }

  if (marketState === "修正" || hasWeakGrowth) {
    return "核心 ETF 優先";
  }

  if (marketState === "偏強") {
    return "續抱不追";
  }

  return "照扣 / 小額分批";
}

function findLeader(items: StockReportItem[]): ReportLeader {
  const leader = [...items].sort((a, b) => b.score - a.score)[0];

  if (!leader) {
    return {
      symbol: "-",
      name: "無資料",
      reason: "資料不足"
    };
  }

  return {
    symbol: leader.symbol,
    name: leader.name,
    reason: leader.reason
  };
}

function findRisk(items: StockReportItem[]): ReportLeader {
  const risk = [...items].sort((a, b) => a.score - b.score)[0];

  if (!risk) {
    return {
      symbol: "-",
      name: "無資料",
      reason: "資料不足"
    };
  }

  return {
    symbol: risk.symbol,
    name: risk.name,
    reason: risk.reason
  };
}

function createSummary(
  type: ReportType,
  marketState: MarketState,
  leader: ReportLeader,
  risk: ReportLeader
): string {
  if (type === "pre_market") {
    return `盤前整體狀態為${marketState}，${leader.symbol} ${leader.name}相對偏強，${risk.symbol} ${risk.name}列為警戒。開高急漲不追，依原定紀律分批。`;
  }

  if (type === "intraday") {
    return `盤中整體狀態為${marketState}，留意是否跌破開盤價、昨收、月線或季線。偏強標的續抱，不追價。`;
  }

  return `盤後整體狀態為${marketState}，最強標的是${leader.symbol} ${leader.name}，警戒標的是${risk.symbol} ${risk.name}。明日依訊號紀律執行。`;
}

function getReportFileName(type: ReportType): string {
  if (type === "pre_market") {
    return "pre-market.json";
  }

  if (type === "intraday") {
    return "intraday.json";
  }

  return "post-market.json";
}

function getReportTime(type: ReportType): string {
  if (type === "pre_market") {
    return "08:20";
  }

  if (type === "intraday") {
    return "11:30";
  }

  return "14:40";
}

function getTaipeiDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function parseReportType(value: string): ReportType {
  if (
    value === "pre_market" ||
    value === "intraday" ||
    value === "post_market"
  ) {
    return value;
  }

  throw new Error(
    `Invalid report type "${value}". Use pre_market, intraday, or post_market.`
  );
}

function printSummary(report: ReportJson) {
  console.log(
    `Wrote ${report.type} report: ${report.date} ${report.time} ${report.timezone}`
  );
  console.log(`Market state: ${report.marketState}`);
  console.log(`Main action: ${report.mainAction}`);
  console.log(`Items: ${report.items.length}`);

  const errors = report.items.filter((item) => item.dataStatus === "error");

  if (errors.length > 0) {
    console.warn(
      `Items with dataStatus=error: ${errors
        .map((item) => item.symbol)
        .join(", ")}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
