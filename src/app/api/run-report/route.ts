import { NextRequest, NextResponse } from "next/server";
import type { ReportType } from "@/lib/reportTypes";

export const runtime = "nodejs";

const allowedReportTypes: ReportType[] = [
  "pre_market",
  "intraday",
  "post_market"
];

interface RunReportRequest {
  reportType?: string;
  triggerKey?: string;
}

export async function POST(request: NextRequest) {
  const token = process.env.GITHUB_ACTIONS_TOKEN;
  const triggerKey = process.env.MANUAL_TRIGGER_KEY;
  const repository = process.env.GITHUB_REPOSITORY_NAME ?? "similaitw/simi-stock-dashboard";
  const ref = process.env.GITHUB_WORKFLOW_REF ?? "master";

  if (!token || !triggerKey) {
    return NextResponse.json(
      {
        message:
          "手動更新尚未設定。請在 Vercel 設定 GITHUB_ACTIONS_TOKEN 與 MANUAL_TRIGGER_KEY。"
      },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as RunReportRequest;

  if (body.triggerKey !== triggerKey) {
    return NextResponse.json(
      { message: "手動更新密碼不正確。" },
      { status: 401 }
    );
  }

  if (!isReportType(body.reportType)) {
    return NextResponse.json(
      { message: "reportType 必須是 pre_market、intraday 或 post_market。" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `https://api.github.com/repos/${repository}/actions/workflows/stock-report.yml/dispatches`,
    {
      method: "POST",
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "x-github-api-version": "2022-11-28"
      },
      body: JSON.stringify({
        ref,
        inputs: {
          report_type: body.reportType
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    return NextResponse.json(
      {
        message: "GitHub Actions 觸發失敗。",
        detail: errorText
      },
      { status: response.status }
    );
  }

  return NextResponse.json({
    message: "已送出手動更新，GitHub Actions 會開始產生報告。",
    reportType: body.reportType
  });
}

function isReportType(value: string | undefined): value is ReportType {
  return allowedReportTypes.includes(value as ReportType);
}
