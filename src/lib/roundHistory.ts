import { prisma } from "@/lib/prisma";
import { toPoints } from "@/lib/points";

export type RoundHistoryTeamResult = {
  finalBet: number;
  outcome: "WIN" | "LOSE";
  delta: number;
  pointsBefore: number;
  pointsAfter: number;
};

export type SwapPointsEntry = {
  before: number;
  after: number;
};

export type RoundHistoryEntry = {
  roundNo: number;
  team1: RoundHistoryTeamResult | null;
  team2: RoundHistoryTeamResult | null;
  multiplier: number | null;
  swapAllBefore: boolean;
  swapTeam1: SwapPointsEntry | null;
  swapTeam2: SwapPointsEntry | null;
};

// 게임 종료 후에는 배팅 금액을 공개해도 상관없으므로, 라운드별 배팅/결과
// 내역을 정리해서 보여준다. 이벤트도 같이 표시한다 — 배팅 배수는 해당
// 라운드의 multiplier 필드가 곧 그 정보라 별도 조회 없이 판단 가능하고,
// 전체 점수 교환은 EventLog.roundId(항상 "그 다음 라운드"에 연결됨,
// WAITING 상태에서만 실행 가능하므로)로 판단한다.
export async function getRoundHistory(
  roomId: string,
  team1Id: string,
  team2Id: string
): Promise<RoundHistoryEntry[]> {
  const rounds = await prisma.round.findMany({
    where: { roomId },
    include: { roundResults: { where: { reverted: false } } },
    orderBy: { roundNo: "asc" },
  });

  const swapEvents = await prisma.eventLog.findMany({
    where: { roomId, eventType: "SWAP_ALL", reverted: false },
    select: { id: true, roundId: true },
  });
  const swapRoundIds = new Set(swapEvents.map((e) => e.roundId));

  // 포인트 "전/후" 값은 다시 계산하지 않고 원장(ScoreTransaction)에서 그대로
  // 읽는다 — 되돌리기가 있어도 각 트랜잭션 자체는 그대로 남기 때문에(보정
  // 트랜잭션을 추가로 쌓는 방식) 그 시점 기준 정답 소스로 쓸 수 있다.
  const [betTxs, swapTxs] = await Promise.all([
    prisma.scoreTransaction.findMany({
      where: {
        roomId,
        teamId: { in: [team1Id, team2Id] },
        sourceType: "BET_RESULT",
        roundId: { not: null },
      },
      select: { roundId: true, teamId: true, pointsBefore: true, pointsAfter: true },
    }),
    swapEvents.length
      ? prisma.scoreTransaction.findMany({
          where: {
            roomId,
            teamId: { in: [team1Id, team2Id] },
            sourceType: "EVENT",
            eventLogId: { in: swapEvents.map((e) => e.id) },
          },
          select: { eventLogId: true, teamId: true, pointsBefore: true, pointsAfter: true },
        })
      : Promise.resolve([]),
  ]);

  const betTxMap = new Map(
    betTxs.map((t) => [
      `${t.roundId}-${t.teamId}`,
      { before: toPoints(t.pointsBefore), after: toPoints(t.pointsAfter) },
    ])
  );

  const swapPointsByEvent = new Map<string, { team1?: SwapPointsEntry; team2?: SwapPointsEntry }>();
  for (const t of swapTxs) {
    if (!t.eventLogId) continue;
    const entry = swapPointsByEvent.get(t.eventLogId) ?? {};
    const points = { before: toPoints(t.pointsBefore), after: toPoints(t.pointsAfter) };
    if (t.teamId === team1Id) entry.team1 = points;
    if (t.teamId === team2Id) entry.team2 = points;
    swapPointsByEvent.set(t.eventLogId, entry);
  }
  const swapPointsByRound = new Map<string, { team1?: SwapPointsEntry; team2?: SwapPointsEntry }>();
  for (const e of swapEvents) {
    if (!e.roundId) continue;
    const points = swapPointsByEvent.get(e.id);
    if (points) swapPointsByRound.set(e.roundId, points);
  }

  const buildTeamResult = (
    results: { teamId: string; outcome: string; finalBetAmount: bigint }[],
    teamId: string,
    multiplier: number,
    roundId: string
  ): RoundHistoryTeamResult | null => {
    const result = results.find((r) => r.teamId === teamId);
    if (!result || result.outcome === "PENDING") return null;
    const finalBet = toPoints(result.finalBetAmount);
    const outcome = result.outcome as "WIN" | "LOSE";
    const magnitude = Math.trunc(finalBet * multiplier);
    const delta = outcome === "WIN" ? magnitude : -magnitude;
    const points = betTxMap.get(`${roundId}-${teamId}`);
    return {
      finalBet,
      outcome,
      delta,
      pointsBefore: points?.before ?? 0,
      pointsAfter: points?.after ?? 0,
    };
  };

  return rounds
    .filter((r) => r.roundResults.length > 0)
    .map((r) => {
      const multiplier = Number(r.multiplier);
      const swap = swapPointsByRound.get(r.id);
      return {
        roundNo: r.roundNo,
        team1: buildTeamResult(r.roundResults, team1Id, multiplier, r.id),
        team2: buildTeamResult(r.roundResults, team2Id, multiplier, r.id),
        multiplier: multiplier !== 1 ? multiplier : null,
        swapAllBefore: swapRoundIds.has(r.id),
        swapTeam1: swap?.team1 ?? null,
        swapTeam2: swap?.team2 ?? null,
      };
    });
}
