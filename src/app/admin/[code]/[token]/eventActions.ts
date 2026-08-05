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

  // 점수 교환은 라운드 진행(배팅)에 영향을 주는 이벤트가 아니라 그 순간 바로
  // 점수가 바뀌는 이벤트라, 라운드가 진행 중일 때(배팅 중)는 실행할 수 없다.
  if (round.status === "BETTING") {
    throw new Error("배팅이 진행 중일 때는 점수 교환을 실행할 수 없습니다. 라운드 시작 전이나 결과가 나온 후에 실행해주세요");
  }

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
  // 배팅이 시작된 뒤에는 배수를 바꿀 수 없다 (라운드 시작 전에만 설정 가능).
  if (round.status !== "WAITING") {
    throw new Error("배팅이 시작된 라운드에는 배팅 배수를 설정할 수 없습니다. 라운드 시작 전에 설정해주세요");
  }

  await prisma.$transaction([
    prisma.eventLog.create({
      data: { roomId: room.id, roundId: round.id, eventType: "BET_MULTIPLIER", params: { multiplier } },
    }),
    prisma.round.update({ where: { id: round.id }, data: { multiplier } }),
  ]);

  refresh(roomCode, adminToken);
}
