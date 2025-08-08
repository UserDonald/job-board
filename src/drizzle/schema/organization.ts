import { relations } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from '../helpers';
import { JobListingTable } from './job-listing';
import { OrganizationUserSettingsTable } from './organization-user-settings';

export const OrganizationTable = pgTable('organizations', {
  id: varchar().primaryKey(),
  name: varchar().notNull(),
  imageUrl: varchar(),
  createdAt,
  updatedAt,
});

export const organizationRelations = relations(
  OrganizationTable,
  ({ many }) => ({
    jobListings: many(JobListingTable),
    organizationUserSettings: many(OrganizationUserSettingsTable),
  })
);
