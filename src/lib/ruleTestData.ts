import type { DailyPrice } from "./reportTypes";
import { TRACKED_STOCKS } from "./stocks";
import { evaluateStockSignal } from "./signalRules";

export function createMockDailyPrices(days = 140): DailyPrice[] {
  return Array.from({ length: days }, (_, index) => {
    const base = 35 + index * 0.08;
    const open = round(base);
    const close = round(base + (index === days - 1 ? 1.8 : 0.25));
    const high = round(Math.max(open, close) + 0.45);
    const low = round(Math.min(open, close) - 0.35);
    const volume = index === days - 1 ? 23000000 : 9000000 + index * 12000;

    return {
      date: createDate(index),
      open,
      high,
      low,
      close,
      volume
    };
  });
}

export function runRuleSmokeTest() {
  const stock = TRACKED_STOCKS[0];

  if (!stock) {
    throw new Error("No stock config available for rule smoke test.");
  }

  return evaluateStockSignal(stock, createMockDailyPrices());
}

function createDate(index: number): string {
  const date = new Date(Date.UTC(2026, 0, 1 + index));
  return date.toISOString().slice(0, 10);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
