import { prisma } from "@/lib/prisma";
import { toPoints } from "@/lib/points";

export type RoundHistoryTeamResult = {
  finalBet: number;
  outcome: "WIN" | "LOSE";
  delta: number;
};

export type RoundHistoryEntry = {
  roundNo: number;
  team1: RoundHistoryTeamResult | null;
  team2: RoundHistoryTeamResult | null;
  multiplier: number | null;
  swapAllBefore: boolean;
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
    select: { roundId: true },
  });
  const swapRoundIds = new Set(swapEvents.map((e) => e.roundId));

  const buildTeamResult = (
    results: { teamId: string; outcome: string; finalBetAmount: bigint }[],
    teamId: string,
    multiplier: number
  ): RoundHistoryTeamResult | null => {
    const result = results.find((r) => r.teamId === teamId);
    if (!result || result.outcome === "PENDING") return null;
    const finalBet = toPoints(result.finalBetAmount);
    const outcome = result.outcome as "WIN" | "LOSE";
    const magnitude = Math.trunc(finalBet * multiplier);
    const delta = outcome === "WIN" ? magnitude : -magnitude;
    return { finalBet, outcome, delta };
  };

  return rounds
    .filter((r) => r.roundResults.length > 0)
    .map((r) => {
      const multiplier = Number(r.multiplier);
      return {
        roundNo: r.roundNo,
        team1: buildTeamResult(r.roundResults, team1Id, multiplier),
        team2: buildTeamResult(r.roundResults, team2Id, multiplier),
        multiplier: multiplier !== 1 ? multiplier : null,
        swapAllBefore: swapRoundIds.has(r.id),
      };
    });
}
