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

  // 점수 교환과 배팅 배수 모두 라운드 시작 전(WAITING)에만 실행할 수 있다.
  // 상태가 섞여 있으면 두 버튼이 언제 나오는지 헷갈린다는 피드백으로 통일함.
  if (round.status !== "WAITING") {
    throw new Error("배팅이 시작된 라운드에는 점수 교환을 실행할 수 없습니다. 라운드 시작 전에 실행해주세요");
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
