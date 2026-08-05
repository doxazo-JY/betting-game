import { prisma } from "@/lib/prisma";
import { toPoints } from "@/lib/points";
import { EVENT_LABELS } from "@/lib/eventLabels";
import type { Team } from "@/generated/prisma/client";

export type TeamEventView = {
  id: string;
  title: string;
  myDelta: number | null;
  myPointsBefore: number | null;
  myPointsAfter: number | null;
};

// 이벤트는 항상 양 팀 대상 + 전체 공개이므로, 되돌리지 않은 가장 최근
// 이벤트를 그대로 보여주면 된다.
export async function getVisibleEventForTeam(roomId: string, me: Team): Promise<TeamEventView | null> {
  const event = await prisma.eventLog.findFirst({
    where: { roomId, reverted: false },
    orderBy: { executedAt: "desc" },
  });

  if (!event) return null;

  const tx = await prisma.scoreTransaction.findFirst({
    where: { eventLogId: event.id, teamId: me.id },
  });

  return {
    id: event.id,
    title: EVENT_LABELS[event.eventType],
    myDelta: tx ? toPoints(tx.pointsDelta) : null,
    myPointsBefore: tx ? toPoints(tx.pointsBefore) : null,
    myPointsAfter: tx ? toPoints(tx.pointsAfter) : null,
  };
}
