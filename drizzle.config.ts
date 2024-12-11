import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// DATABASE_URL이 없을 경우 기본값으로 로컬 SQLite 사용
const dbUrl = process.env.DATABASE_URL || 'file:./sqlite.db';

export default {
  schema: './shared/db/schema.ts',
  out: './shared/db/migrations',
  driver: 'libsql',
  dbCredentials: {
    url: dbUrl,
  },
} satisfies Config; 