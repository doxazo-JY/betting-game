"use client";

import { useState, useTransition } from "react";
import { confirmBet } from "./actions";

export default function ExtraBetForm({
  roomCode,
  teamToken,
  minAmount,
  maxAmount,
  reason,
}: {
  roomCode: string;
  teamToken: string;
  minAmount: number;
  maxAmount: number | null;
  reason: string | null;
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const parsed = Number(amount);
  const isValid =
    amount !== "" &&
    Number.isInteger(parsed) &&
    parsed >= minAmount &&
    (maxAmount === null || parsed <= maxAmount);

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await confirmBet(roomCode, teamToken, parsed, "FORCED_EXTRA");
      } catch (e) {
        setError(e instanceof Error ? e.message : "추가 배팅에 실패했습니다");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-orange-300 p-5 dark:border-orange-800">
      <p className="font-bold">추가 배팅 요청</p>
      {reason && <p className="text-sm text-neutral-500">{reason}</p>}
      <p className="text-xs text-neutral-500">
        {minAmount.toLocaleString()}P {maxAmount !== null ? `~ ${maxAmount.toLocaleString()}P` : "이상"}
      </p>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
        inputMode="numeric"
        placeholder="0"
        className="rounded-xl border border-neutral-300 px-4 py-3 text-center text-2xl font-bold tabular-nums dark:border-neutral-700 dark:bg-neutral-900"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={!isValid || isPending}
        onClick={submit}
        className="rounded-xl bg-orange-600 py-3 font-bold text-white disabled:opacity-40"
      >
        추가 배팅 확정
      </button>
    </div>
  );
}
