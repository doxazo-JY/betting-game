"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WatchEntryPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed) router.push(`/watch/${trimmed}`);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-10">
      <h1 className="text-center text-2xl font-bold">중계 화면</h1>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="게임방 코드"
          autoCapitalize="characters"
          className="rounded-lg border border-neutral-300 px-4 py-3 text-center text-lg uppercase dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          className="rounded-xl bg-blue-600 py-4 text-lg font-bold text-white active:scale-[0.98]"
        >
          중계 화면 열기
        </button>
      </form>
    </main>
  );
}
