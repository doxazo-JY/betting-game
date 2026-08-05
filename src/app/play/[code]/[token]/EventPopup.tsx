"use client";

import { useState } from "react";

type EventViewProps = {
  id: string;
  title: string;
  myDelta: number | null;
  myPointsBefore: number | null;
  myPointsAfter: number | null;
};

export default function EventPopup({ event }: { event: EventViewProps | null }) {
  const [seenEventId, setSeenEventId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  // 새 이벤트가 도착했을 때만(렌더 중 프롭 변화 감지) 최초 1회 팝업을 띄운다.
  // useEffect로 하면 렌더 이후 별도 커밋이 발생해 화면이 깜빡이므로,
  // 렌더 중 상태 조정(React가 권장하는 "state adjustment during render") 방식을 쓴다.
  if (event && event.id !== seenEventId) {
    setSeenEventId(event.id);
    const key = `seen_event_${event.id}`;
    const alreadySeen = typeof window !== "undefined" && sessionStorage.getItem(key);
    if (!alreadySeen) {
      setShowPopup(true);
      if (typeof window !== "undefined") sessionStorage.setItem(key, "1");
    }
  }

  if (!event) return null;

  const hasDelta = event.myDelta !== null;

  return (
    <>
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center dark:bg-neutral-900">
            <p className="text-2xl font-extrabold">🚨 이벤트 발생!</p>
            <p className="text-lg font-bold">{event.title}</p>
            {hasDelta ? (
              <>
                <p className="text-sm text-neutral-500">
                  변경 전 보유 포인트: {event.myPointsBefore!.toLocaleString()}P
                </p>
                <p className={event.myDelta! >= 0 ? "text-green-600" : "text-red-600"}>
                  점수 변화: {event.myDelta! >= 0 ? "+" : ""}
                  {event.myDelta!.toLocaleString()}P
                </p>
                <p className="text-xl font-extrabold">
                  현재 보유 포인트: {event.myPointsAfter!.toLocaleString()}P
                </p>
              </>
            ) : (
              <p className="text-sm text-neutral-500">자세한 내용은 결과에 반영됩니다.</p>
            )}
            <button
              onClick={() => setShowPopup(false)}
              className="mt-2 w-full rounded-xl bg-blue-600 py-3 font-bold text-white"
            >
              확인
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-sm dark:border-purple-900 dark:bg-purple-950">
        <p className="font-medium text-purple-700 dark:text-purple-300">최근 이벤트</p>
        <p>
          🔥 {event.title}
          {hasDelta && (
            <span>
              {" "}
              ({event.myDelta! >= 0 ? "+" : ""}
              {event.myDelta!.toLocaleString()}P)
            </span>
          )}
        </p>
      </div>
    </>
  );
}
