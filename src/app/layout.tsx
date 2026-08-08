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
          {/* 구름 — 손으로 그린 clip-path 도형을 몇 차례 고쳐도 "따로 논다"는
              피드백이 반복돼서, 사용자가 만든 픽셀아트(32x19칸)를 그대로
              이미지로 구웠다(public/cloud-pixel.png). 원본 왼쪽 가장자리에
              떠 있던 끊긴 픽셀 몇 개(오른쪽과 비교해 지저분해 보인다는
              피드백)만 정리하고 나머지는 그대로 옮김. */}
          <Image
            src="/cloud-pixel.png"
            alt=""
            width={256}
            height={152}
            className="world-cloud"
            style={{ top: "3%", left: "8%", width: "70px", opacity: 0.85 }}
          />
          <span />
          <Image
            src="/cloud-pixel.png"
            alt=""
            width={256}
            height={152}
            className="world-cloud"
            style={{ top: "16%", left: "5%", width: "56px", opacity: 0.8 }}
          />
          <Image
            src="/cloud-pixel.png"
            alt=""
            width={256}
            height={152}
            className="world-cloud"
            style={{ top: "26%", right: "14%", width: "60px", opacity: 0.75 }}
          />
        </div>
        <div className="relative z-10 flex min-h-full flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
