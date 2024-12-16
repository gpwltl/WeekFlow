import { sql } from 'drizzle-orm';

export async function up(db: any) {
  await sql`
    -- tasks 테이블에 분석용 컬럼 추가
    ALTER TABLE tasks 
    ADD COLUMN started_at TIMESTAMP NULL,
    ADD COLUMN completed_at TIMESTAMP NULL,
    ADD COLUMN estimated_duration INTEGER NULL,
    ADD COLUMN actual_duration INTEGER NULL,
    ADD COLUMN interruption_count INTEGER DEFAULT 0;

    -- task_events 테이블 생성 (TEXT type의 task_id와 함께)
    CREATE TABLE task_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      description TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    );
  `;
}

export async function down(db: any) {
  await sql`
    -- tasks 테이블에서 분석용 컬럼 제거
    ALTER TABLE tasks 
    DROP COLUMN started_at,
    DROP COLUMN completed_at,
    DROP COLUMN estimated_duration,
    DROP COLUMN actual_duration,
    DROP COLUMN interruption_count;

    -- task_events 테이블 삭제
    DROP TABLE task_events;
  `;
} 

