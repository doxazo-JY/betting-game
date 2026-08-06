"use server";

import { prisma } from "@/lib/prisma";
import { assertAdmin, getCurrentRound } from "@/lib/admin";
import { computeFinalBetAmount, applyMultiplier } from "@/lib/game";
import { revalidatePath } from "next/cache";
import type { Outcome } from "@/generated/prisma/client";

function refresh(roomCode: string, adminToken: string) {
  revalidatePath(`/admin/${roomCode}/${adminToken}`);
}

export async function startRound(roomCode: string, adminToken: string) {
  const room = await assertAdmin(roomCode, adminToken);
  const round = await getCurrentRound(room.id, room.currentRound);

  if (round.status !== "WAITING") {
    throw new Error("이미 시작된 라운드입니다");
  }

  await prisma.round.update({
    where: { id: round.id },
    data: { status: "BETTING" },
  });

  if (room.status === "SETUP") {
    await prisma.room.update({ where: { id: room.id }, data: { status: "ACTIVE" } });
  }

  refresh(roomCode, adminToken);
}

export async function applyRoundResult(
  roomCode: string,
  adminToken: string,
  winningTeamNo: number
) {
  const room = await assertAdmin(roomCode, adminToken);
  const round = await getCurrentRound(room.id, room.currentRound);

  if (round.status === "RESOLVED") {
    throw new Error("이미 결과가 적용된 라운드입니다");
  }
  if (winningTeamNo !== 1 && winningTeamNo !== 2) {
    throw new Error("승리 팀을 선택해주세요");
  }

  const teams = await prisma.team.findMany({ where: { roomId: room.id }, orderBy: { teamNo: "asc" } });
  const multiplier = Number(round.multiplier);
  const outcomes: Record<number, Outcome> = {
    1: winningTeamNo === 1 ? "WIN" : "LOSE",
    2: winningTeamNo === 2 ? "WIN" : "LOSE",
  };

  await prisma.$transaction(async (tx) => {
    for (const team of teams) {
      const outcome = outcomes[team.teamNo];
      const finalBet = await computeFinalBetAmount(round.id, team.id);
      // 배수는 승패 양쪽에 동일하게 적용된다. 이긴 팀은 배팅액 × 배수를 얻고,
      // 진 팀도 배팅액 × 배수를 잃는다.
      const magnitude = applyMultiplier(finalBet, multiplier);
      const delta = outcome === "WIN" ? magnitude : -magnitude;
      const before = team.currentPoints;
      const after = before + delta;

      const result = await tx.roundResult.create({
        data: {
          roundId: round.id,
          teamId: team.id,
          outcome,
          finalBetAmount: finalBet,
          applied: true,
          appliedAt: new Date(),
        },
      });

      await tx.team.update({ where: { id: team.id }, data: { currentPoints: after } });

      await tx.scoreTransaction.create({
        data: {
          roomId: room.id,
          roundId: round.id,
          teamId: team.id,
          sourceType: "BET_RESULT",
          sourceId: result.id,
          pointsBefore: before,
          pointsDelta: delta,
          pointsAfter: after,
        },
      });
    }

    await tx.round.update({ where: { id: round.id }, data: { status: "RESOLVED" } });
  });

  refresh(roomCode, adminToken);
}

export async function setParticipantsLocked(
  roomCode: string,
  adminToken: string,
  locked: boolean
) {
  const room = await assertAdmin(roomCode, adminToken);
  await prisma.room.update({ where: { id: room.id }, data: { participantsLocked: locked } });
  refresh(roomCode, adminToken);
}

export async function nextRound(roomCode: string, adminToken: string) {
  const room = await assertAdmin(roomCode, adminToken);
  const round = await getCurrentRound(room.id, room.currentRound);

  if (round.status !== "RESOLVED") {
    throw new Error("현재 라운드 결과가 아직 적용되지 않았습니다");
  }

  const nextRoundNo = room.currentRound + 1;
  await prisma.$transaction([
    prisma.room.update({ where: { id: room.id }, data: { currentRound: nextRoundNo } }),
    prisma.round.create({ data: { roomId: room.id, roundNo: nextRoundNo } }),
  ]);

  refresh(roomCode, adminToken);
}
