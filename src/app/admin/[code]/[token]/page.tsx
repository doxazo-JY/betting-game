import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { toPoints } from "@/lib/points";
import { computeFinalBetAmount } from "@/lib/game";
import ResultForm from "./ResultForm";
import NextRoundButton from "./NextRoundButton";
import LinksPanel from "./LinksPanel";
import GameFlowPanel from "./GameFlowPanel";
import GameControls from "./GameControls";
import PollRefresh from "@/components/PollRefresh";
import FinalRanking from "@/components/FinalRanking";
import RoundHistoryTable from "@/components/RoundHistoryTable";
import { getRoundHistory } from "@/lib/roundHistory";
import RegisterRecentGame from "./RegisterRecentGame";
import UndoButton from "./UndoButton";
import { undoEvent } from "./undoActions";
import { getActiveMultiplierEvent } from "@/lib/activeMultiplier";

export default async function AdminPage({
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

  const round = await prisma.round.findUnique({
    where: { roomId_roundNo: { roomId: room.id, roundNo: room.currentRound } },
  });

  const bets = round ? await prisma.bet.findMany({ where: { roundId: round.id } }) : [];
  const betByTeam = new Map(bets.map((b) => [b.teamId, b]));

  const activeMultiplierEvent = await getActiveMultiplierEvent(room.id, round?.id, round?.status);

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") || host?.startsWith("192.168") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-6 py-10">
      <PollRefresh />
      <RegisterRecentGame
        code={room.code}
        adminToken={room.adminToken}
        team1Name={room.teams[0].name}
        team2Name={room.teams[1].name}
      />
      <header className="flex items-start justify-between gap-1">
        <div>
          <h1 className="text-2xl font-bold">진행자 화면</h1>
          <p className="text-neutral-500">
            게임방 코드 <span className="font-mono font-bold">{room.code}</span> · ROUND{" "}
            {room.currentRound}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Link href="/" className="text-sm text-blue-600">
            홈으로
          </Link>
          <Link href={`/admin/${room.code}/${room.adminToken}/history`} className="text-sm text-blue-600">
            기록/되돌리기
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4">
        {room.teams.map((team) => {
          const bet = betByTeam.get(team.id);
          return (
            <div
              key={team.id}
              className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <span className="font-bold">{team.name}</span>
              <p className="text-2xl font-extrabold tabular-nums">
                {toPoints(team.currentPoints).toLocaleString()}P
              </p>
              {round && round.status !== "WAITING" && (
                <p className="text-sm">
                  배팅:{" "}
                  {bet?.confirmed ? (
                    <span className="font-bold">{toPoints(bet.amount).toLocaleString()}P</span>
                  ) : (
                    <span className="text-neutral-400">대기 중</span>
                  )}
                </p>
              )}
            </div>
          );
        })}
      </section>

      {activeMultiplierEvent && round && Number(round.multiplier) !== 1 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-purple-300 bg-purple-50 px-4 py-3 text-center dark:border-purple-800 dark:bg-purple-950">
          <p className="font-bold text-purple-700 dark:text-purple-300">
            🎲 배팅 배수 {Number(round.multiplier)}배 적용 중
          </p>
          <UndoButton
            label="이 이벤트 취소"
            onUndo={undoEvent.bind(null, room.code, room.adminToken, activeMultiplierEvent.id)}
          />
        </div>
      )}

      {room.status === "ENDED" ? (
        <>
          <FinalRanking
            team1Name={room.teams[0].name}
            team2Name={room.teams[1].name}
            team1Points={toPoints(room.teams[0].currentPoints)}
            team2Points={toPoints(room.teams[1].currentPoints)}
          />
          <RoundHistoryTable
            team1Name={room.teams[0].name}
            team2Name={room.teams[1].name}
            entries={await getRoundHistory(room.id, room.teams[0].id, room.teams[1].id)}
          />
        </>
      ) : (
        <>
          <section className="flex justify-center">
            <GameFlowPanel
              roomCode={room.code}
              adminToken={room.adminToken}
              roundStatus={round?.status ?? "WAITING"}
              team1Name={room.teams[0].name}
              team2Name={room.teams[1].name}
              team1Points={toPoints(room.teams[0].currentPoints)}
              team2Points={toPoints(room.teams[1].currentPoints)}
            />
          </section>

          {round?.status === "BETTING" &&
            room.teams.every((t) => betByTeam.get(t.id)?.confirmed) && (
              <ResultForm
                roomCode={room.code}
                adminToken={room.adminToken}
                team1Name={room.teams[0].name}
                team2Name={room.teams[1].name}
                team1FinalBet={toPoints(await computeFinalBetAmount(round.id, room.teams[0].id))}
                team2FinalBet={toPoints(await computeFinalBetAmount(round.id, room.teams[1].id))}
                multiplier={Number(round.multiplier)}
              />
            )}

          {round?.status === "RESOLVED" && (
            <section className="flex justify-center">
              <NextRoundButton roomCode={room.code} adminToken={room.adminToken} />
            </section>
          )}
        </>
      )}

      <section className="flex justify-center">
        <GameControls roomCode={room.code} adminToken={room.adminToken} />
      </section>

      <section className="flex justify-center">
        <LinksPanel
          links={[
            ...room.teams.map((t) => ({
              label: t.name,
              url: `${origin}/play/${room.code}/${t.accessToken}`,
            })),
            { label: "중계 화면 (TV용)", url: `${origin}/watch/${room.code}` },
            { label: "진행자 화면 (본인용 북마크)", url: `${origin}/admin/${room.code}/${room.adminToken}` },
          ]}
        />
      </section>
    </main>
  );
}
