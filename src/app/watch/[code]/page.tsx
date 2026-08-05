import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { toPoints } from "@/lib/points";
import { EVENT_LABELS } from "@/lib/eventLabels";
import PollRefresh from "@/components/PollRefresh";
import FinalRanking from "@/components/FinalRanking";
import RoundHistoryTable from "@/components/RoundHistoryTable";
import { getRoundHistory } from "@/lib/roundHistory";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const room = await prisma.room.findUnique({
    where: { code },
    include: { teams: { orderBy: { teamNo: "asc" } } },
  });
  if (!room) {
    notFound();
  }

  const [team1, team2] = room.teams;

  const round = await prisma.round.findUnique({
    where: { roomId_roundNo: { roomId: room.id, roundNo: room.currentRound } },
  });

  const results = round
    ? await prisma.roundResult.findMany({ where: { roundId: round.id, reverted: false } })
    : [];
  const resultByTeam = new Map(results.map((r) => [r.teamId, r]));

  const bets = round ? await prisma.bet.findMany({ where: { roundId: round.id } }) : [];
  const betByTeam = new Map(bets.map((b) => [b.teamId, b]));

  const latestEvent = await prisma.eventLog.findFirst({
    where: { roomId: room.id, reverted: false },
    orderBy: { executedAt: "desc" },
  });

  const bothConfirmed = [team1, team2].every((t) => betByTeam.get(t.id)?.confirmed);

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col items-center justify-center gap-10 px-6 py-10 text-center">
      <PollRefresh intervalMs={2000} />
      <div>
        <p className="text-xl text-neutral-400">게임방 {room.code}</p>
        <p className="text-3xl font-bold text-neutral-300">ROUND {room.currentRound}</p>
      </div>

      {room.status === "ENDED" ? (
        <>
          <FinalRanking
            team1Name={team1.name}
            team2Name={team2.name}
            team1Points={toPoints(team1.currentPoints)}
            team2Points={toPoints(team2.currentPoints)}
          />
          <RoundHistoryTable
            team1Name={team1.name}
            team2Name={team2.name}
            entries={await getRoundHistory(room.id, team1.id, team2.id)}
          />
        </>
      ) : (
        <>
          <div className="grid w-full grid-cols-2 gap-8">
            {[team1, team2].map((team) => {
              const result = resultByTeam.get(team.id);
              const bet = betByTeam.get(team.id);
              return (
                <div key={team.id} className="flex flex-col items-center gap-3">
                  <p className="text-3xl font-bold">{team.name}</p>
                  <p className="text-6xl font-extrabold tabular-nums">
                    {toPoints(team.currentPoints).toLocaleString()}P
                  </p>
                  {result && (
                    <p
                      className={
                        result.outcome === "WIN"
                          ? "text-2xl font-bold text-green-500"
                          : "text-2xl font-bold text-red-500"
                      }
                    >
                      {result.outcome === "WIN" ? "🏆 승리" : "💥 패배"}
                    </p>
                  )}
                  {round?.status === "BETTING" && (
                    <p
                      className={
                        bet?.confirmed ? "text-lg font-bold text-green-500" : "text-lg text-neutral-400"
                      }
                    >
                      {bet?.confirmed ? "✅ 배팅 완료" : "⏳ 배팅 대기"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {(!round || round.status === "WAITING") && (
            <p className="text-xl text-neutral-400">라운드 시작을 기다리는 중...</p>
          )}
          {round?.status === "BETTING" && bothConfirmed && (
            <p className="text-xl font-bold text-blue-400">🎮 게임 진행 중</p>
          )}

          {latestEvent && (
            <div className="rounded-2xl border border-purple-300 bg-purple-50 px-8 py-4 text-xl font-bold text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
              🚨 이벤트 발생: {EVENT_LABELS[latestEvent.eventType]}
            </div>
          )}
        </>
      )}
    </main>
  );
}
