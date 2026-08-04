"use client";

import { useTransition } from "react";
import { startRound } from "./actions";

export default function RoundControls({
  roomCode,
  adminToken,
  roundStatus,
}: {
  roomCode: string;
  adminToken: string;
  roundStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  if (roundStatus !== "WAITING") return null;

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => startRound(roomCode, adminToken))}
      className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white disabled:opacity-50"
    >
      라운드 시작
    </button>
  );
}
