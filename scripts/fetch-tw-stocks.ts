import { fetchManyTwseDailyPrices } from "../src/lib/twse";
import { TRACKED_STOCKS } from "../src/lib/stocks";

const args = process.argv.slice(2);
const symbols = args.length > 0 ? args : TRACKED_STOCKS.map((stock) => stock.symbol);

async function main() {
  console.log(`Fetching TWSE STOCK_DAY data for ${symbols.join(", ")}...`);

  const results = await fetchManyTwseDailyPrices(symbols, {
    months: 10,
    retries: 2,
    timeoutMs: 10000
  });

  const summary = results.map((result) => ({
    symbol: result.symbol,
    dataStatus: result.dataStatus,
    rows: result.prices.length,
    firstDate: result.prices[0]?.date ?? null,
    lastDate: result.prices.at(-1)?.date ?? null,
    error: result.error ?? null
  }));

  console.table(summary);

  const failed = summary.filter((item) => item.dataStatus === "error");

  if (failed.length > 0) {
    console.warn(
      `Completed with ${failed.length} symbol error(s): ${failed
        .map((item) => item.symbol)
        .join(", ")}`
    );
  } else {
    console.log("Completed without symbol errors.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
