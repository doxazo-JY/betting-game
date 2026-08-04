"use client";

import { useState, useTransition } from "react";

type UndoResult = { ok: boolean; warning?: string; laterCount?: number };

export default function UndoButton({
  label,
  onUndo,
}: {
  label: string;
  onUndo: (force: boolean) => Promise<UndoResult>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(force: boolean) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await onUndo(force);
        if (!res.ok && res.warning === "later_changes") {
          const proceed = confirm(
            `이 작업 이후에 다른 점수 변경 기록이 ${res.laterCount}건 있습니다.\n되돌릴 경우 이후 상태에 영향을 줄 수 있습니다.\n그래도 되돌리시겠습니까?`
          );
          if (proceed) run(true);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "되돌리기에 실패했습니다");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        disabled={isPending}
        onClick={() => run(false)}
        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 disabled:opacity-50 dark:border-red-800"
      >
        {label}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
