import { db } from '@/drizzle/db';
import { OrganizationUserSettingsTable } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';

export async function insertOrganizationUserSettings(
  settings: typeof OrganizationUserSettingsTable.$inferInsert
) {
  await db
    .insert(OrganizationUserSettingsTable)
    .values(settings)
    .onConflictDoNothing();
}

export async function deleteOrganizationUserSettings(
  settings: typeof OrganizationUserSettingsTable.$inferInsert
) {
  await db
    .delete(OrganizationUserSettingsTable)
    .where(
      and(
        eq(OrganizationUserSettingsTable.userId, settings.userId),
        eq(
          OrganizationUserSettingsTable.organizationId,
          settings.organizationId
        )
      )
    );
}

export async function updateOrganizationUserSettings(
  { userId, organizationId }: { userId: string; organizationId: string },
  settings: Partial<
    Pick<
      typeof OrganizationUserSettingsTable.$inferSelect,
      'newApplicationEmailNotifications' | 'minimumRating'
    >
  >
) {
  await db
    .insert(OrganizationUserSettingsTable)
    .values({ ...settings, userId, organizationId })
    .onConflictDoUpdate({
      target: [
        OrganizationUserSettingsTable.userId,
        OrganizationUserSettingsTable.organizationId,
      ],
      set: settings,
    });
}
