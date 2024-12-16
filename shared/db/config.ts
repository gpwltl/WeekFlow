import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '@/shared/db/schema';

const client = createClient({
  url: 'file:./sqlite.db',  // 로컬 파일 경로
});
