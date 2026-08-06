"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "show" | "checking" | "redirecting" | "locked-unknown";

// 참가자 잠금이 켜진 동안 홈 화면(팀 선택 화면) 자체를 못 쓰게 막는다.
// 이 기기가 이미 어느 팀인지 기억하고 있으면(RememberTeam) 그 팀 화면으로
// 바로 돌려보내고, 처음 보는 기기면 "잠겨 있다"는 안내만 보여준다.
export default function HomeGate({
  locked,
  children,
}: {
  locked: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [prevLocked, setPrevLocked] = useState(locked);
  const [status, setStatus] = useState<Status>(locked ? "checking" : "show");

  // locked prop이 폴링 중 바뀌면(진행자가 그새 잠그거나 풀면) 렌더 중
  // 상태를 다시 맞춘다 — useEffect의 동기 setState 대신 렌더 중 상태 조정.
  if (locked !== prevLocked) {
    setPrevLocked(locked);
    setStatus(locked ? "checking" : "show");
  }

  useEffect(() => {
    if (status !== "checking") return;

    // localStorage는 서버에 없는 값이라 마운트 후에만 읽을 수 있고, 그
    // 결과에 따라 리다이렉트할지/안내만 보여줄지 갈리므로 렌더 중 상태
    // 조정으로는 처리할 수 없다(RecentGamesList에서 쓰던 것과 같은 사유).
    const myTeam = localStorage.getItem("myTeamNo");
    if (myTeam === "1" || myTeam === "2") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("redirecting");
      router.replace(`/play/${myTeam}`);
    } else {
      setStatus("locked-unknown");
    }
  }, [status, router]);

  if (status === "show") return <>{children}</>;

  if (status === "locked-unknown") {
    return (
      <div className="w-full border-2 border-dashed border-ink-faint p-6 text-center">
        <p className="font-bold text-ink-soft">지금은 참가자 접속이 잠겨 있어요</p>
        <p className="mt-1 text-xs font-semibold text-ink-faint">진행자에게 문의해주세요</p>
      </div>
    );
  }

  return null;
}
