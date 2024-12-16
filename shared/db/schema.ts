import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  start_date: text('start_date').notNull(),
  end_date: text('end_date').notNull(),
  author: text('author').notNull(),
  status: text('status').notNull(),
  started_at: text('started_at').default(sql`CURRENT_TIMESTAMP`),
  completed_at: text('completed_at').default(sql`CURRENT_TIMESTAMP`),
  estimated_duration: integer('estimated_duration'),
  actual_duration: integer('actual_duration'),
  interruption_count: integer('interruption_count').default(0)
});

export const taskEvents = sqliteTable('task_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  task_id: text('task_id')
    .notNull()
    .references(() => tasks.id),
  event_type: text('event_type').notNull(),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  description: text('description')
});

