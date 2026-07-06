import type { ReportJson } from "@/lib/reportTypes";

interface IntradayPanelProps {
  report: ReportJson;
}

export default function IntradayPanel({ report }: IntradayPanelProps) {
  return (
    <section className="analysis-panel" aria-labelledby="intraday-title">
      <div className="panel-header">
        <div>
          <p className="eyebrow">11:30</p>
          <h2 id="intraday-title">盤中監控</h2>
        </div>
        <p>盤中只做紀律檢查，不因急漲急跌追價。</p>
      </div>

      <div className="monitor-grid">
        {report.items.map((item) => (
          <article
            className="monitor-card"
            data-signal={item.signal}
            key={item.symbol}
          >
            <div className="monitor-top">
              <div>
                <strong>{item.symbol}</strong>
                <span>{item.name}</span>
              </div>
              <span className="signal-badge" data-signal={item.signal}>
                {item.signal}
              </span>
            </div>
            <p>{item.intradayNote ?? item.action}</p>
            <dl>
              <div>
                <dt>現價</dt>
                <dd>{formatNumber(item.price)}</dd>
              </div>
              <div>
                <dt>月線</dt>
                <dd>{formatNumber(item.ma20)}</dd>
              </div>
              <div>
                <dt>季線</dt>
                <dd>{formatNumber(item.ma60)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatNumber(value: number | null): string {
  return value === null ? "-" : value.toLocaleString("zh-TW");
}
