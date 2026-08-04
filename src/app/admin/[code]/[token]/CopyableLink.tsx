"use client";

import { useState } from "react";

export default function CopyableLink({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 truncate rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="shrink-0 rounded-lg bg-neutral-800 px-3 py-2 text-xs font-bold text-white dark:bg-neutral-200 dark:text-black"
        >
          {copied ? "복사됨" : "복사"}
        </button>
      </div>
    </div>
  );
}
