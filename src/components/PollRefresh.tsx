"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 진짜 실시간 push 대신, 짧은 주기로 서버 컴포넌트를 재조회해 화면을 최신
// 상태로 맞춘다 (턴제 배팅 게임이라 1~2초 지연은 체감상 문제되지 않는다).
// 브라우저가 백그라운드 탭/비활성 창의 setInterval을 강하게 스로틀링하는
// 문제가 있어서, 탭이 다시 보이거나 창에 포커스가 돌아오는 순간에도
// 즉시 한 번 새로고침한다 — interval만으로는 몇 분씩 지연될 수 있음.
export default function PollRefresh({ intervalMs = 1500 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);

    const onVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const onFocus = () => router.refresh();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [router, intervalMs]);

  return null;
}
