"use client";

import { useState } from "react";

export default function CopyableLink({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold text-ink-soft">{label}</span>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 truncate border-2 border-ink bg-paper-2 px-3 py-2 text-xs"
        />
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="shrink-0 border-2 border-ink bg-ink px-3 py-2 text-xs font-black text-paper-2"
        >
          {copied ? "복사됨" : "복사"}
        </button>
      </div>
    </div>
  );
}
