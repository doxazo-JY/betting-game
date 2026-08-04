"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-lg font-semibold text-red-600">{error.message || "오류가 발생했습니다"}</p>
      <button
        onClick={reset}
        className="rounded-xl bg-neutral-800 px-6 py-3 font-bold text-white dark:bg-neutral-200 dark:text-black"
      >
        다시 시도
      </button>
    </main>
  );
}
