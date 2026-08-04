import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { toPoints } from "@/lib/points";
import RoundControls from "./RoundControls";
import ResultForm from "./ResultForm";
import NextRoundButton from "./NextRoundButton";
import LinksPanel from "./LinksPanel";
import PollRefresh from "@/components/PollRefresh";

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

  const bets = round
    ? await prisma.bet.findMany({ where: { roundId: round.id, betType: "NORMAL" } })
    : [];
  const betByTeam = new Map(bets.map((b) => [b.teamId, b]));

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") || host?.startsWith("192.168") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-6 py-10">
      <PollRefresh />
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">진행자 화면</h1>
        <p className="text-neutral-500">
          게임방 코드 <span className="font-mono font-bold">{room.code}</span> · ROUND{" "}
          {room.currentRound}
        </p>
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

      <section className="flex justify-center">
        <RoundControls
          roomCode={room.code}
          adminToken={room.adminToken}
          roundStatus={round?.status ?? "WAITING"}
        />
      </section>

      {round?.status === "BETTING" &&
        room.teams.every((t) => betByTeam.get(t.id)?.confirmed) && (
          <ResultForm
            roomCode={room.code}
            adminToken={room.adminToken}
            team1Name={room.teams[0].name}
            team2Name={room.teams[1].name}
            team1FinalBet={toPoints(betByTeam.get(room.teams[0].id)?.amount ?? BigInt(0))}
            team2FinalBet={toPoints(betByTeam.get(room.teams[1].id)?.amount ?? BigInt(0))}
            multiplier={Number(round.multiplier)}
          />
        )}

      {round?.status === "RESOLVED" && (
        <section className="flex justify-center">
          <NextRoundButton roomCode={room.code} adminToken={room.adminToken} />
        </section>
      )}

      <section className="flex justify-center">
        <LinksPanel
          links={[
            ...room.teams.map((t) => ({
              label: t.name,
              url: `${origin}/play/${room.code}/${t.accessToken}`,
            })),
            { label: "진행자 화면 (본인용 북마크)", url: `${origin}/admin/${room.code}/${room.adminToken}` },
          ]}
        />
      </section>
    </main>
  );
}
