"use client";

import { useEffect } from "react";

// 진행자가 "참가자 잠금"을 켜둔 동안, 뒤로가기를 눌러도 이 화면(팀 선택
// 화면 이전 단계)에서 못 빠져나가게 막는다. 로그인/세션이 없는 구조라
// "누구인지"는 몰라도 되고, 그냥 이 방이 지금 잠겨있는지만 보면 된다.
// 시크릿창이나 주소창 직접 입력까지 막을 필요는 없다는 전제(진행자가 확인).
export default function BackLock({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;

    const trap = () => {
      window.history.pushState(null, "", window.location.href);
    };
    trap();
    window.addEventListener("popstate", trap);
    return () => window.removeEventListener("popstate", trap);
  }, [active]);

  return null;
}
