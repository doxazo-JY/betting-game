import type { EventType } from "@/generated/prisma/client";

export const EVENT_LABELS: Record<EventType, string> = {
  SWAP_ALL: "전체 점수 교환",
  BET_MULTIPLIER: "배팅 배수",
};
