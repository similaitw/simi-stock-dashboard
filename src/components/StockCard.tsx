import KLineChart from "./KLineChart";
import type { StockReportItem } from "@/lib/reportTypes";

interface StockCardProps {
  item: StockReportItem;
}

export default function StockCard({ item }: StockCardProps) {
  return (
    <article className="stock-card" data-signal={item.signal}>
      <div className="stock-card-head">
        <div>
          <p>{item.symbol}</p>
          <h3>{item.name}</h3>
        </div>
        <span className="signal-badge">{item.signal}</span>
      </div>

      <dl className="stock-metrics">
        <div>
          <dt>現價</dt>
          <dd>{formatNumber(item.price)}</dd>
        </div>
        <div>
          <dt>漲跌幅</dt>
          <dd className={getChangeClass(item.changePercent)}>
            {formatPercent(item.changePercent)}
          </dd>
        </div>
        <div>
          <dt>分數</dt>
          <dd>{item.score}</dd>
        </div>
        <div>
          <dt>K 線</dt>
          <dd>{item.kline}</dd>
        </div>
      </dl>

      <KLineChart item={item} />

      <p className="stock-action">{item.action}</p>
      <p className="stock-reason">{item.reason}</p>
    </article>
  );
}

function formatNumber(value: number | null): string {
  return value === null ? "-" : value.toLocaleString("zh-TW");
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return "-";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function getChangeClass(value: number | null): string {
  if (value === null) {
    return "";
  }

  return value >= 0 ? "price-up" : "price-down";
}
