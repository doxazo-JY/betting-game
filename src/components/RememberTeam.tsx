"use client";

import { useEffect } from "react";

// 이 기기가 어느 팀으로 들어왔는지 localStorage에 기억해둔다. 세션/로그인이
// 없는 구조라 서버는 "누구인지" 모르지만, 참가자 잠금이 켜진 동안 홈
// 화면(`/`)에 잘못 들어왔을 때 원래 팀 화면으로 되돌려보내는 데 쓴다.
export default function RememberTeam({ teamNo }: { teamNo: 1 | 2 }) {
  useEffect(() => {
    localStorage.setItem("myTeamNo", String(teamNo));
  }, [teamNo]);

  return null;
}
