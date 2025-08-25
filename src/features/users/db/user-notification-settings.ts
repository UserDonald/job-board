import { db } from '@/drizzle/db';
import { UserNotificationSettingsTable } from '@/drizzle/schema';

export async function insertUserNotificationSettings(
  settings: typeof UserNotificationSettingsTable.$inferInsert
) {
  await db
    .insert(UserNotificationSettingsTable)
    .values(settings)
    .onConflictDoNothing();
}

export async function updateUserNotificationSettings(
  userId: string,
  settings: Partial<
    Omit<typeof UserNotificationSettingsTable.$inferInsert, 'userId'>
  >
) {
  await db
    .insert(UserNotificationSettingsTable)
    .values({
      userId,
      ...settings,
    })
    .onConflictDoUpdate({
      target: [UserNotificationSettingsTable.userId],
      set: settings,
    });
}
