import { inngest } from '@/services/inngest/client';
import { rankApplication } from '@/services/inngest/functions/application';
import {
  clerkCreateOrganization,
  clerkCreateUser,
  clerkDeleteOrganization,
  clerkDeleteUser,
  clerkUpdateOrganization,
  clerkUpdateUser,
} from '@/services/inngest/functions/clerk';
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
    createAiSummaryOfUploadedResume,
    rankApplication,
  ],
});
