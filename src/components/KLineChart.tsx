"use client";

import { useMemo, useState } from "react";
import type { DailyPrice, StockReportItem } from "@/lib/reportTypes";

type RangeDays = 60 | 90 | 120;

interface KLineChartProps {
  item: StockReportItem;
}

interface ChartPoint extends DailyPrice {
  ma20: number | null;
  ma60: number | null;
  ma120: number | null;
}

const ranges: RangeDays[] = [60, 90, 120];
const chartWidth = 720;
const chartHeight = 260;
const priceTop = 18;
const priceBottom = 178;
const volumeTop = 196;
const volumeBottom = 246;

export default function KLineChart({ item }: KLineChartProps) {
  const [range, setRange] = useState<RangeDays>(60);
  const allPoints = useMemo(() => {
    const prices = item.prices?.length ? item.prices : createFallbackPrices(item);
    return attachMovingAverages(prices);
  }, [item]);
  const points = allPoints.slice(-range);
  const priceValues = points.flatMap((point) =>
    [point.high, point.low, point.ma20, point.ma60, point.ma120].filter(
      (value): value is number => value !== null
    )
  );
  const minPrice = Math.min(...priceValues);
  const maxPrice = Math.max(...priceValues);
  const maxVolume = Math.max(...points.map((point) => point.volume), 1);
  const candleSlot = chartWidth / points.length;
  const candleWidth = Math.max(2, Math.min(7, candleSlot * 0.58));

  return (
    <div className="kline-chart" aria-label={`${item.symbol} K 線圖`}>
      <div className="chart-toolbar">
        <div>
          <span>K 線</span>
          <small>日 K / 量 / 均線</small>
        </div>
        <div className="range-control" aria-label="切換 K 線區間">
          {ranges.map((rangeOption) => (
            <button
              aria-pressed={rangeOption === range}
              key={rangeOption}
              onClick={() => setRange(rangeOption)}
              type="button"
            >
              {rangeOption} 日
            </button>
          ))}
        </div>
      </div>

      <svg
        className="chart-svg"
        role="img"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        <title>{`${item.symbol} 日 K 線、成交量與 MA20 / MA60 / MA120`}</title>
        <line className="chart-axis" x1="0" x2={chartWidth} y1={priceBottom} y2={priceBottom} />
        <line className="chart-axis" x1="0" x2={chartWidth} y1={volumeBottom} y2={volumeBottom} />
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            className="chart-grid"
            key={ratio}
            x1="0"
            x2={chartWidth}
            y1={priceTop + (priceBottom - priceTop) * ratio}
            y2={priceTop + (priceBottom - priceTop) * ratio}
          />
        ))}

        {points.map((point, index) => {
          const x = index * candleSlot + candleSlot / 2;
          const highY = scalePrice(point.high, minPrice, maxPrice);
          const lowY = scalePrice(point.low, minPrice, maxPrice);
          const openY = scalePrice(point.open, minPrice, maxPrice);
          const closeY = scalePrice(point.close, minPrice, maxPrice);
          const isUp = point.close >= point.open;
          const bodyY = Math.min(openY, closeY);
          const bodyHeight = Math.max(1, Math.abs(closeY - openY));
          const volumeHeight = Math.max(
            1,
            ((volumeBottom - volumeTop) * point.volume) / maxVolume
          );

          return (
            <g className={isUp ? "candle-up" : "candle-down"} key={point.date}>
              <line x1={x} x2={x} y1={highY} y2={lowY} />
              <rect
                height={bodyHeight}
                rx="1"
                width={candleWidth}
                x={x - candleWidth / 2}
                y={bodyY}
              />
              <rect
                className="volume-bar"
                height={volumeHeight}
                width={Math.max(1, candleWidth)}
                x={x - candleWidth / 2}
                y={volumeBottom - volumeHeight}
              />
            </g>
          );
        })}

        <MovingAverageLine
          candleSlot={candleSlot}
          className="ma-line ma20"
          keyName="ma20"
          maxPrice={maxPrice}
          minPrice={minPrice}
          points={points}
        />
        <MovingAverageLine
          candleSlot={candleSlot}
          className="ma-line ma60"
          keyName="ma60"
          maxPrice={maxPrice}
          minPrice={minPrice}
          points={points}
        />
        <MovingAverageLine
          candleSlot={candleSlot}
          className="ma-line ma120"
          keyName="ma120"
          maxPrice={maxPrice}
          minPrice={minPrice}
          points={points}
        />
      </svg>

      <div className="chart-legend" aria-label="圖例">
        <span className="legend-up">紅漲</span>
        <span className="legend-down">綠跌</span>
        <span className="legend-ma20">MA20</span>
        <span className="legend-ma60">MA60</span>
        <span className="legend-ma120">MA120</span>
      </div>
    </div>
  );
}

