import { pgTable, uuid, text, bigint, integer, timestamp, index } from 'drizzle-orm/pg-core';

export const folders = pgTable('folders', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  createdAtIdx: index('idx_folders_created_at').on(table.createdAt),
}));

export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  folderId: uuid('folder_id').references(() => folders.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  fileName: text('file_name').notNull(),
  fileSize: bigint('file_size', { mode: 'number' }),
  duration: integer('duration'),
  format: text('format'),
  storagePath: text('storage_path').notNull(),
  thumbnailPath: text('thumbnail_path'),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  folderIdIdx: index('idx_videos_folder_id').on(table.folderId),
  createdAtIdx: index('idx_videos_created_at').on(table.createdAt),
}));

export const subtitles = pgTable('subtitles', {
  id: uuid('id').primaryKey().defaultRandom(),
  videoId: uuid('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  language: text('language').notNull(),
  label: text('label').notNull(),
  fileName: text('file_name').notNull(),
  storagePath: text('storage_path').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  videoIdIdx: index('idx_subtitles_video_id').on(table.videoId),
}));
