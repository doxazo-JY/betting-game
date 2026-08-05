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
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-6 py-10">
      <h1 className="text-center text-2xl font-black">중계 화면</h1>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="게임방 코드"
          autoCapitalize="characters"
          className="border-2 border-ink bg-paper-2 px-4 py-3 text-center text-lg font-bold uppercase"
        />
        <button
          type="submit"
          className="border-2 border-ink bg-team-red py-4 text-lg font-black text-white shadow-sticker-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          중계 화면 열기
        </button>
      </form>
    </main>
  );
}
