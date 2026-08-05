"use server";

import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

function refresh(roomCode: string, adminToken: string) {
  revalidatePath(`/admin/${roomCode}/${adminToken}`);
  revalidatePath(`/admin/${roomCode}/${adminToken}/history`);
}

export async function endGame(roomCode: string, adminToken: string) {
  const room = await assertAdmin(roomCode, adminToken);
  await prisma.room.update({ where: { id: room.id }, data: { status: "ENDED" } });
  refresh(roomCode, adminToken);
}

export async function resetRoom(roomCode: string, adminToken: string, confirmText: string) {
  const room = await assertAdmin(roomCode, adminToken);

  if (confirmText !== "초기화") {
    throw new Error("확인 문구가 일치하지 않습니다");
  }

  const roundIds = (await prisma.round.findMany({ where: { roomId: room.id }, select: { id: true } })).map(
    (r) => r.id
  );

  await prisma.$transaction([
    prisma.scoreTransaction.deleteMany({ where: { roomId: room.id } }),
    prisma.eventLog.deleteMany({ where: { roomId: room.id } }),
    prisma.roundResult.deleteMany({ where: { roundId: { in: roundIds } } }),
    prisma.bet.deleteMany({ where: { roundId: { in: roundIds } } }),
    prisma.round.deleteMany({ where: { roomId: room.id } }),
    prisma.team.updateMany({ where: { roomId: room.id }, data: { currentPoints: room.startPoints } }),
    prisma.round.create({ data: { roomId: room.id, roundNo: 1 } }),
    prisma.room.update({ where: { id: room.id }, data: { currentRound: 1, status: "SETUP" } }),
  ]);

  refresh(roomCode, adminToken);
}
