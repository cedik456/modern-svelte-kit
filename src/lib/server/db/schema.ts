import { pgTable, serial, integer, text, date, timestamp, index } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const achievement = pgTable(
	'achievement',
	{
		id: serial('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		title: text('title').notNull(),
		distanceLabel: text('distance_label'),
		eventDate: date('event_date'),
		location: text('location'),
		finishTime: text('finish_time'),
		pace: text('pace'),
		placement: text('placement'),
		stravaUrl: text('strava_url'),
		description: text('description'),
		imageUrl: text('image_url'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [
		index('achievement_user_id_idx').on(table.userId),
		index('achievement_event_date_idx').on(table.eventDate)
	]
);

export const achievementImage = pgTable(
	'achievement_image',
	{
		id: serial('id').primaryKey(),
		achievementId: integer('achievement_id')
			.notNull()
			.references(() => achievement.id, { onDelete: 'cascade' }),
		fullUrl: text('full_url').notNull(),
		thumbnailUrl: text('thumbnail_url').notNull(),
		sortOrder: integer('sort_order').notNull().default(0),
		width: integer('width'),
		height: integer('height'),
		thumbnailWidth: integer('thumbnail_width'),
		thumbnailHeight: integer('thumbnail_height'),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => [
		index('achievement_image_achievement_id_idx').on(table.achievementId),
		index('achievement_image_sort_order_idx').on(table.sortOrder)
	]
);

export * from './auth.schema';
