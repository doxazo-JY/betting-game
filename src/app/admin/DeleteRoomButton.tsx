"use client";

import { useState, useTransition } from "react";
import { deleteRoom } from "./actions";

export default function DeleteRoomButton({
  code,
  adminToken,
}: {
  code: string;
  adminToken: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm(`${code} 방을 완전히 삭제할까요?\n배팅/결과/이벤트 기록이 전부 사라지고 되돌릴 수 없습니다.`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await deleteRoom(code, adminToken);
      } catch (err) {
        setError(err instanceof Error ? err.message : "삭제에 실패했습니다");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        disabled={isPending}
        className="border-2 border-red-600 px-3 py-2 text-xs font-black text-red-600 disabled:opacity-50"
      >
        삭제
      </button>
      {error && <p className="max-w-16 text-[10px] font-bold text-red-600">{error}</p>}
    </div>
  );
}
