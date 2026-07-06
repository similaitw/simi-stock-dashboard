import { TRACKED_STOCKS } from "@/lib/stocks";

export default function RulePanel() {
  return (
    <section className="analysis-panel" aria-labelledby="rule-title">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Rules</p>
          <h2 id="rule-title">規則設定</h2>
        </div>
        <p>免費版以固定規則產生訊號，不使用付費 AI API 或付費資料庫。</p>
      </div>

      <div className="rules-layout">
        <article className="analysis-card">
          <h3>訊號分數</h3>
          <div className="rule-columns">
            <ul>
              <li>站上月線 +1</li>
              <li>站上季線 +1</li>
              <li>站上半年線 +1</li>
              <li>長紅 K +2</li>
              <li>長下影 +1</li>
              <li>放量收紅 +1</li>
            </ul>
            <ul>
              <li>跌破月線 -1</li>
              <li>跌破季線 -2</li>
              <li>跌破半年線 -2</li>
              <li>長黑 K -2</li>
              <li>長上影 -1</li>
              <li>放量收黑 -1</li>
            </ul>
          </div>
        </article>

        <article className="analysis-card">
          <h3>分類</h3>
          <dl className="review-list">
            <div>
              <dt>強勢</dt>
              <dd>score &gt;= 5</dd>
            </div>
            <div>
              <dt>正常</dt>
              <dd>2 到 4</dd>
            </div>
            <div>
              <dt>修正</dt>
              <dd>-1 到 1</dd>
            </div>
            <div>
              <dt>轉弱</dt>
              <dd>&lt;= -2</dd>
            </div>
          </dl>
        </article>

        <article className="analysis-card wide-card">
          <h3>追蹤標的與操作規則</h3>
          <div className="rule-stock-grid">
            {TRACKED_STOCKS.map((stock) => (
              <div className="rule-stock" key={stock.symbol}>
                <strong>
                  {stock.symbol} {stock.name}
                </strong>
                <span>{stock.role}</span>
                <ul>
                  {stock.rules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
