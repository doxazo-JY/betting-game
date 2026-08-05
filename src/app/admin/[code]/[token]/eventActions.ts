"use server";

import { prisma } from "@/lib/prisma";
import { assertAdmin, getCurrentRound } from "@/lib/admin";
import { applyScoreDelta } from "@/lib/game";
import { revalidatePath } from "next/cache";

function refresh(roomCode: string, adminToken: string) {
  revalidatePath(`/admin/${roomCode}/${adminToken}`);
}

export async function executeSwapAll(roomCode: string, adminToken: string) {
  const room = await assertAdmin(roomCode, adminToken);
  const round = await getCurrentRound(room.id, room.currentRound);

  const teams = await prisma.team.findMany({ where: { roomId: room.id }, orderBy: { teamNo: "asc" } });
  const [team1, team2] = teams;

  await prisma.$transaction(async (tx) => {
    const eventLog = await tx.eventLog.create({
      data: { roomId: room.id, roundId: round.id, eventType: "SWAP_ALL" },
    });

    const d1 = team2.currentPoints - team1.currentPoints;
    const d2 = team1.currentPoints - team2.currentPoints;

    await applyScoreDelta(tx, {
      roomId: room.id,
      roundId: round.id,
      teamId: team1.id,
      delta: d1,
      sourceType: "EVENT",
      eventLogId: eventLog.id,
    });
    await applyScoreDelta(tx, {
      roomId: room.id,
      roundId: round.id,
      teamId: team2.id,
      delta: d2,
      sourceType: "EVENT",
      eventLogId: eventLog.id,
    });
  });

  refresh(roomCode, adminToken);
}

export async function executeBetMultiplier(roomCode: string, adminToken: string, multiplier: number) {
  const room = await assertAdmin(roomCode, adminToken);
  const round = await getCurrentRound(room.id, room.currentRound);

  if (!multiplier || multiplier <= 0) {
    throw new Error("올바른 배수를 입력해주세요");
  }
  if (round.status === "RESOLVED") {
    throw new Error("이미 결과가 적용된 라운드입니다");
  }

  await prisma.$transaction([
    prisma.eventLog.create({
      data: { roomId: room.id, roundId: round.id, eventType: "BET_MULTIPLIER", params: { multiplier } },
    }),
    prisma.round.update({ where: { id: round.id }, data: { multiplier } }),
  ]);

  refresh(roomCode, adminToken);
}
