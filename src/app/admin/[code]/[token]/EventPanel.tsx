"use client";

import { useEffect, useState } from "react";
import { useTransition } from "react";
import { executeSwapAll, executeBetMultiplier } from "./eventActions";

type Picked = "SWAP_ALL" | "BET_MULTIPLIER" | null;

export default function EventPanel({
  roomCode,
  adminToken,
  roundStatus,
  team1Name,
  team2Name,
  team1Points,
  team2Points,
  onBusyChange,
}: {
  roomCode: string;
  adminToken: string;
  roundStatus: string;
  team1Name: string;
  team2Name: string;
  team1Points: number;
  team2Points: number;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [picked, setPicked] = useState<Picked>(null);
  const [multiplier, setMultiplier] = useState("2");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    onBusyChange?.(picked !== null);
  }, [picked, onBusyChange]);

  function cancel() {
    setPicked(null);
    setError(null);
  }

  function confirmSwap() {
    setError(null);
    startTransition(async () => {
      try {
        await executeSwapAll(roomCode, adminToken);
        setPicked(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "이벤트 실행에 실패했습니다");
      }
    });
  }

  function confirmMultiplier() {
    const value = Number(multiplier);
    if (!value || value <= 0) {
      setError("올바른 배수를 입력해주세요");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await executeBetMultiplier(roomCode, adminToken, value);
        setPicked(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "이벤트 실행에 실패했습니다");
      }
    });
  }

  if (picked === "SWAP_ALL") {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-purple-300 p-5 dark:border-purple-800">
        <p className="font-bold">🔄 전체 점수 교환을 실행하시겠습니까?</p>
        <p className="text-sm">
          {team1Name}: {team1Points.toLocaleString()}P → {team2Points.toLocaleString()}P
        </p>
        <p className="text-sm">
          {team2Name}: {team2Points.toLocaleString()}P → {team1Points.toLocaleString()}P
        </p>
        <p className="text-xs text-neutral-500">공개 방식: 전체 공개</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button
            disabled={isPending}
            onClick={cancel}
            className="flex-1 rounded-xl border-2 border-neutral-300 py-3 font-bold dark:border-neutral-700"
          >
            취소
          </button>
          <button
            disabled={isPending}
            onClick={confirmSwap}
            className="flex-1 rounded-xl bg-purple-600 py-3 font-bold text-white disabled:opacity-50"
          >
            실행
          </button>
        </div>
      </div>
    );
  }

  if (picked === "BET_MULTIPLIER") {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-purple-300 p-5 dark:border-purple-800">
        <p className="font-bold">🎲 배팅 배수 이벤트</p>
        <input
          value={multiplier}
          onChange={(e) => setMultiplier(e.target.value)}
          inputMode="decimal"
          placeholder="배수 (예: 2)"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-center text-lg dark:border-neutral-700 dark:bg-neutral-900"
        />
        <p className="text-sm text-neutral-500">
          이번 라운드: 이긴 팀은 배팅한 금액의 {multiplier || "?"}배를 얻고, 진 팀은 배팅한 금액만 잃습니다.
        </p>
        <p className="text-xs text-neutral-500">공개 방식: 전체 공개</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button
            disabled={isPending}
            onClick={cancel}
            className="flex-1 rounded-xl border-2 border-neutral-300 py-3 font-bold dark:border-neutral-700"
          >
            취소
          </button>
          <button
            disabled={isPending}
            onClick={confirmMultiplier}
            className="flex-1 rounded-xl bg-purple-600 py-3 font-bold text-white disabled:opacity-50"
          >
            실행
          </button>
        </div>
      </div>
    );
  }

  // 점수 교환은 라운드와 무관하게 즉시 바뀌는 이벤트라 배팅 중에는 막고,
  // 배팅 배수는 이번 라운드 결과 계산에 반영되는 이벤트라 결과가 나온 뒤엔 막는다.
  const canSwap = roundStatus !== "BETTING";
  const canMultiplier = roundStatus !== "RESOLVED";

  if (!canSwap && !canMultiplier) return null;

  return (
    <div className="flex gap-3">
      {canSwap && (
        <button
          onClick={() => setPicked("SWAP_ALL")}
          className="flex-1 rounded-xl border-2 border-purple-300 px-4 py-3 font-bold text-purple-600 dark:border-purple-800"
        >
          🔄 전체 점수 교환
        </button>
      )}
      {canMultiplier && (
        <button
          onClick={() => setPicked("BET_MULTIPLIER")}
          className="flex-1 rounded-xl border-2 border-purple-300 px-4 py-3 font-bold text-purple-600 dark:border-purple-800"
        >
          🎲 배팅 배수
        </button>
      )}
    </div>
  );
}
