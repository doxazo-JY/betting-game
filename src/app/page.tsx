import Link from "next/link";
import RecentGamesList from "@/components/RecentGamesList";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-8 px-6 py-10 text-center">
      <div className="flex flex-col items-center gap-1">
        <span className="border-2 border-ink bg-ink px-4 py-1 text-xs font-black tracking-wide text-paper-2">
          하계수련회
        </span>
        <h1 className="pixel-outline mt-2 text-4xl font-black leading-tight text-win">
          2팀 실시간
          <br />
          배팅 게임
        </h1>
      </div>
      <div className="flex w-full flex-col gap-4">
        <Link
          href="/new"
          className="border-2 border-ink bg-team-red px-6 py-5 text-lg font-black text-white shadow-sticker-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          ▶ 진행자로 게임방 만들기
        </Link>
        <Link
          href="/watch"
          className="border-2 border-ink bg-paper-2 px-6 py-5 text-lg font-black shadow-sticker-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          🖥 중계 화면 열기
        </Link>
        <p className="text-sm font-semibold text-ink-soft">
          팀 대표는 진행자에게 받은 접속 링크로 바로 들어가시면 됩니다.
        </p>
      </div>
      <RecentGamesList />
    </main>
  );
}
