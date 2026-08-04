import { createRoom } from "./actions";

export default function NewRoomPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold">게임방 만들기</h1>
      <form action={createRoom} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">1팀 이름</span>
          <input
            name="team1Name"
            defaultValue="1팀"
            className="rounded-lg border border-neutral-300 px-4 py-3 text-lg dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">2팀 이름</span>
          <input
            name="team2Name"
            defaultValue="2팀"
            className="rounded-lg border border-neutral-300 px-4 py-3 text-lg dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">시작 포인트</span>
          <input
            name="startPoints"
            type="number"
            defaultValue={500}
            inputMode="numeric"
            className="rounded-lg border border-neutral-300 px-4 py-3 text-lg dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-xl bg-blue-600 px-6 py-4 text-lg font-bold text-white active:scale-[0.98]"
        >
          게임방 만들기
        </button>
      </form>
    </main>
  );
}
