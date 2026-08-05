import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "배팅 게임",
  description: "교회 수련회 2팀 대항 실시간 배팅 게임",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="relative min-h-full flex flex-col">
        <div className="world-ground" />
        <div className="world-stars">
          <span />
          <span />
          <span />
        </div>
        <div className="relative z-10 flex min-h-full flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
