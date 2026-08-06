import { notFound } from "next/navigation";
import { toPoints } from "@/lib/points";
import { getCurrentRoom } from "@/lib/currentRoom";
import PollRefresh from "@/components/PollRefresh";
import FinalRanking from "@/components/FinalRanking";
import RoundHistoryTable from "@/components/RoundHistoryTable";
import { getRoundHistory } from "@/lib/roundHistory";
import ActiveMultiplierBanner from "@/components/ActiveMultiplierBanner";
import { getActiveMultiplierEvent } from "@/lib/activeMultiplier";
import { prisma } from "@/lib/prisma";

// 실시간 게임 상태를 보여주는 페이지라 절대 캐싱하면 안 된다.
export const dynamic = "force-dynamic";

export default async function WatchPage() {
  const room = await getCurrentRoom();
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

  const activeMultiplierEvent = await getActiveMultiplierEvent(room.id, round?.id, round?.status);

  const bothConfirmed = [team1, team2].every((t) => betByTeam.get(t.id)?.confirmed);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col items-center justify-center gap-8 px-6 py-10 text-center">
      <PollRefresh intervalMs={2000} />
      <div className="inline-flex items-center gap-3 border-2 border-ink bg-win px-5 py-2 text-ink">
        <span className="text-lg font-black">★ ROUND {room.currentRound}</span>
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
          <div className="grid w-full grid-cols-2 gap-6">
            {[team1, team2].map((team) => {
              const result = resultByTeam.get(team.id);
              const bet = betByTeam.get(team.id);
              const isRed = team.teamNo === 1;
              const defaultName = team.teamNo === 1 ? "1팀" : "2팀";
              const joined = team.name !== defaultName;
              return (
                <div
                  key={team.id}
                  className={
                    "flex flex-col items-center gap-3 border-[3px] border-ink p-8 text-white shadow-sticker transition-opacity " +
                    (isRed ? "bg-team-red" : "bg-team-blue") +
                    (joined ? "" : " opacity-35")
                  }
                >
                  <p className="text-2xl font-black">
                    {joined ? team.name : `${defaultName} · 입장 대기 중`}
                  </p>
                  <p className="text-6xl font-black tabular-nums">
                    {toPoints(team.currentPoints).toLocaleString()}P
                  </p>
                  {result && (
                    <>
                      <p
                        className={
                          "border-2 border-ink px-4 py-1 text-xl font-black " +
                          (result.outcome === "WIN" ? "bg-win text-ink" : "bg-lose-tint text-lose-ink")
                        }
                      >
                        {result.outcome === "WIN" ? "WIN!" : "GAME OVER"}
                      </p>
                      <p className="font-bold text-white/85">
                        {toPoints(result.finalBetAmount).toLocaleString()}P 배팅
                      </p>
                    </>
                  )}
                  {round?.status === "BETTING" && (
                    <p
                      className={
                        "text-lg font-black " + (bet?.confirmed ? "text-win" : "text-white/70")
                      }
                    >
                      {bet?.confirmed ? "✓ 배팅 완료" : "⋯ 배팅 대기"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {(!round || round.status === "WAITING") && (
            <p className="text-xl font-bold text-ink-soft">라운드 시작을 기다리는 중...</p>
          )}
          {round?.status === "BETTING" && bothConfirmed && (
            <p className="text-xl font-black text-event-ink">게임 진행 중</p>
          )}

          {activeMultiplierEvent && round && (
            <ActiveMultiplierBanner multiplier={Number(round.multiplier)} />
          )}
        </>
      )}
    </main>
  );
}
