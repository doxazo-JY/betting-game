import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// pgbouncer(6543) 트랜잭션 풀링 연결은 이 Prisma/adapter-pg 조합에서
// SASL 인증 오류가 발생해 direct 연결(5432)을 사용한다. 이 앱은 동시
// 접속자가 소수(진행자+팀 2개)라 커넥션 풀링이 필요하지 않다.
const adapter = new PrismaPg(process.env.DIRECT_URL!);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
