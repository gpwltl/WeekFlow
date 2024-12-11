import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  start_date: text('start_date').notNull(),
  end_date: text('end_date').notNull(),
  author: text('author').notNull(),
  status: text('status', { enum: ['pending', 'in-progress', 'completed'] }).notNull(),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull(),
}); 