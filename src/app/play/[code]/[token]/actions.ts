"use server";

import { prisma } from "@/lib/prisma";
import { toBigIntPoints, isValidBetAmount } from "@/lib/points";
import { getCurrentRound } from "@/lib/admin";
import { revalidatePath } from "next/cache";

async function requireTeam(roomCode: string, teamToken: string) {
  const room = await prisma.room.findUnique({ where: { code: roomCode } });
  if (!room) {
    throw new Error("존재하지 않는 게임방입니다");
  }

  const team = await prisma.team.findFirst({
    where: { roomId: room.id, accessToken: teamToken },
  });
  if (!team) {
    throw new Error("잘못된 접속 링크입니다");
  }

  return { room, team };
}

export async function confirmBet(roomCode: string, teamToken: string, amount: number) {
  if (!isValidBetAmount(amount)) {
    throw new Error("올바른 배팅 금액을 입력해주세요");
  }

  const { room, team } = await requireTeam(roomCode, teamToken);
  const round = await getCurrentRound(room.id, room.currentRound);

  if (round.status !== "BETTING") {
    throw new Error("지금은 배팅할 수 있는 시간이 아닙니다");
  }

  const existing = await prisma.bet.findUnique({
    where: {
      roundId_teamId_betType: { roundId: round.id, teamId: team.id, betType: "NORMAL" },
    },
  });
  if (existing?.confirmed) {
    throw new Error("이미 배팅을 확정했습니다");
  }

  const maxBet =
    team.currentPoints > BigInt(0) ? team.currentPoints : room.negativeBetLimit;
  const betAmount = toBigIntPoints(amount);
  if (betAmount > maxBet) {
    throw new Error(`배팅 가능한 최대 금액은 ${maxBet.toLocaleString()}P 입니다`);
  }

  await prisma.bet.upsert({
    where: {
      roundId_teamId_betType: { roundId: round.id, teamId: team.id, betType: "NORMAL" },
    },
    create: {
      roundId: round.id,
      teamId: team.id,
      betType: "NORMAL",
      amount: betAmount,
      confirmed: true,
      confirmedAt: new Date(),
    },
    update: {
      amount: betAmount,
      confirmed: true,
      confirmedAt: new Date(),
    },
  });

  revalidatePath(`/play/${roomCode}/${teamToken}`);
}
