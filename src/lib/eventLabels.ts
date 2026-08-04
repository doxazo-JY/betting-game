import type { EventType } from "@/generated/prisma/client";

export const EVENT_LABELS: Record<EventType, string> = {
  GIVE_POINTS: "점수 지급",
  DEDUCT_POINTS: "점수 차감",
  TRANSFER_POINTS: "점수 이전",
  SWAP_ALL: "전체 점수 교환",
  BET_MULTIPLIER: "배팅 배수",
  ASSIGNED_EXTRA_BET: "진행자 지정 추가 배팅",
  FORCED_EXTRA_BET: "강제 추가 배팅",
};
