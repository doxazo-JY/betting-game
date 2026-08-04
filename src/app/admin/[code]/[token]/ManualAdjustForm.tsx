"use client";

import { useState, useTransition } from "react";
import { manualAdjustScore } from "./undoActions";

export default function ManualAdjustForm({
  roomCode,
  adminToken,
  team1Name,
  team2Name,
}: {
  roomCode: string;
  adminToken: string;
  team1Name: string;
  team2Name: string;
}) {
  const [teamNo, setTeamNo] = useState<1 | 2>(1);
  const [mode, setMode] = useState<"delta" | "set">("delta");
  const [value, setValue] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const parsed = Number(value);
  const isValid = value !== "" && value !== "-" && Number.isInteger(parsed);

  function submit() {
    if (!isValid) return;
    setError(null);
    startTransition(async () => {
      try {
        await manualAdjustScore(roomCode, adminToken, teamNo, mode, parsed, memo || undefined);
        setValue("");
        setMemo("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "점수 수정에 실패했습니다");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <p className="font-bold">점수 직접 수정</p>
      <div className="flex gap-2">
        <button
          onClick={() => setTeamNo(1)}
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${teamNo === 1 ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black" : "border border-neutral-300 dark:border-neutral-700"}`}
        >
          {team1Name}
        </button>
        <button
          onClick={() => setTeamNo(2)}
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${teamNo === 2 ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black" : "border border-neutral-300 dark:border-neutral-700"}`}
        >
          {team2Name}
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setMode("delta")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${mode === "delta" ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black" : "border border-neutral-300 dark:border-neutral-700"}`}
        >
          +/- 만큼 조정
        </button>
        <button
          onClick={() => setMode("set")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${mode === "set" ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black" : "border border-neutral-300 dark:border-neutral-700"}`}
        >
          특정 값으로 변경
        </button>
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/(?!^-)[^0-9]/g, ""))}
        inputMode="numeric"
        placeholder={mode === "delta" ? "예: 100 또는 -100" : "예: -500"}
        className="rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
      />
      <input
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="메모 (선택)"
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={!isValid || isPending}
        onClick={submit}
        className="rounded-xl bg-neutral-800 py-3 font-bold text-white disabled:opacity-40 dark:bg-neutral-200 dark:text-black"
      >
        적용
      </button>
    </div>
  );
}