function MovingAverageLine({
  candleSlot,
  className,
  keyName,
  maxPrice,
  minPrice,
  points
}: {
  candleSlot: number;
  className: string;
  keyName: "ma20" | "ma60" | "ma120";
  maxPrice: number;
  minPrice: number;
  points: ChartPoint[];
}) {
  const segments = points
    .map((point, index) => {
      const value = point[keyName];

      if (value === null) {
        return "";
      }

      const x = index * candleSlot + candleSlot / 2;
      const y = scalePrice(value, minPrice, maxPrice);
      return { x, y };
    })
    .filter((point): point is { x: number; y: number } => Boolean(point));
  const path = segments
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  if (!path) {
    return null;
  }

  return <path className={className} d={path} fill="none" />;
}

function attachMovingAverages(prices: DailyPrice[]): ChartPoint[] {
  return prices.map((price, index) => ({
    ...price,
    ma20: movingAverageAt(prices, index, 20),
    ma60: movingAverageAt(prices, index, 60),
    ma120: movingAverageAt(prices, index, 120)
  }));
}

function movingAverageAt(
  prices: DailyPrice[],
  index: number,
  days: number
): number | null {
  if (index + 1 < days) {
    return null;
  }

  const closes = prices
    .slice(index + 1 - days, index + 1)
    .map((price) => price.close);
  return round(closes.reduce((sum, close) => sum + close, 0) / days);
}

function scalePrice(value: number, minPrice: number, maxPrice: number): number {
  const spread = maxPrice - minPrice || 1;
  const ratio = (value - minPrice) / spread;
  return priceBottom - ratio * (priceBottom - priceTop);
}

function createFallbackPrices(item: StockReportItem): DailyPrice[] {
  const days = 140;
  const latestClose = item.price ?? 50;
  const ma120 = item.ma120 ?? latestClose * 0.96;
  const symbolSeed = Array.from(item.symbol).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  );
  const trend = latestClose >= ma120 ? 1 : -1;

  return Array.from({ length: days }, (_, index) => {
    const progress = index / (days - 1);
    const wave = Math.sin((index + symbolSeed) * 0.31) * latestClose * 0.018;
    const drift = (progress - 1) * latestClose * 0.13 * trend;
    const close =
      index === days - 1 ? latestClose : latestClose + drift + wave;
    const open =
      close - Math.sin((index + symbolSeed) * 0.47) * latestClose * 0.01;
    const high = Math.max(open, close) + latestClose * (0.008 + (index % 5) * 0.001);
    const low = Math.min(open, close) - latestClose * (0.007 + (index % 3) * 0.001);
    const volumeBase = item.volumeMA20 ?? item.volume ?? 1000000;
    const volume =
      index === days - 1
        ? item.volume ?? volumeBase
        : Math.round(volumeBase * (0.72 + ((index + symbolSeed) % 11) * 0.045));

    return {
      date: createDate(index),
      open: round(open),
      high: round(high),
      low: round(low),
      close: round(close),
      volume
    };
  });
}

function createDate(index: number): string {
  const date = new Date(Date.UTC(2026, 0, 1 + index));
  return date.toISOString().slice(0, 10);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
