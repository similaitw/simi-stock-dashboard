import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simi Stock Dashboard",
  description: "台股持股追蹤與投資紀律輔助看板"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
