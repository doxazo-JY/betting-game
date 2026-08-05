"use client";

import { useState, useTransition } from "react";
import { applyRoundResult } from "./actions";

export default function ResultForm({
  roomCode,
  adminToken,
  team1Name,
  team2Name,
  team1FinalBet,
  team2FinalBet,
  multiplier,
}: {
  roomCode: string;
  adminToken: string;
  team1Name: string;
  team2Name: string;
  team1FinalBet: number;
  team2FinalBet: number;
  multiplier: number;
}) {
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function delta(isWinner: boolean, finalBet: number) {
    // 배수는 승리 시에만 적용되고, 패배 시에는 배팅한 금액만 잃는다.
    if (isWinner) return Math.trunc(finalBet * multiplier);
    return -finalBet;
  }

  function submit() {
    if (!winner) return;
    setError(null);
    startTransition(async () => {
      try {
        await applyRoundResult(roomCode, adminToken, winner);
      } catch (e) {
        setError(e instanceof Error ? e.message : "결과 적용에 실패했습니다");
        setConfirming(false);
      }
    });
  }

  if (confirming && winner) {
    const d1 = delta(winner === 1, team1FinalBet);
    const d2 = delta(winner === 2, team2FinalBet);
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-blue-300 p-5 dark:border-blue-800">
        <p className="font-bold">이 결과를 적용하시겠습니까?</p>
        <p>
          {team1Name}: {winner === 1 ? "승리" : "패배"} /{" "}
          <span className={d1 >= 0 ? "text-green-600" : "text-red-600"}>
            {d1 >= 0 ? "+" : ""}
            {d1.toLocaleString()}P
          </span>
        </p>
        <p>
          {team2Name}: {winner === 2 ? "승리" : "패배"} /{" "}
          <span className={d2 >= 0 ? "text-green-600" : "text-red-600"}>
            {d2 >= 0 ? "+" : ""}
            {d2.toLocaleString()}P
          </span>
        </p>
        <div className="flex gap-3">
          <button
            disabled={isPending}
            onClick={() => setConfirming(false)}
            className="flex-1 rounded-xl border-2 border-neutral-300 py-3 font-bold dark:border-neutral-700"
          >
            취소
          </button>
          <button
            disabled={isPending}
            onClick={submit}
            className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white disabled:opacity-50"
          >
            결과 적용
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
      <p className="font-bold">어느 팀이 승리했나요?</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setWinner(1)}
          className={`rounded-xl py-4 font-bold ${
            winner === 1
              ? "bg-green-600 text-white"
              : "border-2 border-neutral-300 dark:border-neutral-700"
          }`}
        >
          {team1Name} 승리
        </button>
        <button
          onClick={() => setWinner(2)}
          className={`rounded-xl py-4 font-bold ${
            winner === 2
              ? "bg-green-600 text-white"
              : "border-2 border-neutral-300 dark:border-neutral-700"
          }`}
        >
          {team2Name} 승리
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={!winner}
        onClick={() => setConfirming(true)}
        className="rounded-xl bg-blue-600 py-3 font-bold text-white disabled:opacity-40"
      >
        결과 적용
      </button>
    </div>
  );
}
