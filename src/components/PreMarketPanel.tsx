import type { ReportJson, StockReportItem } from "@/lib/reportTypes";

interface PreMarketPanelProps {
  report: ReportJson;
}

export default function PreMarketPanel({ report }: PreMarketPanelProps) {
  const incomeItems = report.items.filter((item) => item.category === "income");
  const growthItems = report.items.filter((item) => item.category === "growth");
  const satelliteItems = report.items.filter((item) => item.category === "stock");

  return (
    <section className="analysis-panel" aria-labelledby="pre-market-title">
      <div className="panel-header">
        <div>
          <p className="eyebrow">08:20</p>
          <h2 id="pre-market-title">盤前分析</h2>
        </div>
        <p>{report.summary}</p>
      </div>
      <div className="analysis-grid">
        <AnalysisGroup
          items={incomeItems}
          title="高股息 ETF"
          topic="折溢價、除息與月季線"
        />
        <AnalysisGroup
          items={growthItems}
          title="科技成長"
          topic="台積電、台達電同步性"
        />
        <AnalysisGroup
          items={satelliteItems}
          title="衛星個股"
          topic="只觀察小部位風險"
        />
      </div>
    </section>
  );
}

function AnalysisGroup({
  items,
  title,
  topic
}: {
  items: StockReportItem[];
  title: string;
  topic: string;
}) {
  return (
    <article className="analysis-card">
      <div className="analysis-card-head">
        <h3>{title}</h3>
        <span>{topic}</span>
      </div>
      <div className="note-list">
        {items.map((item) => (
          <div className="note-row" key={item.symbol}>
            <div>
              <strong>
                {item.symbol} {item.name}
              </strong>
              <p>{item.preMarketNote ?? item.action}</p>
            </div>
            <span className="signal-badge" data-signal={item.signal}>
              {item.signal}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
