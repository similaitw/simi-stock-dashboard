"use client";

import { useState } from "react";
import type { ReportType } from "@/lib/reportTypes";

const reportOptions: Array<{
  type: ReportType;
  label: string;
  hint: string;
}> = [
  {
    type: "pre_market",
    label: "產生盤前",
    hint: "08:20"
  },
  {
    type: "intraday",
    label: "產生盤中",
    hint: "11:30"
  },
  {
    type: "post_market",
    label: "產生盤後",
    hint: "14:40"
  }
];

export default function ManualReportPanel() {
  const [triggerKey, setTriggerKey] = useState("");
  const [pendingType, setPendingType] = useState<ReportType | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function runReport(reportType: ReportType) {
    setPendingType(reportType);
    setMessage(null);
    setIsError(false);

    try {
      const response = await fetch("/api/run-report", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          reportType,
          triggerKey
        })
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "手動更新送出失敗。");
      }

      setMessage(data.message ?? "已送出手動更新。");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "手動更新送出失敗。");
    } finally {
      setPendingType(null);
    }
  }

  return (
    <section className="manual-report-panel" aria-labelledby="manual-report-title">
      <div>
        <p className="eyebrow">Manual Run</p>
        <h2 id="manual-report-title">手動更新報告</h2>
        <p>
          自動排程會照時間執行；需要立刻刷新時，可用這裡觸發 GitHub Actions。
        </p>
      </div>

      <label className="manual-key-field">
        <span>手動更新密碼</span>
        <input
          autoComplete="off"
          onChange={(event) => setTriggerKey(event.target.value)}
          placeholder="輸入 Vercel 設定的 MANUAL_TRIGGER_KEY"
          type="password"
          value={triggerKey}
        />
      </label>

      <div className="manual-button-grid">
        {reportOptions.map((option) => (
          <button
            disabled={pendingType !== null || triggerKey.trim().length === 0}
            key={option.type}
            onClick={() => runReport(option.type)}
            type="button"
          >
            <strong>{pendingType === option.type ? "送出中" : option.label}</strong>
            <span>{option.hint}</span>
          </button>
        ))}
      </div>

      {message && (
        <p className={isError ? "manual-status error" : "manual-status"}>
          {message}
        </p>
      )}
    </section>
  );
}
