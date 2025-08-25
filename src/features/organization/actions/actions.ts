'use server';

import {
    getCurrentOrganization,
    getCurrentUser,
} from '@/services/clerk/lib/get-current-auth';
import { z } from 'zod';
import { updateOrganizationUserSettings as updateOrganizationUserSettingsDb } from '../db/organization-user-settings';
import { organizationUserSettingsSchema } from './schemas';

export async function updateOrganizationUserSettings(
  data: z.infer<typeof organizationUserSettingsSchema>
) {
  const { userId } = await getCurrentUser();
  const { orgId } = await getCurrentOrganization();
  if (!userId || !orgId) {
    return {
      error: 'Unauthorized',
      message: 'You must be signed in to update your notification settings.',
    };
  }

  const { success, data: parsedData } =
    organizationUserSettingsSchema.safeParse(data);
  if (!success) {
    return {
      error: 'Invalid data',
      message: 'There was an error updating your notification settings.',
    };
  }

  await updateOrganizationUserSettingsDb(
    { userId, organizationId: orgId },
    parsedData
  );

  return {
    error: false,
    message: 'Successfully updated your notification settings.',
  };
}
