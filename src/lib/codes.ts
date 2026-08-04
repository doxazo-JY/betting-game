import { randomBytes, randomUUID } from "crypto";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 헷갈리는 0/O/1/I 제외

function randomCode(length: number): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  }
  return out;
}

export function generateRoomCode(): string {
  return randomCode(6);
}

// 팀 접속은 코드를 직접 입력하지 않고 링크 클릭으로 이루어지므로
// 사람이 타이핑하기 쉬운 짧은 코드 대신 추측 불가능한 토큰을 사용한다.
export function generateTeamToken(): string {
  return randomUUID();
}

export function generateAdminToken(): string {
  return randomUUID();
}
