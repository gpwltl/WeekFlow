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
        status TEXT CHECK(status IN ('pending', 'in-progress', 'completed')) NOT NULL
      );
    `);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

main(); 