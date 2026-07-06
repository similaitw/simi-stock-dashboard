import type { ReportJson } from "@/lib/reportTypes";

interface PostMarketPanelProps {
  report: ReportJson;
}

export default function PostMarketPanel({ report }: PostMarketPanelProps) {
  const sortedItems = [...report.items].sort((a, b) => b.score - a.score);
  const addOrder = sortedItems
    .filter((item) => item.signal === "強勢" || item.signal === "正常")
    .slice(0, 3);
  const avoidItems = sortedItems
    .filter((item) => item.signal === "轉弱" || item.signal === "修正")
    .slice(-3)
    .reverse();
  const avoidRows = [
    ...avoidItems.map((item) => ({
      key: item.symbol,
      title: `${item.symbol} ${item.name}`,
      detail: item.postMarketNote ?? item.reason
    })),
    ...report.avoid.map((text) => ({
      key: text,
      title: text,
      detail: "依紀律提醒執行。"
    }))
  ];

  return (
    <section className="analysis-panel" aria-labelledby="post-market-title">
      <div className="panel-header">
        <div>
          <p className="eyebrow">14:40</p>
          <h2 id="post-market-title">盤後檢討</h2>
        </div>
        <p>{report.summary}</p>
      </div>

      <div className="post-grid">
        <article className="analysis-card">
          <h3>今日總結</h3>
          <dl className="review-list">
            <div>
              <dt>總體狀態</dt>
              <dd>{report.marketState}</dd>
            </div>
            <div>
              <dt>最強標的</dt>
              <dd>
                {report.leader.symbol} {report.leader.name}
              </dd>
            </div>
            <div>
              <dt>警戒標的</dt>
              <dd>
                {report.risk.symbol} {report.risk.name}
              </dd>
            </div>
          </dl>
        </article>

        <article className="analysis-card">
          <h3>明日加碼順序</h3>
          <ol className="rank-list">
            {addOrder.map((item) => (
              <li key={item.symbol}>
                <strong>
                  {item.symbol} {item.name}
                </strong>
                <span>{item.postMarketNote ?? item.reason}</span>
              </li>
            ))}
          </ol>
        </article>

        <article className="analysis-card">
          <h3>明日避免</h3>
          <ol className="rank-list">
            {avoidRows.map((item) => (
              <li key={item.key}>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </li>
            ))}
          </ol>
        </article>
      </div>
    </section>
  );
}
