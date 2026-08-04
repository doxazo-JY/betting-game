import { prisma } from "@/lib/prisma";

export async function assertAdmin(roomCode: string, adminToken: string) {
  const room = await prisma.room.findUnique({ where: { code: roomCode } });
  if (!room || room.adminToken !== adminToken) {
    throw new Error("진행자 권한이 없습니다");
  }
  return room;
}

export async function getCurrentRound(roomId: string, currentRound: number) {
  const round = await prisma.round.findUnique({
    where: { roomId_roundNo: { roomId, roundNo: currentRound } },
  });
  if (!round) {
    throw new Error("현재 라운드를 찾을 수 없습니다");
  }
  return round;
}
