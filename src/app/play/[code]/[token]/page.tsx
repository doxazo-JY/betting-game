import { prisma } from "@/lib/prisma";
import { toPoints } from "@/lib/points";
import { getVisibleEventForTeam } from "@/lib/events";
import { notFound } from "next/navigation";
import BetForm from "./BetForm";
import EventPopup from "./EventPopup";
import PollRefresh from "@/components/PollRefresh";
import FinalRanking from "@/components/FinalRanking";
import RoundHistoryTable from "@/components/RoundHistoryTable";
import { getRoundHistory } from "@/lib/roundHistory";
import ActiveMultiplierBanner from "@/components/ActiveMultiplierBanner";
import { getActiveMultiplierEvent } from "@/lib/activeMultiplier";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ code: string; token: string }>;
}) {
  const { code, token } = await params;

  const room = await prisma.room.findUnique({
    where: { code },
    include: { teams: true },
  });

  if (!room) {
    notFound();
  }

  const me = room.teams.find((t) => t.accessToken === token);
  if (!me) {
    notFound();
  }
  const opponent = room.teams.find((t) => t.id !== me.id)!;

  const round = await prisma.round.findUnique({
    where: { roomId_roundNo: { roomId: room.id, roundNo: room.currentRound } },
  });

  const myBet = round
    ? await prisma.bet.findUnique({
        where: { roundId_teamId: { roundId: round.id, teamId: me.id } },
      })
    : null;

  const opponentBet = round
    ? await prisma.bet.findUnique({
        where: { roundId_teamId: { roundId: round.id, teamId: opponent.id } },
      })
    : null;

  const myResult =
    round?.status === "RESOLVED"
      ? await prisma.roundResult.findUnique({
          where: { roundId_teamId: { roundId: round.id, teamId: me.id } },
        })
      : null;

  // 배팅 금액은 라운드가 끝나기 전까지만 비공개다. 결과가 나온 뒤에는
  // 상대 팀 배팅 금액도 공개해도 된다.
  const opponentResult =
    round?.status === "RESOLVED"
      ? await prisma.roundResult.findUnique({
          where: { roundId_teamId: { roundId: round.id, teamId: opponent.id } },
        })
      : null;

  const visibleEvent = await getVisibleEventForTeam(room.id, me);
  const activeMultiplierEvent = await getActiveMultiplierEvent(room.id, round?.id, round?.status);

  const maxBet =
    me.currentPoints > BigInt(0) ? toPoints(me.currentPoints) : toPoints(room.negativeBetLimit);

  function calcResultAmount(result: { outcome: string; finalBetAmount: bigint }) {
    return result.outcome === "WIN"
      ? Math.trunc(toPoints(result.finalBetAmount) * Number(round!.multiplier))
      : toPoints(result.finalBetAmount);
  }

  const resultAmount = myResult ? calcResultAmount(myResult) : 0;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-6 py-10">
      <PollRefresh />
      <header className="text-center">
        <p className="text-lg font-bold">{me.name}</p>
        <p className="mt-4 text-sm text-neutral-500">현재 보유 포인트</p>
        <p className="text-5xl font-extrabold tabular-nums tracking-tight">
          {toPoints(me.currentPoints).toLocaleString()}P
        </p>
      </header>

      {room.status === "ENDED" ? (
        <>
          <FinalRanking
            team1Name={room.teams.find((t) => t.teamNo === 1)!.name}
            team2Name={room.teams.find((t) => t.teamNo === 2)!.name}
            team1Points={toPoints(room.teams.find((t) => t.teamNo === 1)!.currentPoints)}
            team2Points={toPoints(room.teams.find((t) => t.teamNo === 2)!.currentPoints)}
          />
          <RoundHistoryTable
            team1Name={room.teams.find((t) => t.teamNo === 1)!.name}
            team2Name={room.teams.find((t) => t.teamNo === 2)!.name}
            entries={await getRoundHistory(
              room.id,
              room.teams.find((t) => t.teamNo === 1)!.id,
              room.teams.find((t) => t.teamNo === 2)!.id
            )}
          />
        </>
      ) : (
        <>
          <p className="text-center text-neutral-500">ROUND {room.currentRound}</p>

          <EventPopup event={visibleEvent} />

          {activeMultiplierEvent && round && (
            <ActiveMultiplierBanner multiplier={Number(round.multiplier)} />
          )}

          {round?.status === "BETTING" && !myBet?.confirmed && (
            <BetForm roomCode={room.code} teamToken={me.accessToken} maxBet={maxBet} />
          )}

          {round?.status === "BETTING" && myBet?.confirmed && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-green-300 p-6 text-center dark:border-green-800">
              <p className="text-xl font-bold">✅ 배팅 완료</p>
              {opponentBet?.confirmed ? (
                <p className="text-sm text-neutral-500">
                  🎮 게임이 진행되고 있어요! 결과에 따라 포인트를 얻거나 잃어요.
                </p>
              ) : (
                <p className="text-sm text-neutral-500">상대 팀 배팅을 기다리는 중이에요.</p>
              )}
              <p className="mt-2 text-xs text-neutral-400">
                상대 팀: {opponentBet?.confirmed ? "배팅 완료" : "배팅 대기 중"}
              </p>
            </div>
          )}

          {myResult && (
            <div
              className={
                myResult.outcome === "WIN"
                  ? "flex flex-col items-center gap-2 rounded-xl border border-green-400 bg-green-50 p-6 text-center dark:border-green-700 dark:bg-green-950"
                  : "flex flex-col items-center gap-2 rounded-xl border border-red-400 bg-red-50 p-6 text-center dark:border-red-700 dark:bg-red-950"
              }
            >
              <p className="text-2xl font-extrabold">
                {myResult.outcome === "WIN" ? "🏆 승리!" : "💥 패배"}
              </p>
              <p className="text-sm">
                최종 배팅 포인트: {toPoints(myResult.finalBetAmount).toLocaleString()}P
              </p>
              <p className={myResult.outcome === "WIN" ? "text-sm text-green-600" : "text-sm text-red-600"}>
                {myResult.outcome === "WIN" ? "획득" : "차감"} 포인트:{" "}
                {myResult.outcome === "WIN" ? "+" : "-"}
                {resultAmount.toLocaleString()}P
              </p>
            </div>
          )}

          {opponentResult && (
            <div className="flex flex-col items-center gap-1 rounded-xl border border-neutral-200 p-4 text-center text-sm dark:border-neutral-800">
              <p className="font-medium text-neutral-500">{opponent.name} 결과</p>
              <p>
                {toPoints(opponentResult.finalBetAmount).toLocaleString()}P 배팅 ·{" "}
                {opponentResult.outcome === "WIN" ? "승리" : "패배"}{" "}
                <span className={opponentResult.outcome === "WIN" ? "text-green-600" : "text-red-600"}>
                  ({opponentResult.outcome === "WIN" ? "+" : "-"}
                  {calcResultAmount(opponentResult).toLocaleString()}P)
                </span>
              </p>
            </div>
          )}

          {(!round || round.status === "WAITING") && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 p-6 text-center dark:border-neutral-800">
              <p className="text-neutral-500">라운드 시작을 기다리고 있어요.</p>
              <p className="text-xs text-neutral-400">상대 팀: {opponent.name}</p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
