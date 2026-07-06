import type { DailyPrice, StockPriceFetchResult } from "./reportTypes";

const twseStockDayUrl = "https://www.twse.com.tw/exchangeReport/STOCK_DAY";
const defaultTimeoutMs = 10000;
const defaultRetryCount = 2;
const userAgent = "simi-stock-dashboard/0.1 (+https://simi-stock-dashboard.vercel.app)";

interface TwseStockDayResponse {
  stat?: string;
  data?: string[][];
  fields?: string[];
  date?: string;
  title?: string;
}

interface FetchOptions {
  months?: number;
  timeoutMs?: number;
  retries?: number;
  today?: Date;
}

export async function fetchRecentTwseDailyPrices(
  symbol: string,
  options: FetchOptions = {}
): Promise<StockPriceFetchResult> {
  const months = options.months ?? 10;
  const monthStarts = getRecentMonthStarts(options.today ?? new Date(), months);

  try {
    const monthlyResults = await Promise.allSettled(
      monthStarts.map((date) =>
        fetchTwseStockMonth(symbol, formatTwseQueryDate(date), {
          retries: options.retries ?? defaultRetryCount,
          timeoutMs: options.timeoutMs ?? defaultTimeoutMs
        })
      )
    );
    const prices = monthlyResults.flatMap((result) =>
      result.status === "fulfilled" ? result.value : []
    );
    const normalizedPrices = mergeSortAndDedupePrices(prices).filter(
      (price) => price.date >= toIsoDate(monthStarts[0])
    );

    if (normalizedPrices.length === 0) {
      const firstError = monthlyResults.find(
        (result): result is PromiseRejectedResult => result.status === "rejected"
      );

      return {
        symbol,
        dataStatus: "error",
        prices: [],
        source: "TWSE_STOCK_DAY",
        error:
          firstError?.reason instanceof Error
            ? firstError.reason.message
            : "TWSE returned no usable daily prices."
      };
    }

    return {
      symbol,
      dataStatus: "ok",
      prices: normalizedPrices,
      source: "TWSE_STOCK_DAY"
    };
  } catch (error) {
    return {
      symbol,
      dataStatus: "error",
      prices: [],
      source: "TWSE_STOCK_DAY",
      error: error instanceof Error ? error.message : "Unknown TWSE fetch error."
    };
  }
}

export async function fetchManyTwseDailyPrices(
  symbols: string[],
  options: FetchOptions = {}
): Promise<StockPriceFetchResult[]> {
  const results = await Promise.allSettled(
    symbols.map((symbol) => fetchRecentTwseDailyPrices(symbol, options))
  );

  return results.map((result, index) => {
    const symbol = symbols[index] ?? "UNKNOWN";

    if (result.status === "fulfilled") {
      return result.value;
    }

    return {
      symbol,
      dataStatus: "error",
      prices: [],
      source: "TWSE_STOCK_DAY",
      error:
        result.reason instanceof Error
          ? result.reason.message
          : "Unknown symbol fetch failure."
    };
  });
}

export function mergeSortAndDedupePrices(prices: DailyPrice[]): DailyPrice[] {
  const pricesByDate = new Map<string, DailyPrice>();

  for (const price of prices) {
    pricesByDate.set(price.date, price);
  }

  return Array.from(pricesByDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

async function fetchTwseStockMonth(
  symbol: string,
  date: string,
  options: Required<Pick<FetchOptions, "retries" | "timeoutMs">>
): Promise<DailyPrice[]> {
  const url = new URL(twseStockDayUrl);
  url.searchParams.set("response", "json");
  url.searchParams.set("date", date);
  url.searchParams.set("stockNo", symbol);

  const response = await fetchWithRetry(url, options.retries, options.timeoutMs);
  const payload = (await response.json()) as TwseStockDayResponse;

  if (!Array.isArray(payload.data)) {
    return [];
  }

  return payload.data.map(parseTwseDailyRow).filter(isDailyPrice);
}

async function fetchWithRetry(
  url: URL,
  retries: number,
  timeoutMs: number
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": userAgent,
          accept: "application/json,text/plain,*/*"
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`TWSE HTTP ${response.status} for ${url.search}`);
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < retries) {
        await sleep(500 * (attempt + 1));
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError ?? new Error("TWSE request failed.");
}

function parseTwseDailyRow(row: string[]): DailyPrice | null {
  const [rocDate, volume, , open, high, low, close] = row;

  if (!rocDate || !open || !high || !low || !close || !volume) {
    return null;
  }

  const date = parseRocDate(rocDate);

  if (!date) {
    return null;
  }

  return {
    date,
    open: parseTwseNumber(open),
    high: parseTwseNumber(high),
    low: parseTwseNumber(low),
    close: parseTwseNumber(close),
    volume: parseTwseNumber(volume)
  };
}

function isDailyPrice(price: DailyPrice | null): price is DailyPrice {
  return (
    price !== null &&
    Number.isFinite(price.open) &&
    Number.isFinite(price.high) &&
    Number.isFinite(price.low) &&
    Number.isFinite(price.close) &&
    Number.isFinite(price.volume)
  );
}

function parseRocDate(value: string): string | null {
  const [rocYear, month, day] = value.split("/");

  if (!rocYear || !month || !day) {
    return null;
  }

  const westernYear = Number.parseInt(rocYear, 10) + 1911;

  if (!Number.isFinite(westernYear)) {
    return null;
  }

  return `${westernYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function parseTwseNumber(value: string): number {
  return Number(value.replaceAll(",", "").replace("--", "NaN"));
}

function getRecentMonthStarts(today: Date, months: number): Date[] {
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    date.setUTCMonth(date.getUTCMonth() - index);
    return date;
  }).reverse();
}

function formatTwseQueryDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${year}${month}01`;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
