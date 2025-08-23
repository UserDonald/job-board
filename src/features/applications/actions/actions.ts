'use server';

import { db } from '@/drizzle/db';
import { JobListingTable, UserResumeTable } from '@/drizzle/schema';
import { getCurrentUser } from '@/services/clerk/lib/get-current-auth';
import { inngest } from '@/services/inngest/client';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { insertJobListingApplication } from '../db/jobListingsApplications';
import { newJobListingApplicationSchema } from './schemas';

export async function createJobListingApplication(
  jobListingId: string,
  data: z.infer<typeof newJobListingApplicationSchema>
): Promise<{
  error: boolean;
  message: string;
}> {
  const permissionError = {
    error: true,
    message: "You don't have permissions to submit an application",
  };

  const { userId } = await getCurrentUser();
  if (userId == null) return permissionError;

  const [userResume, jobListing] = await Promise.all([
    getUserResume(userId),
    getPublicJobListing(jobListingId),
  ]);

  if (userResume == null || jobListing == null) return permissionError;

  const { success, data: validatedData } =
    newJobListingApplicationSchema.safeParse(data);

  if (!success)
    return {
      error: true,
      message: 'There was an error submitting your application',
    };

  await insertJobListingApplication({
    jobListingId,
    userId,
    ...validatedData,
  });

  // TODO: AI Generation

  await inngest.send({
    name: 'app/jobListingApplication.created',
    data: {
      jobListingId,
      userId,
    },
  });

  return {
    error: false,
    message: 'Your application was successfully submitted',
  };
}

async function getPublicJobListing(id: string) {
  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.status, 'published')
    ),
    columns: { id: true },
  });
}

async function getUserResume(userId: string) {
  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
    columns: { userId: true },
  });
}
