// 게임 점수는 DB에는 BigInt로 저장하지만(큰 정수/마이너스 안전 저장),
// 이 앱의 실제 점수 범위는 JS number의 안전 정수 범위를 벗어나지 않으므로
// 서버 액션/컴포넌트 경계에서는 number로 변환해 사용한다.

export function toPoints(value: bigint): number {
  return Number(value);
}

export function toBigIntPoints(value: number): bigint {
  return BigInt(Math.trunc(value));
}

export function isValidBetAmount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    Number.isSafeInteger(value)
  );
}
