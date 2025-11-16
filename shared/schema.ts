import { pgTable, uuid, text, timestamp, bigint, integer } from 'drizzle-orm/pg-core';

export const folders = pgTable('folders', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  folder_id: uuid('folder_id').references(() => folders.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  file_name: text('file_name').notNull(),
  file_size: bigint('file_size', { mode: 'number' }),
  duration: integer('duration'),
  format: text('format'),
  storage_path: text('storage_path').notNull(),
  thumbnail_path: text('thumbnail_path'),
  view_count: integer('view_count').default(0),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const subtitles = pgTable('subtitles', {
  id: uuid('id').primaryKey().defaultRandom(),
  video_id: uuid('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  language: text('language').notNull(),
  label: text('label').notNull(),
  file_name: text('file_name').notNull(),
  storage_path: text('storage_path').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
