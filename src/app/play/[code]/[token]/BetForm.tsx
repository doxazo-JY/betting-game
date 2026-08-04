"use client";

import { useState, useTransition } from "react";
import { confirmBet } from "./actions";

export default function BetForm({
  roomCode,
  teamToken,
  maxBet,
}: {
  roomCode: string;
  teamToken: string;
  maxBet: number;
}) {
  const [amount, setAmount] = useState("");
  const [phase, setPhase] = useState<"input" | "confirm">("input");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const parsed = Number(amount);
  const isValid = amount !== "" && Number.isInteger(parsed) && parsed >= 0 && parsed <= maxBet;

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await confirmBet(roomCode, teamToken, parsed);
      } catch (e) {
        setError(e instanceof Error ? e.message : "배팅에 실패했습니다");
        setPhase("input");
      }
    });
  }

  if (phase === "confirm") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-blue-300 p-6 text-center dark:border-blue-800">
        <p className="text-lg">
          정말 <span className="font-extrabold">{parsed.toLocaleString()}P</span>를
          배팅하시겠습니까?
        </p>
        <p className="text-xs text-neutral-500">확정 후에는 직접 수정할 수 없습니다</p>
        <div className="flex w-full gap-3">
          <button
            disabled={isPending}
            onClick={() => setPhase("input")}
            className="flex-1 rounded-xl border-2 border-neutral-300 py-3 font-bold dark:border-neutral-700"
          >
            다시 입력
          </button>
          <button
            disabled={isPending}
            onClick={submit}
            className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white disabled:opacity-50"
          >
            배팅 확정
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-sm text-neutral-500">
        배팅할 포인트를 입력해주세요 (0 ~ {maxBet.toLocaleString()}P)
      </p>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
        inputMode="numeric"
        placeholder="0"
        className="rounded-xl border border-neutral-300 px-4 py-4 text-center text-3xl font-bold tabular-nums dark:border-neutral-700 dark:bg-neutral-900"
      />
      <div className="grid grid-cols-4 gap-2">
        {[50, 100, 200].map((v) => (
          <button
            key={v}
            onClick={() => setAmount(String(Math.min(v, maxBet)))}
            className="rounded-lg border border-neutral-300 py-2 text-sm font-medium dark:border-neutral-700"
          >
            {v}P
          </button>
        ))}
        <button
          onClick={() => setAmount(String(maxBet))}
          className="rounded-lg border border-neutral-300 py-2 text-sm font-medium dark:border-neutral-700"
        >
          최대
        </button>
      </div>
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
      <button
        disabled={!isValid}
        onClick={() => setPhase("confirm")}
        className="rounded-xl bg-blue-600 py-4 text-lg font-bold text-white disabled:opacity-40"
      >
        배팅 확정
      </button>
    </div>
  );
}
