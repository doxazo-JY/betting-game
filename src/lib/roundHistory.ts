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
};

// 게임 종료 후에는 배팅 금액을 공개해도 상관없으므로, 라운드별 배팅/결과
// 내역을 정리해서 보여준다.
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
      };
    });
}
