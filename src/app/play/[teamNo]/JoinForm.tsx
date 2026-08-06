"use client";

import { useState, useTransition } from "react";
import { setTeamName } from "./actions";
import PollRefresh from "@/components/PollRefresh";
import BackLock from "@/components/BackLock";
import RememberTeam from "@/components/RememberTeam";

export default function JoinForm({
  teamNo,
  teamColor,
  locked,
}: {
  teamNo: 1 | 2;
  teamColor: "red" | "blue";
  locked: boolean;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const btnBg = teamColor === "red" ? "bg-team-red" : "bg-team-blue";

  function submit() {
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        await setTeamName(teamNo, name.trim());
      } catch (e) {
        setError(e instanceof Error ? e.message : "입장에 실패했습니다");
      }
    });
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <PollRefresh />
      <BackLock active={locked} />
      <RememberTeam teamNo={teamNo} />
      <span
        className={
          "border-2 border-ink px-4 py-1.5 text-sm font-black text-white " +
          (teamColor === "red" ? "bg-team-red" : "bg-team-blue")
        }
      >
        {teamNo}팀 자리
      </span>
      <h1 className="text-2xl font-black">팀 이름을 입력하고 입장하세요</h1>
      <div className="flex w-full flex-col gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          maxLength={20}
          placeholder={`예: ${teamNo}팀 이름`}
          className="border-[3px] border-ink bg-paper-2 px-4 py-4 text-center text-xl font-black"
        />
        {error && <p className="text-sm font-bold text-lose-ink">{error}</p>}
        <button
          disabled={!name.trim() || isPending}
          onClick={submit}
          className={
            "border-2 border-ink py-4 text-lg font-black text-white shadow-sticker-sm disabled:opacity-40 " +
            btnBg
          }
        >
          입장하기
        </button>
      </div>
    </main>
  );
}
