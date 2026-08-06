"use client";

import { useState, useTransition } from "react";
import { confirmBet } from "./actions";

export default function BetForm({
  teamNo,
  maxBet,
  teamColor,
}: {
  teamNo: 1 | 2;
  maxBet: number;
  teamColor: "red" | "blue";
}) {
  const [amount, setAmount] = useState("");
  const [phase, setPhase] = useState<"input" | "confirm">("input");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const parsed = Number(amount);
  const isValid = amount !== "" && Number.isInteger(parsed) && parsed >= 0 && parsed <= maxBet;
  const btnBg = teamColor === "red" ? "bg-team-red" : "bg-team-blue";

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await confirmBet(teamNo, parsed);
      } catch (e) {
        setError(e instanceof Error ? e.message : "배팅에 실패했습니다");
        setPhase("input");
      }
    });
  }

  if (phase === "confirm") {
    return (
      <div className="flex flex-col items-center gap-4 border-[3px] border-ink bg-paper-2 p-6 text-center shadow-sticker">
        <p className="text-lg font-bold">
          정말 <span className="font-black">{parsed.toLocaleString()}P</span>를 배팅하시겠습니까?
        </p>
        <p className="text-xs font-semibold text-ink-faint">확정 후에는 직접 수정할 수 없습니다</p>
        <div className="flex w-full gap-3">
          <button
            disabled={isPending}
            onClick={() => setPhase("input")}
            className="flex-1 border-2 border-ink bg-paper-2 py-3 font-black"
          >
            다시 입력
          </button>
          <button
            disabled={isPending}
            onClick={submit}
            className={
              "flex-1 border-2 border-ink py-3 font-black text-white shadow-sticker-sm disabled:opacity-50 " +
              btnBg
            }
          >
            배팅 확정
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-sm font-semibold text-ink-soft">
        배팅할 포인트를 입력해주세요 (0 ~ {maxBet.toLocaleString()}P)
      </p>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
        inputMode="numeric"
        placeholder="0"
        className="border-[3px] border-ink bg-paper-2 px-4 py-4 text-center text-3xl font-black tabular-nums"
      />
      <div className="grid grid-cols-4 gap-2">
        {[50, 100, 200].map((v) => (
          <button
            key={v}
            onClick={() => setAmount(String(Math.min(v, maxBet)))}
            className="border-2 border-ink bg-paper-2 py-2 text-sm font-bold"
          >
            {v}P
          </button>
        ))}
        <button
          onClick={() => setAmount(String(maxBet))}
          className="border-2 border-ink bg-paper-2 py-2 text-sm font-bold"
        >
          최대
        </button>
      </div>
      {error && <p className="text-center text-sm font-bold text-lose-ink">{error}</p>}
      <button
        disabled={!isValid}
        onClick={() => setPhase("confirm")}
        className={
          "border-2 border-ink py-4 text-lg font-black text-white shadow-sticker-sm disabled:opacity-40 " +
          btnBg
        }
      >
        이 점수로 도전하기
      </button>
    </div>
  );
}
