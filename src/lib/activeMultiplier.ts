import { prisma } from "@/lib/prisma";

// 배팅 배수는 이번 라운드 결과 계산에 계속 반영되는 "진행 중인 상태"라서
// 어느 화면이든 해당 라운드가 끝나기 전까지는 계속 보여줘야 한다.
// (전체 점수 교환처럼 실행되는 순간 끝나는 이벤트는 여기 포함하지 않는다.)
export async function getActiveMultiplierEvent(
  roomId: string,
  roundId: string | undefined,
  roundStatus: string | undefined
) {
  if (!roundId || roundStatus === "RESOLVED") return null;

  return prisma.eventLog.findFirst({
    where: { roomId, roundId, eventType: "BET_MULTIPLIER", reverted: false },
    orderBy: { executedAt: "desc" },
  });
}
