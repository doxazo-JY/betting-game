import Link from "next/link";
import RecentGamesList from "@/components/RecentGamesList";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-8 px-6 py-10 text-center">
      <h1 className="text-3xl font-bold">2팀 실시간 배팅 게임</h1>
      <div className="flex w-full flex-col gap-4">
        <Link
          href="/new"
          className="rounded-xl bg-blue-600 px-6 py-5 text-lg font-bold text-white active:scale-[0.98]"
        >
          진행자로 게임방 만들기
        </Link>
        <Link
          href="/watch"
          className="rounded-xl border-2 border-neutral-300 px-6 py-5 text-lg font-bold active:scale-[0.98] dark:border-neutral-700"
        >
          중계 화면 열기
        </Link>
        <p className="text-sm text-neutral-500">
          팀 대표는 진행자에게 받은 접속 링크로 바로 들어가시면 됩니다.
        </p>
      </div>
      <RecentGamesList />
    </main>
  );
}
