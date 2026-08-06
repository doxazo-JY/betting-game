import Link from "next/link";
import { getCurrentRoom } from "@/lib/currentRoom";
import HomeGate from "@/components/HomeGate";

// 참가자 잠금 여부를 매번 새로 확인해야 하는 페이지라 캐싱하면 안 된다.
export const dynamic = "force-dynamic";

export default async function Home() {
  const room = await getCurrentRoom();
  const locked = room?.participantsLocked ?? false;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-8 px-6 py-10 text-center">
      <div className="flex flex-col items-center gap-1">
        <span className="border-2 border-ink bg-ink px-4 py-1 text-xs font-black tracking-wide text-paper-2">
          하계수련회
        </span>
        <h1 className="pixel-outline mt-2 text-4xl font-black leading-tight text-win">
          2026
          <br />
          인투 오락실
        </h1>
      </div>
      <HomeGate locked={locked}>
        <div className="flex w-full flex-col gap-4">
          <Link
            href="/play/1"
            className="border-2 border-ink bg-team-red px-6 py-5 text-lg font-black text-white shadow-sticker-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            1팀 접속
          </Link>
          <Link
            href="/play/2"
            className="border-2 border-ink bg-team-blue px-6 py-5 text-lg font-black text-white shadow-sticker-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            2팀 접속
          </Link>
          <Link
            href="/watch"
            className="border-2 border-ink bg-paper-2 px-6 py-5 text-lg font-black shadow-sticker-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            중계 화면 열기
          </Link>
        </div>
      </HomeGate>
    </main>
  );
}
