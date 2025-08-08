import { relations } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from '../helpers';
import { OrganizationUserSettingsTable } from './organization-user-settings';
import { UserNotificationSettingsTable } from './user-notification-settings';
import { UserResumeTable } from './user-resume';

export const UserTable = pgTable('users', {
  id: varchar().primaryKey(),
  name: varchar().notNull(),
  imageUrl: varchar().notNull(),
  email: varchar().notNull().unique(),
  createdAt,
  updatedAt,
});

export const userRelations = relations(UserTable, ({ one, many }) => ({
  notificationSettings: one(UserNotificationSettingsTable),
  resume: one(UserResumeTable),
  organizationUserSettings: many(OrganizationUserSettingsTable),
}));
