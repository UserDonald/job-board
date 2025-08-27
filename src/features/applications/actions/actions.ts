'use server';

import { db } from '@/drizzle/db';
import {
  ApplicationStage,
  applicationStages,
  JobListingTable,
  UserResumeTable,
} from '@/drizzle/schema';
import {
  getCurrentOrganization,
  getCurrentUser,
} from '@/services/clerk/lib/get-current-auth';
import { hasOrgUserPermission } from '@/services/clerk/lib/org-user-permissions';
import { inngest } from '@/services/inngest/client';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import {
  insertJobListingApplication,
  updateJobListingApplication,
} from '../db/jobListingsApplications';
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

export async function updateJobListingApplicationStage(
  { jobListingId, userId }: { jobListingId: string; userId: string },
  stage: ApplicationStage
) {
  const { success, data: validatedStage } = z
    .enum(applicationStages)
    .safeParse(stage);

  if (!success) {
    return {
      error: true,
      message: "You don't have permission to update the stage",
    };
  }

  if (!(await hasOrgUserPermission('job_listing_applications:change_stage'))) {
    return {
      error: true,
      message: "You don't have permission to update the stage",
    };
  }

  const { orgId } = await getCurrentOrganization();
  const jobListing = await getJobListing(jobListingId);

  if (!orgId || !jobListing || orgId !== jobListing.organizationId) {
    return {
      error: true,
      message: "You don't have permission to update the stage",
    };
  }

  await updateJobListingApplication(
    {
      jobListingId,
      userId,
    },
    {
      stage: validatedStage,
    }
  );
}

export async function updateJobListingApplicationRating(
  {
    jobListingId,
    userId,
  }: {
    jobListingId: string;
    userId: string;
  },
  unsafeRating: number | null
) {
  const { success, data: rating } = z
    .number()
    .min(1)
    .max(5)
    .nullish()
    .safeParse(unsafeRating);

  if (!success) {
    return {
      error: true,
      message: 'Invalid rating',
    };
  }

  if (!(await hasOrgUserPermission('job_listing_applications:change_rating'))) {
    return {
      error: true,
      message: "You don't have permission to update the rating",
    };
  }

  const { orgId } = await getCurrentOrganization();
  const jobListing = await getJobListing(jobListingId);
  if (
    orgId == null ||
    jobListing == null ||
    orgId !== jobListing.organizationId
  ) {
    return {
      error: true,
      message: "You don't have permission to update the rating",
    };
  }

  await updateJobListingApplication(
    {
      jobListingId,
      userId,
    },
    { rating }
  );
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

async function getJobListing(id: string) {
  return db.query.JobListingTable.findFirst({
    where: and(eq(JobListingTable.id, id)),
    columns: { organizationId: true },
  });
}

async function getUserResume(userId: string) {
  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
    columns: { userId: true },
  });
}
