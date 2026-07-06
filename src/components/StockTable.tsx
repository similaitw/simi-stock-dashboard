import type { StockReportItem } from "@/lib/reportTypes";

interface StockTableProps {
  items: StockReportItem[];
}

export default function StockTable({ items }: StockTableProps) {
  return (
    <>
      <div className="table-scroll">
        <table className="stock-table">
          <thead>
            <tr>
              <th>標的</th>
              <th>定位</th>
              <th>現價</th>
              <th>漲跌幅</th>
              <th>K 線</th>
              <th>均線</th>
              <th>量能</th>
              <th>訊號</th>
              <th>動作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.symbol}>
                <td>
                  <strong>{item.symbol}</strong>
                  <span>{item.name}</span>
                </td>
                <td>{item.role}</td>
                <td>{formatNumber(item.price)}</td>
                <td className={getChangeClass(item.changePercent)}>
                  {formatPercent(item.changePercent)}
                </td>
                <td>{item.kline}</td>
                <td>
                  20 {formatNumber(item.ma20)} / 60 {formatNumber(item.ma60)} /
                  120 {formatNumber(item.ma120)}
                </td>
                <td>{formatVolume(item.volume)}</td>
                <td>
                  <span className="signal-badge" data-signal={item.signal}>
                    {item.signal}
                  </span>
                </td>
                <td>{item.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobile-overview-list">
        {items.map((item) => (
          <article
            className="mobile-overview-card"
            data-signal={item.signal}
            key={item.symbol}
          >
            <div className="mobile-overview-head">
              <div>
                <strong>{item.symbol}</strong>
                <span>{item.name}</span>
              </div>
              <span className="signal-badge" data-signal={item.signal}>
                {item.signal}
              </span>
            </div>
            <p className="mobile-role">{item.role}</p>
            <dl className="mobile-overview-metrics">
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
                <dt>K 線</dt>
                <dd>{item.kline}</dd>
              </div>
              <div>
                <dt>量能</dt>
                <dd>{formatVolume(item.volume)}</dd>
              </div>
              <div>
                <dt>MA20</dt>
                <dd>{formatNumber(item.ma20)}</dd>
              </div>
              <div>
                <dt>MA60</dt>
                <dd>{formatNumber(item.ma60)}</dd>
              </div>
              <div>
                <dt>MA120</dt>
                <dd>{formatNumber(item.ma120)}</dd>
              </div>
            </dl>
            <div className="mobile-action">
              <span>動作</span>
              <strong>{item.action}</strong>
            </div>
          </article>
        ))}
      </div>
    </>
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

function formatVolume(value: number | null): string {
  if (value === null) {
    return "-";
  }

  return `${Math.round(value / 1000).toLocaleString("zh-TW")} 張`;
}

function getChangeClass(value: number | null): string {
  if (value === null) {
    return "";
  }

  return value >= 0 ? "price-up" : "price-down";
}
