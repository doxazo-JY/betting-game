"use client";

import { useState } from "react";
import CopyableLink from "./CopyableLink";

export default function LinksPanel({
  links,
}: {
  links: { label: string; url: string }[];
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border-2 border-dashed border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-500 dark:border-neutral-700"
      >
        접속 링크 보기
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed border-neutral-300 p-4 dark:border-neutral-700">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">접속 링크</p>
        <button onClick={() => setOpen(false)} className="text-xs text-neutral-400">
          숨기기
        </button>
      </div>
      {links.map((l) => (
        <CopyableLink key={l.label} label={l.label} url={l.url} />
      ))}
    </div>
  );
}
