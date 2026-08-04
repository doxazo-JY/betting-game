"use client";

import { useState, useTransition } from "react";
import { executeEvent, type EventParams } from "./eventActions";
import { EVENT_LABELS } from "@/lib/eventLabels";
import type { EventType, TargetScope, RevealMode } from "@/generated/prisma/client";

const REVEAL_LABELS: Record<RevealMode, string> = {
  PUBLIC: "전체 공개",
  TARGET_ONLY: "대상 팀에만 공개",
  ANNOUNCE_ONLY: "발생 사실만 공개",
  SECRET: "비밀 이벤트",
};

export default function EventPanel({
  roomCode,
  adminToken,
  team1Name,
  team2Name,
  team1Points,
  team2Points,
}: {
  roomCode: string;
  adminToken: string;
  team1Name: string;
  team2Name: string;
  team1Points: number;
  team2Points: number;
}) {
  const [open, setOpen] = useState(false);
  const [eventType, setEventType] = useState<EventType>("GIVE_POINTS");
  const [targetScope, setTargetScope] = useState<TargetScope>("BOTH");
  const [revealMode, setRevealMode] = useState<RevealMode>("PUBLIC");
  const [amount, setAmount] = useState("");
  const [fromTeamNo, setFromTeamNo] = useState<1 | 2>(1);
  const [multiplier, setMultiplier] = useState("2");
  const [minAmount, setMinAmount] = useState("0");
  const [maxAmount, setMaxAmount] = useState("");
  const [reason, setReason] = useState("");
  const [memo, setMemo] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const needsTarget = ["GIVE_POINTS", "DEDUCT_POINTS", "ASSIGNED_EXTRA_BET", "FORCED_EXTRA_BET"].includes(
    eventType
  );
  const needsAmount = ["GIVE_POINTS", "DEDUCT_POINTS", "TRANSFER_POINTS", "ASSIGNED_EXTRA_BET"].includes(
    eventType
  );
  // SWAP_ALL/TRANSFER_POINTS/BET_MULTIPLIER는 항상 양 팀에 관련된 이벤트라
  // 대상 팀 선택 UI가 없다 — 팀 화면 공개 범위 판정에 쓰이는 targetScope는
  // 이때 이전 선택이 남아있지 않도록 BOTH로 고정한다.
  const effectiveTargetScope: TargetScope = needsTarget ? targetScope : "BOTH";

  function buildParams(): EventParams {
    return {
      amount: amount ? Number(amount) : undefined,
      fromTeamNo: eventType === "TRANSFER_POINTS" ? fromTeamNo : undefined,
      multiplier: eventType === "BET_MULTIPLIER" ? Number(multiplier) : undefined,
      minAmount: eventType === "FORCED_EXTRA_BET" ? Number(minAmount || 0) : undefined,
      maxAmount: eventType === "FORCED_EXTRA_BET" && maxAmount ? Number(maxAmount) : undefined,
      reason: eventType === "FORCED_EXTRA_BET" ? reason : undefined,
    };
  }

  function preview(): string[] {
    const lines: string[] = [];
    const amt = Number(amount || 0);
    if (eventType === "GIVE_POINTS" || eventType === "DEDUCT_POINTS") {
      const sign = eventType === "GIVE_POINTS" ? 1 : -1;
      if (targetScope === "TEAM1" || targetScope === "BOTH")
        lines.push(`${team1Name}: ${team1Points.toLocaleString()}P → ${(team1Points + sign * amt).toLocaleString()}P`);
      if (targetScope === "TEAM2" || targetScope === "BOTH")
        lines.push(`${team2Name}: ${team2Points.toLocaleString()}P → ${(team2Points + sign * amt).toLocaleString()}P`);
    } else if (eventType === "TRANSFER_POINTS") {
      const t1After = fromTeamNo === 1 ? team1Points - amt : team1Points + amt;
      const t2After = fromTeamNo === 1 ? team2Points + amt : team2Points - amt;
      lines.push(`${team1Name}: ${team1Points.toLocaleString()}P → ${t1After.toLocaleString()}P`);
      lines.push(`${team2Name}: ${team2Points.toLocaleString()}P → ${t2After.toLocaleString()}P`);
    } else if (eventType === "SWAP_ALL") {
      lines.push(`${team1Name}: ${team1Points.toLocaleString()}P → ${team2Points.toLocaleString()}P`);
      lines.push(`${team2Name}: ${team2Points.toLocaleString()}P → ${team1Points.toLocaleString()}P`);
    } else if (eventType === "BET_MULTIPLIER") {
      lines.push(`이번 라운드 승리/패배 포인트에 ${multiplier}배 적용`);
    } else if (eventType === "ASSIGNED_EXTRA_BET") {
      if (targetScope === "TEAM1" || targetScope === "BOTH") lines.push(`${team1Name}: 추가 배팅 ${amt.toLocaleString()}P 적용`);
      if (targetScope === "TEAM2" || targetScope === "BOTH") lines.push(`${team2Name}: 추가 배팅 ${amt.toLocaleString()}P 적용`);
    } else if (eventType === "FORCED_EXTRA_BET") {
      const range = maxAmount ? `${minAmount}~${maxAmount}P` : `${minAmount}P 이상`;
      if (targetScope === "TEAM1" || targetScope === "BOTH") lines.push(`${team1Name}: ${range} 추가 배팅 요청`);
      if (targetScope === "TEAM2" || targetScope === "BOTH") lines.push(`${team2Name}: ${range} 추가 배팅 요청`);
    }
    return lines;
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await executeEvent(roomCode, adminToken, eventType, effectiveTargetScope, buildParams(), revealMode, memo || undefined);
        setConfirming(false);
        setOpen(false);
        setAmount("");
        setMemo("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "이벤트 실행에 실패했습니다");
        setConfirming(false);
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border-2 border-purple-300 px-6 py-3 font-bold text-purple-600 dark:border-purple-800"
      >
        🎲 이벤트
      </button>
    );
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-purple-300 p-5 dark:border-purple-800">
        <p className="font-bold">{EVENT_LABELS[eventType]} 이벤트를 실행하시겠습니까?</p>
        {preview().map((line, i) => (
          <p key={i} className="text-sm">
            {line}
          </p>
        ))}
        <p className="text-xs text-neutral-500">공개 방식: {REVEAL_LABELS[revealMode]}</p>
        <div className="flex gap-3">
          <button
            disabled={isPending}
            onClick={() => setConfirming(false)}
            className="flex-1 rounded-xl border-2 border-neutral-300 py-3 font-bold dark:border-neutral-700"
          >
            취소
          </button>
          <button
            disabled={isPending}
            onClick={submit}
            className="flex-1 rounded-xl bg-purple-600 py-3 font-bold text-white disabled:opacity-50"
          >
            실행
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-purple-300 p-5 dark:border-purple-800">
      <div className="flex items-center justify-between">
        <p className="font-bold">이벤트 실행</p>
        <button onClick={() => setOpen(false)} className="text-xs text-neutral-400">
          닫기
        </button>
      </div>

      <select
        value={eventType}
        onChange={(e) => setEventType(e.target.value as EventType)}
        className="rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
      >
        {Object.entries(EVENT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {needsTarget && (
        <div className="flex gap-2">
          {(["TEAM1", "TEAM2", "BOTH"] as TargetScope[]).map((scope) => (
            <button
              key={scope}
              onClick={() => setTargetScope(scope)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                targetScope === scope
                  ? "bg-purple-600 text-white"
                  : "border border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {scope === "TEAM1" ? team1Name : scope === "TEAM2" ? team2Name : "양 팀"}
            </button>
          ))}
        </div>
      )}

      {needsAmount && (
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          placeholder="포인트"
          className="rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      )}

      {eventType === "TRANSFER_POINTS" && (
        <div className="flex gap-2">
          <button
            onClick={() => setFromTeamNo(1)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${fromTeamNo === 1 ? "bg-purple-600 text-white" : "border border-neutral-300 dark:border-neutral-700"}`}
          >
            {team1Name} → {team2Name}
          </button>
          <button
            onClick={() => setFromTeamNo(2)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${fromTeamNo === 2 ? "bg-purple-600 text-white" : "border border-neutral-300 dark:border-neutral-700"}`}
          >
            {team2Name} → {team1Name}
          </button>
        </div>
      )}

      {eventType === "BET_MULTIPLIER" && (
        <input
          value={multiplier}
          onChange={(e) => setMultiplier(e.target.value)}
          inputMode="decimal"
          placeholder="배수 (예: 2)"
          className="rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      )}

      {eventType === "FORCED_EXTRA_BET" && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="최소 금액"
              className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <input
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="최대 금액 (선택)"
              className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="사유 (선택)"
            className="rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-xs text-neutral-500">공개 방식</span>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(REVEAL_LABELS) as [RevealMode, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setRevealMode(value)}
              className={`rounded-lg py-2 text-xs font-medium ${
                revealMode === value
                  ? "bg-purple-600 text-white"
                  : "border border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <input
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="진행자 메모 (선택)"
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={() => setConfirming(true)}
        className="rounded-xl bg-purple-600 py-3 font-bold text-white"
      >
        다음
      </button>
    </div>
  );
}
