"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-lg font-black text-red-600">{error.message || "오류가 발생했습니다"}</p>
      <button
        onClick={reset}
        className="border-2 border-ink bg-ink px-6 py-3 font-black text-paper-2 shadow-sticker-sm"
      >
        다시 시도
      </button>
    </main>
  );
}
