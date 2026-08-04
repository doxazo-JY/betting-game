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

export async function confirmBet(
  roomCode: string,
  teamToken: string,
  amount: number,
  betType: "NORMAL" | "FORCED_EXTRA" = "NORMAL"
) {
  if (!isValidBetAmount(amount)) {
    throw new Error("올바른 배팅 금액을 입력해주세요");
  }

  const { room, team } = await requireTeam(roomCode, teamToken);
  const round = await getCurrentRound(room.id, room.currentRound);

  const existing = await prisma.bet.findUnique({
    where: {
      roundId_teamId_betType: { roundId: round.id, teamId: team.id, betType },
    },
  });
  if (existing?.confirmed) {
    throw new Error("이미 배팅을 확정했습니다");
  }

  const betAmount = toBigIntPoints(amount);

  if (betType === "NORMAL") {
    if (round.status !== "BETTING") {
      throw new Error("지금은 배팅할 수 있는 시간이 아닙니다");
    }
    const maxBet = team.currentPoints > BigInt(0) ? team.currentPoints : room.negativeBetLimit;
    if (betAmount > maxBet) {
      throw new Error(`배팅 가능한 최대 금액은 ${maxBet.toLocaleString()}P 입니다`);
    }
  } else {
    const request = await prisma.extraBetRequest.findUnique({
      where: { roundId_teamId: { roundId: round.id, teamId: team.id } },
    });
    if (!request || request.status !== "PENDING") {
      throw new Error("진행 중인 추가 배팅 요청이 없습니다");
    }
    if (betAmount < request.minAmount || (request.maxAmount !== null && betAmount > request.maxAmount)) {
      throw new Error("허용된 범위를 벗어난 금액입니다");
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.bet.upsert({
      where: {
        roundId_teamId_betType: { roundId: round.id, teamId: team.id, betType },
      },
      create: {
        roundId: round.id,
        teamId: team.id,
        betType,
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

    if (betType === "FORCED_EXTRA") {
      await tx.extraBetRequest.update({
        where: { roundId_teamId: { roundId: round.id, teamId: team.id } },
        data: { status: "SUBMITTED" },
      });
    }
  });

  revalidatePath(`/play/${roomCode}/${teamToken}`);
}
