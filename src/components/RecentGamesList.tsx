"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecentGames, removeRecentGame, type RecentGame } from "@/lib/recentGames";

export default function RecentGamesList() {
  const [games, setGames] = useState<RecentGame[]>([]);

  useEffect(() => {
    // localStorage는 서버에 없는 값이라, 첫 렌더는 서버와 동일하게 빈 목록으로
    // 맞추고 마운트 후에 읽어와야 하이드레이션 불일치가 나지 않는다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGames(getRecentGames());
  }, []);

  if (games.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-sm font-medium text-neutral-500">최근 게임방</p>
      {games.map((g) => (
        <div key={g.code} className="flex items-center gap-2">
          <Link
            href={`/admin/${g.code}/${g.adminToken}`}
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-3 text-left dark:border-neutral-700"
          >
            <span className="font-mono font-bold">{g.code}</span>
            <span className="text-neutral-500">
              {" "}
              · {g.team1Name} vs {g.team2Name}
            </span>
          </Link>
          <button
            onClick={() => {
              removeRecentGame(g.code);
              setGames(getRecentGames());
            }}
            className="px-2 text-xs text-neutral-400"
          >
            삭제
          </button>
        </div>
      ))}
    </div>
  );
}
