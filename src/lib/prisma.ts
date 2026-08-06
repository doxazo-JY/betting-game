import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// DIRECT_URL(5432)은 이름과 달리 실제로는 Supabase의 세션 모드 풀러를
// 거치고 있어서(Supavisor), pool_size(예: 15)를 넘으면 EMAXCONNSESSION
// 에러로 즉시 거부된다(2026-08-06, 실사용 테스트 중 재현) — 사용자 수가
// 적어도, Next.js 라우트마다 별도 서버리스 인스턴스가 뜨고 그 인스턴스마다
// PrismaPg가 자체 pg.Pool(기본 max 10)을 새로 만들기 때문에 인스턴스
// 몇 개만 겹쳐도 쉽게 넘길 수 있다. DATABASE_URL(6543, pgbouncer=true)
// 트랜잭션 모드는 이 인스턴스별 풀들이 전부 Supavisor라는 중앙 풀러의
// 클라이언트가 되는 구조라, 인스턴스가 몇 개 뜨든 실제 Postgres 백엔드
// 연결 수는 풀러가 중앙에서 제한한다 — 다만 실제로 몇 대까지 버티는지는
// 아직 실측 전이라, 행사 전 부하 테스트로 확인 필요.
const adapter = new PrismaPg(process.env.DATABASE_URL!);

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
