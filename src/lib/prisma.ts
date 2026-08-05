import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// pgbouncer(6543) 트랜잭션 풀링 연결은 이 Prisma/adapter-pg 조합에서
// SASL 인증 오류가 발생해 direct 연결(5432)을 사용한다. 이 앱은 동시
// 접속자가 소수(진행자+팀 2개)라 커넥션 풀링이 필요하지 않다.
const adapter = new PrismaPg(process.env.DIRECT_URL!);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 개발 환경에서는 globalThis에 캐싱하지 않는다. 캐싱하면 Prisma 스키마를
// 바꿔서 클라이언트를 재생성해도 이미 만들어진 인스턴스를 계속 재사용해
// 반영되지 않아, 스키마가 바뀔 때마다 서버 프로세스를 완전히 재시작해야
// 했다. 개발 중 트래픽은 적어 모듈이 재평가될 때마다 새로 연결해도 무방하다.
export const prisma =
  process.env.NODE_ENV === "production"
    ? (globalForPrisma.prisma ?? new PrismaClient({ adapter }))
    : new PrismaClient({ adapter });

if (process.env.NODE_ENV === "production") {
  globalForPrisma.prisma = prisma;
}
