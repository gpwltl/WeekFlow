import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';
import path from 'path';

async function main() {
  const client = createClient({
    url: `file:${path.join(process.cwd(), 'sqlite.db')}`,
  });

  const db = drizzle(client);

  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        author TEXT NOT NULL,
        status TEXT CHECK(status IN ('pending', 'in-progress', 'completed')) NOT NULL,
        
        -- 분석용 컬럼들 추가
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        estimated_duration INTEGER,
        actual_duration INTEGER,
        interruption_count INTEGER DEFAULT 0
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS task_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        description TEXT
      );
    `);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

main(); 