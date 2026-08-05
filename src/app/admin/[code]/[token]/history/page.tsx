import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { toPoints } from "@/lib/points";
import { EVENT_LABELS } from "@/lib/eventLabels";
import { undoRoundResult, undoEvent, undoManualAdjust } from "../undoActions";
import UndoButton from "../UndoButton";
import ManualAdjustForm from "../ManualAdjustForm";
import ResetButton from "../ResetButton";

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ code: string; token: string }>;
}) {
  const { code, token } = await params;

  const room = await prisma.room.findUnique({
    where: { code },
    include: { teams: { orderBy: { teamNo: "asc" } } },
  });
  if (!room || room.adminToken !== token) {
    notFound();
  }

  const teamNameById = new Map(room.teams.map((t) => [t.id, t.name]));

  const rounds = await prisma.round.findMany({
    where: { roomId: room.id, roundResults: { some: {} } },
    include: { roundResults: true },
    orderBy: { roundNo: "desc" },
  });

  const events = await prisma.eventLog.findMany({
    where: { roomId: room.id },
    orderBy: { executedAt: "desc" },
  });

  const manualAdjustments = await prisma.scoreTransaction.findMany({
    where: { roomId: room.id, sourceType: "MANUAL_ADJUST" },
    orderBy: { createdAt: "desc" },
  });
  const revertedSourceIds = new Set(
    (
      await prisma.scoreTransaction.findMany({
        where: { roomId: room.id, sourceType: "REVERT" },
        select: { sourceId: true },
      })
    ).map((r) => r.sourceId)
  );

  const allTransactions = await prisma.scoreTransaction.findMany({
    where: { roomId: room.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">기록 / 되돌리기</h1>
        <Link href={`/admin/${room.code}/${room.adminToken}`} className="text-sm text-blue-600">
          진행자 화면으로
        </Link>
      </header>

      <ManualAdjustForm
        roomCode={room.code}
        adminToken={room.adminToken}
        team1Name={room.teams[0].name}
        team2Name={room.teams[1].name}
      />

      <section className="flex flex-col gap-3">
        <p className="font-bold">라운드 결과</p>
        {rounds.length === 0 && <p className="text-sm text-neutral-400">아직 적용된 결과가 없습니다.</p>}
        {rounds.map((round) => {
          const anyReverted = round.roundResults.some((r) => r.reverted);
          return (
            <div
              key={round.id}
              className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
            >
              <div className="text-sm">
                <p className="font-medium">ROUND {round.roundNo}</p>
                {round.roundResults.map((r) => (
                  <p key={r.id} className={r.reverted ? "text-neutral-400 line-through" : "text-neutral-500"}>
                    {teamNameById.get(r.teamId)}: {r.outcome === "WIN" ? "승리" : "패배"} (
                    {toPoints(r.finalBetAmount).toLocaleString()}P)
                  </p>
                ))}
              </div>
              {!anyReverted && (
                <UndoButton
                  label="되돌리기"
                  onUndo={undoRoundResult.bind(null, room.code, room.adminToken, round.id)}
                />
              )}
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-3">
        <p className="font-bold">이벤트 기록</p>
        {events.length === 0 && <p className="text-sm text-neutral-400">아직 실행된 이벤트가 없습니다.</p>}
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
          >
            <div className="text-sm">
              <p className={event.reverted ? "font-medium text-neutral-400 line-through" : "font-medium"}>
                {EVENT_LABELS[event.eventType]}
              </p>
              <p className="text-xs text-neutral-500">{event.executedAt.toLocaleString("ko-KR")}</p>
            </div>
            {!event.reverted && (
              <UndoButton label="되돌리기" onUndo={undoEvent.bind(null, room.code, room.adminToken, event.id)} />
            )}
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <p className="font-bold">점수 직접 수정 기록</p>
        {manualAdjustments.length === 0 && (
          <p className="text-sm text-neutral-400">아직 직접 수정한 내역이 없습니다.</p>
        )}
        {manualAdjustments.map((tx) => {
          const reverted = revertedSourceIds.has(tx.id);
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
            >
              <div className="text-sm">
                <p className={reverted ? "font-medium text-neutral-400 line-through" : "font-medium"}>
                  {teamNameById.get(tx.teamId)}: {toPoints(tx.pointsDelta) >= 0 ? "+" : ""}
                  {toPoints(tx.pointsDelta).toLocaleString()}P
                </p>
                <p className="text-xs text-neutral-500">{tx.createdAt.toLocaleString("ko-KR")}</p>
                {tx.memo && <p className="text-xs text-neutral-400">메모: {tx.memo}</p>}
              </div>
              {!reverted && (
                <UndoButton
                  label="되돌리기"
                  onUndo={undoManualAdjust.bind(null, room.code, room.adminToken, tx.id)}
                />
              )}
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-2">
        <p className="font-bold">전체 점수 변경 기록</p>
        <div className="flex flex-col gap-1 text-xs text-neutral-500">
          {allTransactions.map((tx) => (
            <p key={tx.id}>
              [{tx.createdAt.toLocaleString("ko-KR")}] {teamNameById.get(tx.teamId)} · {tx.sourceType}{" "}
              {toPoints(tx.pointsDelta) >= 0 ? "+" : ""}
              {toPoints(tx.pointsDelta).toLocaleString()}P → {toPoints(tx.pointsAfter).toLocaleString()}P
            </p>
          ))}
        </div>
      </section>

      <section className="flex justify-center border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <ResetButton roomCode={room.code} adminToken={room.adminToken} />
      </section>
    </main>
  );
}
