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
        className="border-2 border-dashed border-ink-faint px-6 py-3 text-sm font-bold text-ink-soft"
      >
        접속 링크 보기
      </button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3 border-2 border-dashed border-ink-faint p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-black">접속 링크</p>
        <button onClick={() => setOpen(false)} className="text-xs font-bold text-ink-faint">
          숨기기
        </button>
      </div>
      {links.map((l) => (
        <CopyableLink key={l.label} label={l.label} url={l.url} />
      ))}
    </div>
  );
}
