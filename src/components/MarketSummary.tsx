import type { ReportJson } from "@/lib/reportTypes";

interface MarketSummaryProps {
  report: ReportJson;
}

export default function MarketSummary({ report }: MarketSummaryProps) {
  const cards = [
    {
      label: "總體狀態",
      value: report.marketState,
      detail: report.summary,
      tone: report.marketState
    },
    {
      label: "今日主策略",
      value: report.mainAction,
      detail: report.dataStatus === "sample" ? "目前為 sample JSON。" : "依最新報告執行。"
    },
    {
      label: "最強標的",
      value: `${report.leader.symbol} ${report.leader.name}`,
      detail: report.leader.reason,
      tone: "強勢"
    },
    {
      label: "警戒標的",
      value: `${report.risk.symbol} ${report.risk.name}`,
      detail: report.risk.reason,
      tone: "轉弱"
    }
  ];

  return (
    <section className="summary-grid" aria-label="市場摘要">
      {cards.map((card) => (
        <article className="summary-card" data-tone={card.tone} key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <p>{card.detail}</p>
        </article>
      ))}
    </section>
  );
}
