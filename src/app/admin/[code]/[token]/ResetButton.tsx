"use client";

import { useState, useTransition } from "react";
import { resetRoom } from "./resetActions";

export default function ResetButton({
  roomCode,
  adminToken,
}: {
  roomCode: string;
  adminToken: string;
}) {
  const [step, setStep] = useState<"idle" | "confirm1" | "confirm2">("idle");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await resetRoom(roomCode, adminToken, text);
        setStep("idle");
        setText("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "초기화에 실패했습니다");
      }
    });
  }

  if (step === "idle") {
    return (
      <button
        onClick={() => setStep("confirm1")}
        className="rounded-xl border-2 border-red-300 px-5 py-2 text-sm font-bold text-red-600 dark:border-red-800"
      >
        전체 초기화
      </button>
    );
  }

  if (step === "confirm1") {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-red-300 p-4 text-center dark:border-red-800">
        <p className="text-sm font-bold text-red-600">
          팀 점수, 라운드, 배팅/결과/이벤트 기록이 모두 삭제됩니다. 정말 초기화할까요?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setStep("idle")}
            className="flex-1 rounded-xl border-2 border-neutral-300 py-2 text-sm font-bold dark:border-neutral-700"
          >
            취소
          </button>
          <button
            onClick={() => setStep("confirm2")}
            className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-bold text-white"
          >
            계속
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-red-300 p-4 text-center dark:border-red-800">
      <p className="text-sm font-bold text-red-600">초기화를 진행하려면 &lsquo;초기화&rsquo;를 입력해주세요.</p>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-center dark:border-neutral-700 dark:bg-neutral-900"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          disabled={isPending}
          onClick={() => {
            setStep("idle");
            setText("");
          }}
          className="flex-1 rounded-xl border-2 border-neutral-300 py-2 text-sm font-bold dark:border-neutral-700"
        >
          취소
        </button>
        <button
          disabled={isPending || text !== "초기화"}
          onClick={submit}
          className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-bold text-white disabled:opacity-40"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
