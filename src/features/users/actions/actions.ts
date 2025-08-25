'use server';

import { getCurrentUser } from '@/services/clerk/lib/get-current-auth';
import { z } from 'zod';
import { updateUserNotificationSettings as updateUserNotificationSettingsDb } from '../db/user-notification-settings';
import { userNotificationSettingsSchema } from './schemas';

export async function updateUserNotificationSettings(
  data: z.infer<typeof userNotificationSettingsSchema>
): Promise<{
  error: boolean;
  message: string;
}> {
  const { userId } = await getCurrentUser();
  if (!userId) {
    return {
      error: true,
      message: 'You must be signed in to update notification settings',
    };
  }

  const { success, data: validatedData } =
    userNotificationSettingsSchema.safeParse(data);

  if (!success) {
    return {
      error: true,
      message: 'There was an error updating your notification settings',
    };
  }

  await updateUserNotificationSettingsDb(userId, validatedData);

  return {
    error: false,
    message: 'Successfully updated your notification settings',
  };
}
