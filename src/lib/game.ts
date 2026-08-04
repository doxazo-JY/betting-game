import { prisma } from "@/lib/prisma";

export async function computeFinalBetAmount(roundId: string, teamId: string): Promise<bigint> {
  const bets = await prisma.bet.findMany({
    where: { roundId, teamId, confirmed: true },
  });
  return bets.reduce((sum, b) => sum + b.amount, BigInt(0));
}

// 소수점은 0을 향해 버림 처리 (trunc)
export function applyMultiplier(amount: bigint, multiplier: number): bigint {
  const truncated = Math.trunc(Number(amount) * multiplier);
  return BigInt(truncated);
}
