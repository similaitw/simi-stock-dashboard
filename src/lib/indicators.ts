import type { DailyPrice, KLinePattern } from "./reportTypes";

export interface MovingAverageSet {
  ma20: number | null;
  ma60: number | null;
  ma120: number | null;
  volumeMA20: number | null;
}

export interface KLineShape {
  pattern: KLinePattern;
  range: number;
  body: number;
  upperShadow: number;
  lowerShadow: number;
  bodyRatio: number;
  upperRatio: number;
  lowerRatio: number;
}

export function calculateAverage(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return round(total / values.length);
}

export function calculateMovingAverage(
  prices: DailyPrice[],
  days: number
): number | null {
  if (prices.length < days) {
    return null;
  }

  const closes = prices.slice(-days).map((price) => price.close);
  return calculateAverage(closes);
}

export function calculateVolumeMovingAverage(
  prices: DailyPrice[],
  days = 20
): number | null {
  if (prices.length < days) {
    return null;
  }

  const volumes = prices.slice(-days).map((price) => price.volume);
  return calculateAverage(volumes);
}

export function calculateMovingAverages(prices: DailyPrice[]): MovingAverageSet {
  return {
    ma20: calculateMovingAverage(prices, 20),
    ma60: calculateMovingAverage(prices, 60),
    ma120: calculateMovingAverage(prices, 120),
    volumeMA20: calculateVolumeMovingAverage(prices, 20)
  };
}

export function isHighVolume(
  latestVolume: number,
  volumeMA20: number | null
): boolean {
  return volumeMA20 !== null && latestVolume > volumeMA20 * 1.5;
}

export function classifyKLine(price: DailyPrice): KLineShape {
  const range = price.high - price.low;

  if (range <= 0) {
    return {
      pattern: "平盤",
      range: 0,
      body: 0,
      upperShadow: 0,
      lowerShadow: 0,
      bodyRatio: 0,
      upperRatio: 0,
      lowerRatio: 0
    };
  }

  const body = Math.abs(price.close - price.open);
  const upperShadow = price.high - Math.max(price.open, price.close);
  const lowerShadow = Math.min(price.open, price.close) - price.low;
  const bodyRatio = body / range;
  const upperRatio = upperShadow / range;
  const lowerRatio = lowerShadow / range;

  return {
    pattern: resolveKLinePattern(price, bodyRatio, upperRatio, lowerRatio),
    range,
    body,
    upperShadow,
    lowerShadow,
    bodyRatio,
    upperRatio,
    lowerRatio
  };
}

function resolveKLinePattern(
  price: DailyPrice,
  bodyRatio: number,
  upperRatio: number,
  lowerRatio: number
): KLinePattern {
  if (bodyRatio < 0.15 && upperRatio > 0.45) {
    return "十字長上影";
  }

  if (bodyRatio < 0.15 && lowerRatio > 0.45) {
    return "十字長下影";
  }

  if (bodyRatio < 0.15) {
    return "十字線";
  }

  if (price.close > price.open && bodyRatio > 0.6) {
    return "長紅 K";
  }

  if (price.close < price.open && bodyRatio > 0.6) {
    return "長黑 K";
  }

  if (upperRatio > 0.45 && bodyRatio < 0.35) {
    return "長上影";
  }

  if (lowerRatio > 0.45 && bodyRatio < 0.35) {
    return "長下影";
  }

  if (price.close > price.open) {
    return "紅K";
  }

  if (price.close < price.open) {
    return "黑K";
  }

  return "平盤";
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
