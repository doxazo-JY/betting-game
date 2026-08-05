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
    <div className="flex flex-col gap-3 border-[3px] border-ink bg-paper-2 p-4 shadow-sticker-sm">
      <p className="font-black">점수 직접 수정</p>
      <div className="flex gap-2">
        <button
          onClick={() => setTeamNo(1)}
          className={
            "flex-1 border-2 border-ink py-2 text-sm font-bold " +
            (teamNo === 1 ? "bg-team-red text-white" : "bg-paper-2")
          }
        >
          {team1Name}
        </button>
        <button
          onClick={() => setTeamNo(2)}
          className={
            "flex-1 border-2 border-ink py-2 text-sm font-bold " +
            (teamNo === 2 ? "bg-team-blue text-white" : "bg-paper-2")
          }
        >
          {team2Name}
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setMode("delta")}
          className={
            "flex-1 border-2 border-ink py-2 text-sm font-bold " +
            (mode === "delta" ? "bg-ink text-paper-2" : "bg-paper-2")
          }
        >
          +/- 만큼 조정
        </button>
        <button
          onClick={() => setMode("set")}
          className={
            "flex-1 border-2 border-ink py-2 text-sm font-bold " +
            (mode === "set" ? "bg-ink text-paper-2" : "bg-paper-2")
          }
        >
          특정 값으로 변경
        </button>
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/(?!^-)[^0-9]/g, ""))}
        inputMode="numeric"
        placeholder={mode === "delta" ? "예: 100 또는 -100" : "예: -500"}
        className="border-2 border-ink px-3 py-2"
      />
      <input
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="메모 (선택)"
        className="border-2 border-ink px-3 py-2 text-sm"
      />
      {error && <p className="text-sm font-bold text-lose-ink">{error}</p>}
      <button
        disabled={!isValid || isPending}
        onClick={submit}
        className="border-2 border-ink bg-ink py-3 font-black text-paper-2 shadow-sticker-sm disabled:opacity-40"
      >
        적용
      </button>
    </div>
  );
}
