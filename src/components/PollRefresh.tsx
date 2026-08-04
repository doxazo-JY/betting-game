"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 진짜 실시간 push 대신, 짧은 주기로 서버 컴포넌트를 재조회해 화면을 최신
// 상태로 맞춘다 (턴제 배팅 게임이라 1~2초 지연은 체감상 문제되지 않는다).
export default function PollRefresh({ intervalMs = 1500 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
