import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

type TxClient = Prisma.TransactionClient;

export async function applyScoreDelta(
  tx: TxClient,
  params: {
    roomId: string;
    roundId?: string | null;
    teamId: string;
    delta: bigint;
    sourceType: "EVENT" | "MANUAL_ADJUST" | "REVERT";
    sourceId?: string | null;
    eventLogId?: string | null;
    memo?: string | null;
  }
) {
  const team = await tx.team.findUniqueOrThrow({ where: { id: params.teamId } });
  const before = team.currentPoints;
  const after = before + params.delta;

  await tx.team.update({ where: { id: params.teamId }, data: { currentPoints: after } });

  await tx.scoreTransaction.create({
    data: {
      roomId: params.roomId,
      roundId: params.roundId ?? null,
      teamId: params.teamId,
      sourceType: params.sourceType,
      sourceId: params.sourceId ?? null,
      eventLogId: params.eventLogId ?? null,
      pointsBefore: before,
      pointsDelta: params.delta,
      pointsAfter: after,
      memo: params.memo ?? null,
    },
  });

  return { before, after };
}

export async function computeFinalBetAmount(roundId: string, teamId: string): Promise<bigint> {
  const bet = await prisma.bet.findUnique({ where: { roundId_teamId: { roundId, teamId } } });
  return bet?.confirmed ? bet.amount : BigInt(0);
}

// 소수점은 0을 향해 버림 처리 (trunc)
export function applyMultiplier(amount: bigint, multiplier: number): bigint {
  const truncated = Math.trunc(Number(amount) * multiplier);
  return BigInt(truncated);
}
