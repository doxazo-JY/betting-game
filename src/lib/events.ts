import { prisma } from "@/lib/prisma";
import { toPoints } from "@/lib/points";
import { EVENT_LABELS } from "@/lib/eventLabels";
import type { EventLog, Team } from "@/generated/prisma/client";

export type TeamEventView = {
  id: string;
  title: string;
  isMine: boolean;
  myDelta: number | null;
  myPointsBefore: number | null;
  myPointsAfter: number | null;
  needsAction: boolean;
  executedAt: Date;
};

function isTargeted(scope: EventLog["targetScope"], team: Team) {
  return scope === "BOTH" || (scope === "TEAM1" && team.teamNo === 1) || (scope === "TEAM2" && team.teamNo === 2);
}

export async function getVisibleEventForTeam(
  roomId: string,
  me: Team,
  opponent: Team
): Promise<TeamEventView | null> {
  const events = await prisma.eventLog.findMany({
    where: { roomId, reverted: false },
    orderBy: { executedAt: "desc" },
    take: 10,
  });

  for (const event of events) {
    const mine = isTargeted(event.targetScope, me);
    const opponentTargeted = isTargeted(event.targetScope, opponent);

    let visible = false;
    let showName = false;

    if (mine) {
      visible = true;
      showName = event.revealMode === "PUBLIC" || event.revealMode === "TARGET_ONLY";
    } else if (opponentTargeted) {
      if (event.revealMode === "PUBLIC") {
        visible = true;
        showName = true;
      } else if (event.revealMode === "ANNOUNCE_ONLY") {
        visible = true;
        showName = false;
      }
    }

    if (!visible) continue;

    if (!mine) {
      return {
        id: event.id,
        title: showName ? EVENT_LABELS[event.eventType] : "이벤트 발생",
        isMine: false,
        myDelta: null,
        myPointsBefore: null,
        myPointsAfter: null,
        needsAction: false,
        executedAt: event.executedAt,
      };
    }

    const tx = await prisma.scoreTransaction.findFirst({
      where: { eventLogId: event.id, teamId: me.id },
    });

    const pendingExtraBet = await prisma.extraBetRequest.findFirst({
      where: { roundId: event.roundId ?? undefined, teamId: me.id, status: "PENDING" },
    });

    return {
      id: event.id,
      title: showName ? EVENT_LABELS[event.eventType] : "🔒 비밀 이벤트",
      isMine: true,
      myDelta: tx ? toPoints(tx.pointsDelta) : null,
      myPointsBefore: tx ? toPoints(tx.pointsBefore) : null,
      myPointsAfter: tx ? toPoints(tx.pointsAfter) : null,
      needsAction: !!pendingExtraBet,
      executedAt: event.executedAt,
    };
  }

  return null;
}
