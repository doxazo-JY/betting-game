"use server";

import { prisma } from "@/lib/prisma";
import { assertAdmin, getCurrentRound } from "@/lib/admin";
import { applyScoreDelta } from "@/lib/game";
import { toBigIntPoints } from "@/lib/points";
import { revalidatePath } from "next/cache";
import type { EventType, TargetScope, RevealMode } from "@/generated/prisma/client";

function refresh(roomCode: string, adminToken: string) {
  revalidatePath(`/admin/${roomCode}/${adminToken}`);
}

export type EventParams = {
  amount?: number;
  fromTeamNo?: number;
  multiplier?: number;
  minAmount?: number;
  maxAmount?: number;
  reason?: string;
};

export async function executeEvent(
  roomCode: string,
  adminToken: string,
  eventType: EventType,
  targetScope: TargetScope,
  params: EventParams,
  revealMode: RevealMode,
  memo?: string
) {
  const room = await assertAdmin(roomCode, adminToken);
  const round = await getCurrentRound(room.id, room.currentRound);

  const teams = await prisma.team.findMany({ where: { roomId: room.id }, orderBy: { teamNo: "asc" } });
  const team1 = teams.find((t) => t.teamNo === 1)!;
  const team2 = teams.find((t) => t.teamNo === 2)!;

  await prisma.$transaction(async (tx) => {
    const eventLog = await tx.eventLog.create({
      data: {
        roomId: room.id,
        roundId: round.id,
        eventType,
        targetScope,
        revealMode,
        params: params as object,
        memo: memo ?? null,
      },
    });

    const targets: string[] = [];
    if (targetScope === "TEAM1" || targetScope === "BOTH") targets.push(team1.id);
    if (targetScope === "TEAM2" || targetScope === "BOTH") targets.push(team2.id);

    switch (eventType) {
      case "GIVE_POINTS":
      case "DEDUCT_POINTS": {
        if (params.amount === undefined || params.amount < 0) {
          throw new Error("지급/차감할 포인트를 입력해주세요");
        }
        const amount = toBigIntPoints(params.amount);
        const delta = eventType === "GIVE_POINTS" ? amount : -amount;
        for (const teamId of targets) {
          await applyScoreDelta(tx, {
            roomId: room.id,
            roundId: round.id,
            teamId,
            delta,
            sourceType: "EVENT",
            eventLogId: eventLog.id,
          });
        }
        break;
      }

      case "TRANSFER_POINTS": {
        if (params.amount === undefined || params.amount < 0) {
          throw new Error("이전할 포인트를 입력해주세요");
        }
        if (params.fromTeamNo !== 1 && params.fromTeamNo !== 2) {
          throw new Error("보내는 팀을 선택해주세요");
        }
        const amount = toBigIntPoints(params.amount);
        const from = params.fromTeamNo === 1 ? team1 : team2;
        const to = params.fromTeamNo === 1 ? team2 : team1;
        await applyScoreDelta(tx, {
          roomId: room.id,
          roundId: round.id,
          teamId: from.id,
          delta: -amount,
          sourceType: "EVENT",
          eventLogId: eventLog.id,
        });
        await applyScoreDelta(tx, {
          roomId: room.id,
          roundId: round.id,
          teamId: to.id,
          delta: amount,
          sourceType: "EVENT",
          eventLogId: eventLog.id,
        });
        break;
      }

      case "SWAP_ALL": {
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
        break;
      }

      case "BET_MULTIPLIER": {
        if (!params.multiplier || params.multiplier <= 0) {
          throw new Error("올바른 배수를 입력해주세요");
        }
        if (round.status === "RESOLVED") {
          throw new Error("이미 결과가 적용된 라운드입니다");
        }
        await tx.round.update({ where: { id: round.id }, data: { multiplier: params.multiplier } });
        break;
      }

      case "ASSIGNED_EXTRA_BET": {
        if (params.amount === undefined || params.amount < 0) {
          throw new Error("추가 배팅 금액을 입력해주세요");
        }
        const amount = toBigIntPoints(params.amount);
        for (const teamId of targets) {
          await tx.bet.upsert({
            where: { roundId_teamId_betType: { roundId: round.id, teamId, betType: "FORCED_EXTRA" } },
            create: {
              roundId: round.id,
              teamId,
              betType: "FORCED_EXTRA",
              amount,
              confirmed: true,
              confirmedAt: new Date(),
            },
            update: { amount, confirmed: true, confirmedAt: new Date() },
          });
        }
        break;
      }

      case "FORCED_EXTRA_BET": {
        const minAmount = toBigIntPoints(params.minAmount ?? 0);
        const maxAmount =
          params.maxAmount !== undefined ? toBigIntPoints(params.maxAmount) : null;
        for (const teamId of targets) {
          await tx.extraBetRequest.upsert({
            where: { roundId_teamId: { roundId: round.id, teamId } },
            create: {
              roundId: round.id,
              teamId,
              minAmount,
              maxAmount,
              reason: params.reason ?? null,
              status: "PENDING",
            },
            update: {
              minAmount,
              maxAmount,
              reason: params.reason ?? null,
              status: "PENDING",
            },
          });
        }
        break;
      }

      default:
        throw new Error("알 수 없는 이벤트 종류입니다");
    }
  });

  refresh(roomCode, adminToken);
}
