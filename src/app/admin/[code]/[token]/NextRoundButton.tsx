"use client";

import { useTransition } from "react";
import { nextRound } from "./actions";

export default function NextRoundButton({
  roomCode,
  adminToken,
}: {
  roomCode: string;
  adminToken: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => nextRound(roomCode, adminToken))}
      className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white disabled:opacity-50"
    >
      다음 라운드
    </button>
  );
}
