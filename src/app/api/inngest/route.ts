import { inngest } from '@/services/inngest/client';
import { rankApplication } from '@/services/inngest/functions/application';
import {
  clerkCreateOrganization,
  clerkCreateOrgMembership,
  clerkCreateUser,
  clerkDeleteOrganization,
  clerkDeleteOrgMembership,
  clerkDeleteUser,
  clerkUpdateOrganization,
  clerkUpdateUser,
} from '@/services/inngest/functions/clerk';
import {
  prepareDailyUserJobListingNotifications,
  sendDailyUserJobListingEmail,
} from '@/services/inngest/functions/email';
import { createAiSummaryOfUploadedResume } from '@/services/inngest/functions/resume';
import { serve } from 'inngest/next';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    clerkCreateUser,
    clerkDeleteUser,
    clerkUpdateUser,
    clerkCreateOrganization,
    clerkUpdateOrganization,
    clerkDeleteOrganization,
    clerkCreateOrgMembership,
    clerkDeleteOrgMembership,
    createAiSummaryOfUploadedResume,
    rankApplication,
    prepareDailyUserJobListingNotifications,
    sendDailyUserJobListingEmail,
  ],
});
