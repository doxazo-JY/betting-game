import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "인투 오락실",
  description: "하계수련회 인투 오락실 — 2팀 대항 실시간 배팅 게임",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="relative min-h-full flex flex-col">
        <div className="world-sky" />
        <div className="world-ground" />
        <div className="world-stars">
          {/* 구름 — 손으로 그린 clip-path 도형을 몇 차례 고쳐도 문제가
              반복돼서, 사용자가 만든 픽셀아트를 그대로 이미지로 구워 쓴다
              (public/cloud-pixel-small.png, 48x22칸, 테두리 없이 흰색+
              옅은 하늘색 두 톤). */}
          <Image
            src="/cloud-pixel-small.png"
            alt=""
            width={384}
            height={176}
            className="world-cloud"
            style={{ top: "3%", left: "8%", width: "70px", opacity: 0.85 }}
          />
          <span />
          <Image
            src="/cloud-pixel-small.png"
            alt=""
            width={384}
            height={176}
            className="world-cloud"
            style={{ top: "16%", left: "5%", width: "56px", opacity: 0.8 }}
          />
          <Image
            src="/cloud-pixel-small.png"
            alt=""
            width={384}
            height={176}
            className="world-cloud"
            style={{ top: "26%", right: "14%", width: "60px", opacity: 0.75 }}
          />
        </div>
        <div className="relative z-10 flex min-h-full flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
