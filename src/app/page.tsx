"use client";

import { useEffect, useState } from "react";
import Disclaimer from "@/components/Disclaimer";
import IntradayPanel from "@/components/IntradayPanel";
import MarketSummary from "@/components/MarketSummary";
import PostMarketPanel from "@/components/PostMarketPanel";
import PreMarketPanel from "@/components/PreMarketPanel";
import RulePanel from "@/components/RulePanel";
import StockCard from "@/components/StockCard";
import StockTable from "@/components/StockTable";
import type { ReportJson } from "@/lib/reportTypes";

type TabId =
  | "overview"
  | "charts"
  | "preMarket"
  | "intraday"
  | "postMarket"
  | "rules";

interface ReportBundle {
  latest: ReportJson;
  preMarket: ReportJson;
  intraday: ReportJson;
  postMarket: ReportJson;
}

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "總覽" },
  { id: "charts", label: "各檔 K 線" },
  { id: "preMarket", label: "盤前分析" },
  { id: "intraday", label: "盤中監控" },
  { id: "postMarket", label: "盤後檢討" },
  { id: "rules", label: "規則設定" }
];

export default function HomePage() {
  const [reports, setReports] = useState<ReportBundle | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
      try {
        const latest = await fetchReport("/reports/latest.json");
        const [preMarket, intraday, postMarket] = await Promise.all([
          fetchReport("/reports/pre-market.json", latest),
          fetchReport("/reports/intraday.json", latest),
          fetchReport("/reports/post-market.json", latest)
        ]);

        if (isMounted) {
          setReports({ latest, preMarket, intraday, postMarket });
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error ? loadError.message : "目前無報告資料。"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const latest = reports?.latest;

  return (
    <main className="dashboard-shell">
      <section className="top-bar" aria-labelledby="dashboard-title">
        <div>
          <p className="eyebrow">simi-stock-dashboard</p>
          <h1 id="dashboard-title">台股持股追蹤看板</h1>
        </div>
        <div className="update-pill">
          {latest ? `更新 ${latest.date} ${latest.time}` : "讀取報告中"}
        </div>
      </section>

      {isLoading ? (
        <section className="empty-state">讀取最新報告中...</section>
      ) : error || !reports ? (
        <section className="empty-state">{error ?? "目前無報告資料。"}</section>
      ) : (
        <>
          <nav className="dashboard-tabs" aria-label="看板頁籤">
            {tabs.map((tab) => (
              <button
                aria-pressed={activeTab === tab.id}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {activeTab === "overview" && (
            <>
              <MarketSummary report={reports.latest} />
              <section className="section-block" aria-labelledby="table-title">
                <div className="section-heading">
                  <p className="eyebrow">Overview</p>
                  <h2 id="table-title">總覽表格</h2>
                </div>
                <StockTable items={reports.latest.items} />
              </section>
            </>
          )}

          {activeTab === "charts" && (
            <section className="section-block" aria-labelledby="cards-title">
              <div className="section-heading">
                <p className="eyebrow">K-Line</p>
                <h2 id="cards-title">各檔 K 線</h2>
              </div>
              <div className="stock-card-grid">
                {reports.latest.items.map((item) => (
                  <StockCard item={item} key={item.symbol} />
                ))}
              </div>
            </section>
          )}

          {activeTab === "preMarket" && (
            <PreMarketPanel report={reports.preMarket} />
          )}

          {activeTab === "intraday" && (
            <IntradayPanel report={reports.intraday} />
          )}

          {activeTab === "postMarket" && (
            <PostMarketPanel report={reports.postMarket} />
          )}

          {activeTab === "rules" && <RulePanel />}
        </>
      )}

      <Disclaimer />
    </main>
  );
}

async function fetchReport(
  path: string,
  fallback?: ReportJson
): Promise<ReportJson> {
  try {
    const response = await fetch(path, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Cannot read ${path}`);
    }

    return (await response.json()) as ReportJson;
  } catch (error) {
    if (fallback) {
      return fallback;
    }

    throw error;
  }
}
