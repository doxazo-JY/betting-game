"use client";

import { useState, useTransition } from "react";
import { endGame } from "./resetActions";
import ResetButton from "./ResetButton";

export default function GameControls({
  roomCode,
  adminToken,
}: {
  roomCode: string;
  adminToken: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-3">
        <button
          disabled={isPending}
          onClick={() => {
            if (!confirm("게임을 종료하고 최종 순위를 표시할까요?")) return;
            setError(null);
            startTransition(async () => {
              try {
                await endGame(roomCode, adminToken);
              } catch (e) {
                setError(e instanceof Error ? e.message : "게임 종료에 실패했습니다");
              }
            });
          }}
          className="rounded-xl border-2 border-neutral-400 px-5 py-2 text-sm font-bold dark:border-neutral-600"
        >
          게임 종료
        </button>
        <ResetButton roomCode={roomCode} adminToken={adminToken} />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
